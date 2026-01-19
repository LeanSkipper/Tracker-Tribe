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
            include: {
                okrs: {
                    include: {
                        actions: true,
                        sharedTribes: true,
                    }
                }
            }
        });

        // Map database format to include all fields
        const mappedGoals = goals.map(g => ({
            ...g,
            okrs: g.okrs.map(okr => ({
                ...okr,
                monthlyData: okr.monthlyData ? JSON.parse(okr.monthlyData) : null,
            }))
        }));

        return NextResponse.json(mappedGoals);
    } catch (error) {
        console.error("GET Goals Error:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Get authenticated user from session
        const user = await getSession();

        // Block guest users from saving
        if (!user) {
            return NextResponse.json({
                error: "Sign up to save your goals",
                message: "You're in demo mode. Create a free account to save your progress and unlock all features.",
                requiresAuth: true
            }, { status: 401 });
        }

        // Check GPS access permission
        const permission = await checkPermission(user, 'gps');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        const { id, title, category, isShared, rows } = data;

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

                            if (new Date() > endOfWeek) {
                                await awardXP(user.id, 'TASK_LATE');
                            }
                        }
                    }
                }
            }
            // --- GAMIFICATION LOGIC END ---

            // Delete existing OKRs and their actions for this goal (only if updating)
            if (!isNewGoal) {
                await prisma.oKR.deleteMany({ where: { goalId: goal.id } });
            }

            let firstOkrId: string | null = null;

            for (const row of rows) {
                if ('type' in row && (row.type === 'OKR' || row.type === 'KPI')) {
                    // This is a MetricRow (OKR or KPI)
                    const okr = await prisma.oKR.create({
                        data: {
                            goalId: goal.id,
                            metricName: row.label,
                            type: row.type,
                            targetValue: row.targetValue,
                            currentValue: row.startValue,
                            // Ensure backward compat or defaults
                            startYear: row.startYear || 2026,
                            startMonth: row.startMonth || 0,
                            deadlineYear: row.deadlineYear || 2026,
                            deadlineMonth: row.deadlineMonth || 11,
                            monthlyData: row.monthlyData ? JSON.stringify(row.monthlyData) : null,
                            sharedTribes: {
                                connect: row.sharedTribeIds?.map((id: string) => ({ id })) || []
                            }
                        }
                    });
                    if (!firstOkrId) firstOkrId = okr.id;
                } else if (!('type' in row)) {
                    // This is an ActionRow
                    const actionRow = row as any;
                    if (actionRow.actions && Array.isArray(actionRow.actions)) {
                        // Only create actions if we have at least one OKR
                        if (!firstOkrId) {
                            console.warn('Skipping action creation: no OKRs exist for this goal');
                            continue;
                        }

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

                            await prisma.action.create({
                                data: {
                                    userId: user.id,
                                    okrId: firstOkrId,
                                    description: actionCard.title,
                                    status: dbStatus,
                                    weekDate: weekDate,
                                    dueDate: weekDate,
                                }
                            });
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
            }))
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("POST Goals Error:", error);
        return NextResponse.json({ error: "Failed to save goal" }, { status: 500 });
    }
}
