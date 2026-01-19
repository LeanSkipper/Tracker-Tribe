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
                            select: { grit: true }
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
                averageGrit: avgGrit
            };
        });

        return NextResponse.json(formattedTribes);
    } catch (error) {
        console.error("GET Tribes Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribes" }, { status: 500 });
    }
}
