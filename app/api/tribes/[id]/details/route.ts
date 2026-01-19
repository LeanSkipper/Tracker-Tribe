import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/tribes/[id]/details - Get tribe details with member GPS views
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tribeId } = await params;

        // Get current user from session
        const session = await getSession();
        const currentUserId = session?.id || '';

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

            // Use Grit directly from the user profile
            const grit = user.grit || 0;
            const level = user.level || 1;
            const xp = user.currentXP || 0;
            const reputation = user.reputationScore || 0;

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
                grit,
                level,
                xp,
                reputation,
                badges,
                goals,
                attendanceRate: 100 // To be implemented later with session tracking
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
            currentUserId: currentUserId
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
