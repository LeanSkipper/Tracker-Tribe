import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/tribes/my - List tribes the current user is a member of
export async function GET(req: Request) {
    try {
        const user = await getSession();
        if (!user) {
            return unauthorizedResponse();
        }

        const tribes = await prisma.tribe.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id
                    }
                }
            },
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
            // Also mapping structured meeting fields if available
            meetingFrequency: t.meetingFrequency,
            meetingTimeHour: t.meetingTimeHour,
            meetingTimeMinute: t.meetingTimeMinute,
            maxMembers: t.maxMembers,
            memberCount: t._count.members,
        }));

        return NextResponse.json(formattedTribes);
    } catch (error) {
        console.error("GET My Tribes Error:", error);
        return NextResponse.json({ error: "Failed to fetch your tribes" }, { status: 500 });
    }
}
