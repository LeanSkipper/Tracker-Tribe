import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserProfile, SubscriptionStatus, Visibility } from "@prisma/client";
import { checkPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    try {
        // In a real app, this would come from session/auth.
        const user = await prisma.user.findFirst({
            where: { email: "tiago@example.com" },
            select: {
                id: true,
                email: true,
                name: true,
                userProfile: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                trialStartDate: true,
                trialEndDate: true,
                graceStartDate: true,
                graceEndDate: true,
                reputationScore: true,
                profileCompleteness: true,
            }
        });
        if (!user) {
            // Create a default user if none exists for the prototype
            const newUser = await prisma.user.create({
                data: {
                    email: "tiago@example.com",
                    name: "Tiago",
                    userProfile: UserProfile.SOFT,
                    subscriptionStatus: SubscriptionStatus.TRIAL,
                    trialStartDate: new Date(),
                    trialEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
                    reputationScore: 0,
                    profileCompleteness: 0,
                }
            });
            return NextResponse.json([]);
        }

        // Check GPS access permission (only if user has subscription fields)
        if (user.userProfile && user.subscriptionStatus) {
            console.log('[GPS GET] User data:', {
                id: user.id,
                email: user.email,
                userProfile: user.userProfile,
                subscriptionStatus: user.subscriptionStatus,
                trialEndDate: user.trialEndDate,
                graceEndDate: user.graceEndDate,
            });

            const permission = await checkPermission({
                id: user.id,
                email: user.email,
                name: user.name,
                userProfile: user.userProfile as any,
                subscriptionStatus: user.subscriptionStatus as any,
                subscriptionPlan: user.subscriptionPlan,
                trialStartDate: user.trialStartDate,
                trialEndDate: user.trialEndDate,
                graceStartDate: user.graceStartDate,
                graceEndDate: user.graceEndDate,
                reputationScore: user.reputationScore,
                profileCompleteness: user.profileCompleteness,
            }, 'gps');

            console.log('[GPS GET] Permission result:', permission);

            if (!permission.allowed) {
                return forbiddenResponse(permission.message);
            }
        }
        // If user doesn't have subscription fields, allow access (legacy users)

        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            include: {
                okrs: {
                    include: {
                        actions: true,
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
        const user = await prisma.user.findFirst({
            where: { email: "tiago@example.com" },
            select: {
                id: true,
                email: true,
                name: true,
                userProfile: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                trialStartDate: true,
                trialEndDate: true,
                graceStartDate: true,
                graceEndDate: true,
                reputationScore: true,
                profileCompleteness: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check GPS access permission (only if user has subscription fields)
        if (user.userProfile && user.subscriptionStatus) {
            const permission = await checkPermission({
                id: user.id,
                email: user.email,
                name: user.name,
                userProfile: user.userProfile as any,
                subscriptionStatus: user.subscriptionStatus as any,
                subscriptionPlan: user.subscriptionPlan,
                trialStartDate: user.trialStartDate,
                trialEndDate: user.trialEndDate,
                graceStartDate: user.graceStartDate,
                graceEndDate: user.graceEndDate,
                reputationScore: user.reputationScore,
                profileCompleteness: user.profileCompleteness,
            }, 'gps');

            if (!permission.allowed) {
                return forbiddenResponse(permission.message);
            }
        }
        // If user doesn't have subscription fields, allow access (legacy users)

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
                            startYear: row.startYear,
                            startMonth: row.startMonth,
                            deadlineYear: row.deadlineYear,
                            deadlineMonth: row.deadlineMonth,
                            monthlyData: row.monthlyData ? JSON.stringify(row.monthlyData) : null,
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
                            // Extract week number from weekId
                            const weekNum = parseInt(actionCard.weekId.replace('W', ''));
                            const year = actionCard.year || 2025;

                            // Calculate approximate date for the week
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
