import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/dashboard - Get user's dashboard data
export async function GET(req: Request) {
    try {
        // Get current user from session
        const user = await getSession();

        if (!user) {
            return unauthorizedResponse();
        }

        // Get user's tribes with members
        const userTribes = await prisma.tribeMember.findMany({
            where: { userId: user.id },
            include: {
                tribe: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatarUrl: true,
                                        grit: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Format tribes for dashboard
        const tribes = userTribes.map(ut => {
            const t = ut.tribe;
            // Calculate average grit
            const totalGrit = t.members.reduce((acc, m) => acc + (m.user.grit || 0), 0);
            const avgGrit = t.members.length > 0 ? Math.round(totalGrit / t.members.length) : 0;

            return {
                id: t.id,
                name: t.name,
                topic: t.topic,
                meetingTime: t.meetingTime,
                meetingFrequency: t.meetingFrequency,
                reliabilityRate: t.reliabilityRate,
                maxMembers: t.maxMembers,
                members: t.members.map(m => ({
                    id: m.user.id,
                    name: m.user.name,
                    avatarUrl: m.user.avatarUrl
                })),
                averageGrit: avgGrit,
                minGrit: t.minGrit,
                minLevel: t.minLevel,
                minExperience: t.minExperience,
                minReputation: t.minReputation
            };
        });

        return NextResponse.json({ tribes });
    } catch (error) {
        console.error("GET Dashboard Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
    }
}
