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
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedTribes = tribes.map(t => ({
            id: t.id,
            name: t.name,
            topic: t.topic,
            meetingTime: t.meetingTime,
            maxMembers: t.maxMembers,
            memberCount: t._count.members,
            matchmakingCriteria: t.matchmakingCriteria
        }));

        return NextResponse.json(formattedTribes);
    } catch (error) {
        console.error("GET Tribes Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribes" }, { status: 500 });
    }
}
