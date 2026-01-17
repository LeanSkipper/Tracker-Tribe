import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/tribes/[id]/details - Get tribe details with member GPS views
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tribeId } = await params;

        // Get current user
        const currentUser = await prisma.user.findFirst();
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get tribe with all members and their data
        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                achievements: {
                                    include: {
                                        badge: true
                                    },
                                    orderBy: { earnedAt: 'desc' }
                                },
                                goals: {
                                    where: {
                                        visibility: 'TRIBE'
                                    },
                                    include: {
                                        okrs: {
                                            include: {
                                                actions: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        // Calculate statistics for each member
        const membersWithStats = tribe.members.map(membership => {
            const user = membership.user;

            // Calculate reliability based on action completion from goals
            const allActions = user.goals.flatMap(g => g.okrs.flatMap(okr => okr.actions));
            const totalActions = allActions.length;
            const doneActions = allActions.filter(a => a.status === 'DONE').length;
            const actionScore = totalActions > 0 ? (doneActions / totalActions) : 0.5;

            // For now, use action score as the primary reliability metric
            // In the future, this can be enhanced with attendance and ritual data
            const reliability = Math.round(actionScore * 100);

            // Format badges
            const badges = user.achievements.slice(0, 5).map(a => ({
                id: a.badge.id,
                name: a.badge.name,
                iconName: a.badge.iconName
            }));

            // Format goals with parsed monthly data
            const goals = user.goals.map(goal => ({
                ...goal,
                okrs: goal.okrs.map((okr: any) => ({
                    ...okr,
                    monthlyData: okr.monthlyData ? JSON.parse(okr.monthlyData) : null
                }))
            }));

            return {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: membership.role,
                reliability,
                badges,
                goals,
                attendanceRate: 100 // Default to 100% for now
            };
        });

        return NextResponse.json({
            tribe: {
                id: tribe.id,
                name: tribe.name,
                description: tribe.description,
                topic: tribe.topic,
                meetingTime: tribe.meetingTime,
                meetingDay: tribe.meetingDay,
                creatorId: tribe.creatorId,
                members: membersWithStats
            },
            currentUserId: currentUser.id
        });
    } catch (error) {
        console.error("GET Tribe Details Error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return NextResponse.json({
            error: "Failed to fetch tribe details",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
