import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";
import { checkPermission, unauthorizedResponse, forbiddenResponse, getSession } from "@/lib/auth";
import { getDemoGoalsData } from "@/lib/guestSession";
import { awardXP } from "@/lib/gamification";

export const runtime = "nodejs";

export async function GET() {
    try {
        // Get authenticated user from session (null for guests)
        const user = await getSession();

        // Guest users: Return demo data
        if (!user) {
            console.log('[GPS GET] Guest user - returning demo data');
            return NextResponse.json(getDemoGoalsData());
        }

        // Authenticated users: Check GPS access permission
        const permission = await checkPermission(user, 'gps');

        console.log('[GPS GET] Permission result:', permission);

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            orderBy: { order: 'asc' } as any,
            include: {
                okrs: {
                    orderBy: { order: 'asc' } as any,
                    include: {
                        actions: {
                            orderBy: { order: 'asc' } as any
                        } as any,
                        sharedTribes: true,
                    }
                } as any
            }
        });

        // Map database format to include all fields
        const mappedGoals = goals.map(g => ({
            ...g,
            okrs: g.okrs.map(okr => ({
                ...okr,
                monthlyData: okr.monthlyData ? JSON.parse(okr.monthlyData) : null,
                direction: (okr as any).direction || 'UP'
            }))
        }));

        return NextResponse.json(mappedGoals);
    } catch (error) {
        console.error("GET Goals Error:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}

import { isRestricted, LIMITS, UserSubscriptionData } from "@/lib/subscription";

// ... existing imports

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Get authenticated user from session
        const user = await getSession();

        // Block guest users from saving
        // Guest users: Allow fake save (Echo back data with fake IDs)
        if (!user) {
            console.log('[GPS POST] Guest user - Mocking save');
            const { id, title, category, isShared, rows } = data;
            const mockId = id && !id.startsWith('new') ? id : `guest-goal-${Date.now()}`;

            // Construct mock response
            const mockResponse = {
                id: mockId,
                vision: title,
                status: "ACTIVE",
                visibility: isShared ? "TRIBE" : "PRIVATE",
                category: category || "Business/Career",
                okrs: rows ? rows.filter((r: any) => r.type === 'OKR' || r.type === 'KPI').map((r: any, i: number) => ({
                    id: r.id && !r.id.startsWith('new') ? r.id : `guest-okr-${Date.now()}-${i}`,
                    goalId: mockId,
                    metricName: r.label,
                    type: r.type,
                    targetValue: r.targetValue,
                    currentValue: r.startValue,
                    startYear: r.startYear || 2026,
                    startMonth: r.startMonth || 0,
                    deadlineYear: r.deadlineYear || 2026,
                    deadlineMonth: r.deadlineMonth || 11,
                    direction: r.direction || 'UP',
                    actions: rows.find((ar: any) => !ar.type && ar.actions)?.actions?.map((a: any, j: number) => ({
                        id: a.id && !a.id.startsWith('act-') ? a.id : `guest-act-${Date.now()}-${j}`,
                        description: a.title,
                        status: a.status === 'DONE' ? 'DONE' : 'NOT_DONE',
                        weekDate: new Date().toISOString(), // Simplified
                        dueDate: new Date().toISOString()
                    })) || []
                })) : []
            };

            return NextResponse.json(mockResponse);
        }

        // Fetch full profile for subscription check
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                userProfile: true,
                subscriptionStatus: true,
                trialEndDate: true
            }
        });

        if (isRestricted(profile as UserSubscriptionData)) {
            const { id, rows } = data;
            const isNewGoal = !id || id === 'NEW' || !id.startsWith('c');

            // 1. Goal Limit Check (Max 3)
            if (isNewGoal) {
                const goalCount = await prisma.goal.count({ where: { userId: user.id } });
                if (goalCount >= LIMITS.GOALS) {
                    return NextResponse.json({
                        error: "Goal limit reached",
                        message: `Your free plan is limited to ${LIMITS.GOALS} goals. Upgrade to add more.`
                    }, { status: 403 });
                }
            }

            // 2. KPI Limit Check (Max 9)
            // Simplified check: Count KPIs in the current payload. 
            // Ideally we count total user KPIs, but that's expensive.
            // Let's count existing + new in this payload ?? Or just total in DB?
            // "9 KPIs max" -> Total across ALL goals. 

            // Let's fetch total current KPIs
            const kpiCount = await prisma.oKR.count({
                where: {
                    goal: { userId: user.id },
                    type: 'KPI'
                }
            });

            // Count new KPIs in this request
            // const newKpisInRequest = rows?.filter((r: any) => r.type === 'KPI' && (!r.id || r.id.startsWith('new') || r.id.startsWith('kpi-'))).length || 0;
            // Actually, if we are just UPDATING an existing one it's fine.
            // But if we are adding new ones...

            // Re-evaluating logic: If current total >= 9, prevent creating NEW KPIs.
            // Existing KPIs can be updated.

            if (rows) {
                const newKpisRequest = rows.filter((r: any) =>
                    r.type === 'KPI' &&
                    (!r.id || r.id.startsWith('new') || r.id.startsWith('kpi-') || r.id.length < 10)
                ).length;

                if (kpiCount + newKpisRequest > LIMITS.KPIS) {
                    return NextResponse.json({
                        error: "KPI limit reached",
                        message: `Your free plan is limited to ${LIMITS.KPIS} KPIs. Upgrade to add more.`
                    }, { status: 403 });
                }
            }
        }

        // Check GPS access permission (Permission logic might be redundant with restriction logic, keeping both for now)
        const permission = await checkPermission(user, 'gps');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        const { id, title, category, isShared, rows, order } = data;

        // Map isShared boolean to visibility enum
        const visibility = isShared ? Visibility.TRIBE : Visibility.PRIVATE;

        // Check if this is a new goal or an update
        let goal;
        const isNewGoal = !id || id === 'NEW' || !id.startsWith('c'); // cuid starts with 'c'

        if (isNewGoal) {
            // Create new goal - let Prisma generate the ID
            goal = await prisma.goal.create({
                data: {
                    userId: user.id,
                    vision: title,
                    status: "ACTIVE",
                    visibility: visibility,
                    category: category,
                    order: (order !== undefined ? order : 0) as any,
                },
            });
        } else {
            // Update existing goal
            goal = await prisma.goal.update({
                where: { id: id },
                data: {
                    vision: title,
                    status: "ACTIVE",
                    visibility: visibility,
                    category: category,
                    order: (order !== undefined ? order : undefined) as any,
                },
            });
        }

        // Handle OKRs and Actions
        if (rows) {
            // Fetch existing state for Gamification (only if not new)
            let oldGoal = null;
            if (!isNewGoal) {
                oldGoal = await prisma.goal.findUnique({
                    where: { id: goal.id },
                    include: { okrs: { include: { actions: true } } }
                });
            }

            // --- GAMIFICATION LOGIC START ---
            if (oldGoal) {
                const oldActionsMap = new Map<string, any>();
                oldGoal.okrs.forEach(o => o.actions.forEach(a => oldActionsMap.set(a.id, a)));

                // Flatten new actions from payload
                const newActions = [];
                for (const row of rows) {
                    if (!('type' in row) && (row as any).actions) {
                        newActions.push(...(row as any).actions);
                    }
                }

                for (const actionCard of newActions) {
                    // Check if New or Existing
                    if (!oldActionsMap.has(actionCard.id)) {
                        // New Action -> +2 XP
                        await awardXP(user.id, 'TASK_GENERATED');
                    } else {
                        // Existing Action
                        const oldAction = oldActionsMap.get(actionCard.id);
                        const isDone = actionCard.status === 'DONE';
                        const wasDone = oldAction.status === 'DONE';

                        if (isDone && !wasDone) {
                            // Task Completed -> +3 XP
                            await awardXP(user.id, 'TASK_COMPLETED');

                            // Check Lateness
                            const weekNum = parseInt(actionCard.weekId.replace('W', ''));
                            const year = actionCard.year || 2025;
                            const startOfYear = new Date(year, 0, 1);
                            const weekDate = new Date(startOfYear);
                            weekDate.setDate(startOfYear.getDate() + (weekNum - 1) * 7);

                            const endOfWeek = new Date(weekDate);
                            endOfWeek.setDate(weekDate.getDate() + 7);


                        }
                    }
                }
            }
            // --- GAMIFICATION LOGIC END ---

            // DESTRUCTIVE OPERATION REMOVED:
            // We no longer delete all OKRs. We will update existing ones and create new ones.
            // if (!isNewGoal) {
            //    await prisma.oKR.deleteMany({ where: { goalId: goal.id } });
            // }

            let firstOkrId: string | null = null;
            if (!isNewGoal) {
                const existingOkrs = await prisma.oKR.findMany({ where: { goalId: goal.id } });
                if (existingOkrs.length > 0) firstOkrId = existingOkrs[0].id; // Fallback to existing if updating
            }

            for (const row of rows) {
                if ('type' in row && (row.type === 'OKR' || row.type === 'KPI')) {
                    // This is a MetricRow (OKR or KPI)

                    // Check if existing OKR (has ID and ID exists in DB)
                    // Frontend uses 'new-', 'okr-', 'kpi-' for temp IDs. DB IDs are CUIDs (start with 'c').
                    const isExisting = row.id && !row.id.startsWith('new') && !row.id.startsWith('okr-') && !row.id.startsWith('kpi-') && row.id.length > 10;

                    let okr;
                    if (isExisting) {
                        // UPDATE existing OKR
                        okr = await prisma.oKR.update({
                            where: { id: row.id },
                            data: {
                                metricName: row.label,
                                type: row.type,
                                targetValue: row.targetValue,
                                currentValue: row.startValue,
                                startYear: row.startYear || 2026,
                                startMonth: row.startMonth || 0,
                                deadlineYear: row.deadlineYear || 2026,
                                deadlineMonth: row.deadlineMonth || 11,
                                direction: (row.direction || 'UP') as any,
                                monthlyData: row.monthlyData ? JSON.stringify(row.monthlyData) : null,
                                order: (row.order !== undefined ? row.order : undefined) as any,
                                // For shared tribes, we might want to be careful not to wipe them out if not sending them?
                                // Assuming payload sends full list if it sends it at all.
                                ...(row.sharedTribeIds ? {
                                    sharedTribes: {
                                        set: row.sharedTribeIds.map((id: string) => ({ id }))
                                    }
                                } : {})
                            }
                        });
                    } else {
                        // CREATE new OKR
                        okr = await prisma.oKR.create({
                            data: {
                                goalId: goal.id,
                                metricName: row.label,
                                type: row.type,
                                targetValue: row.targetValue,
                                currentValue: row.startValue,
                                startYear: row.startYear || 2026,
                                startMonth: row.startMonth || 0,
                                deadlineYear: row.deadlineYear || 2026,
                                deadlineMonth: row.deadlineMonth || 11,
                                direction: (row.direction || 'UP') as any,
                                monthlyData: row.monthlyData ? JSON.stringify(row.monthlyData) : null,
                                order: (row.order !== undefined ? row.order : 0) as any,
                                sharedTribes: {
                                    connect: row.sharedTribeIds?.map((id: string) => ({ id })) || []
                                }
                            }
                        });
                    }

                    if (!firstOkrId) firstOkrId = okr.id;

                } else if (!('type' in row)) {
                    // This is an ActionRow
                    const actionRow = row as any;

                    // Actions are typically managed individually via their own endpoints (updateStatus, etc.)
                    // BUT when saving a full goal, we might be creating new ones or updating titles.
                    // The Frontend usually sends the full list of actions for the goal.

                    if (actionRow.actions && Array.isArray(actionRow.actions)) {
                        // Create actions (even if no OKR exists, they will just be unlinked from an OKR)

                        for (const actionCard of actionRow.actions) {
                            // Map UI status to DB status
                            let dbStatus = "NOT_DONE";
                            if (actionCard.status === 'DONE') dbStatus = "DONE";
                            else if (actionCard.status === 'WIP') dbStatus = "NOT_DONE";

                            // Convert weekId (e.g., "W1") to a date
                            const weekNum = parseInt(actionCard.weekId.replace('W', ''));
                            const year = actionCard.year || 2025;

                            const startOfYear = new Date(year, 0, 1);
                            const weekDate = new Date(startOfYear);
                            weekDate.setDate(startOfYear.getDate() + (weekNum - 1) * 7);

                            // Check if existing Action
                            // Frontend uses 'act-' for new actions (or sometimes Date.now() string)
                            // We treat anything with 'act-' or 'new' as NEW.
                            const isExistingAction = actionCard.id && !actionCard.id.startsWith('new') && !actionCard.id.startsWith('act-') && actionCard.id.length > 10 && !Number.isInteger(Number(actionCard.id));

                            if (isExistingAction) {
                                // UPDATE existing Action
                                await prisma.action.update({
                                    where: { id: actionCard.id },
                                    data: {
                                        description: actionCard.title,
                                        status: dbStatus,
                                        // Update week if dragged (handled by handleMoveAction usually, but here for full save)
                                        weekDate: weekDate,
                                        dueDate: weekDate,
                                        order: (actionCard.order !== undefined ? actionCard.order : undefined) as any
                                    }
                                }).catch(e => console.warn("Failed to update action (might have been deleted):", e));
                            } else {
                                // CREATE new Action
                                await prisma.action.create({
                                    data: {
                                        userId: user.id,
                                        okrId: firstOkrId,
                                        description: actionCard.title,
                                        status: dbStatus,
                                        weekDate: weekDate,
                                        dueDate: weekDate,
                                        order: (actionCard.order !== undefined ? actionCard.order : 0) as any
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

        // Fetch and return the complete goal with all relations
        const savedGoal = await prisma.goal.findUnique({
            where: { id: goal.id },
            include: {
                okrs: {
                    include: {
                        actions: true,
                        sharedTribes: true,
                    }
                }
            }
        });

        // Map the response to include parsed monthlyData
        const response = {
            ...savedGoal,
            okrs: savedGoal?.okrs.map(okr => ({
                ...okr,
                monthlyData: okr.monthlyData ? JSON.parse(okr.monthlyData) : null,
                direction: (okr as any).direction || 'UP'
            }))
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("POST Goals Error:", error);
        return NextResponse.json({ error: "Failed to save goal" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const permission = await checkPermission(user, 'gps');
        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        const { searchParams } = new URL(req.url);
        const goalId = searchParams.get('id');

        if (!goalId) {
            return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
        }

        // Verify the goal belongs to the user before deleting
        const goal = await prisma.goal.findUnique({
            where: { id: goalId }
        });

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        if (goal.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Manual cascade delete: First delete all related OKRs and their Actions
        const okrs = await prisma.oKR.findMany({
            where: { goalId: goalId }
        });

        for (const okr of okrs) {
            // Delete all actions for this OKR
            await prisma.action.deleteMany({
                where: { okrId: okr.id }
            });
        }

        // Delete all OKRs for this goal
        await prisma.oKR.deleteMany({
            where: { goalId: goalId }
        });

        // Delete any action plans directly linked to this goal
        await prisma.actionPlan.deleteMany({
            where: { goalId: goalId }
        });

        // Finally, delete the goal itself
        await prisma.goal.delete({
            where: { id: goalId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting goal:", error);
        return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
    }
}
