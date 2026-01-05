import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/users/[id]/badges - Get user's badges/achievements
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = id;

        const achievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: {
                badge: true
            },
            orderBy: { earnedAt: 'desc' }
        });

        const badges = achievements.map(a => ({
            id: a.badge.id,
            name: a.badge.name,
            iconName: a.badge.iconName,
            type: a.badge.type,
            earnedAt: a.earnedAt
        }));

        return NextResponse.json(badges);
    } catch (error) {
        console.error("GET User Badges Error:", error);
        return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
    }
}
