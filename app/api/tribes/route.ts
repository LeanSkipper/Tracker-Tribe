import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/tribes - List all tribes
export async function GET(req: Request) {
    try {
        const tribes = await prisma.tribe.findMany({
            include: {
                _count: {
                    select: { members: true }
                },
                members: {
                    select: {
                        user: {
                            select: {
                                grit: true,
                                level: true,
                                experience: true,
                                reputationScore: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedTribes = tribes.map(t => {
            // Calculate average grit
            const totalGrit = t.members.reduce((acc, m) => acc + (m.user.grit || 0), 0);
            const avgGrit = t.members.length > 0 ? Math.round(totalGrit / t.members.length) : 0;

            // Calculate average Global Score (Ranking Score)
            const totalScore = t.members.reduce((acc, m) => {
                const u = m.user;
                const gritPercent = (u.grit / 100) || 0; // Use 0 fallback here for average? Or 0.1? Peers used 0.1, Tribe[id] used 0.1. Let's use 0.1 for consistency or 0 if grit is missing?
                // Tribe[id] route: const gritPercent = (member.user.grit / 100) || 0.1;
                // Peers route: const gritPercent = peer.grit / 100; (with fallback in usage: (gritPercent || 0.1))
                // Let's stick to 0.1 fallback for consistency
                const gp = (u.grit ? u.grit / 100 : 0.1);
                const score = (u.level || 1) * gp * (u.experience || 1) * (u.reputationScore || 1);
                return acc + score;
            }, 0);
            const avgScore = t.members.length > 0 ? Math.round(totalScore / t.members.length) : 0;

            return {
                id: t.id,
                name: t.name,
                topic: t.topic,
                meetingTime: t.meetingTime,
                meetingFrequency: t.meetingFrequency,
                maxMembers: t.maxMembers,
                memberCount: t._count.members,
                matchmakingCriteria: t.matchmakingCriteria,
                // Required Stats
                minGrit: t.minGrit,
                minLevel: t.minLevel,
                minExperience: t.minExperience,
                minReputation: t.minReputation,
                // Calculated Stats
                averageGrit: avgGrit,
                averageRankingScore: avgScore
            };
        });

        return NextResponse.json(formattedTribes);
    } catch (error) {
        console.error("GET Tribes Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribes" }, { status: 500 });
    }
}
