import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const rituals = await prisma.ritual.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 6 // Last 6 weeks for reliability
        });

        return NextResponse.json(rituals);
    } catch (error) {
        console.error("GET Rituals Error:", error);
        return NextResponse.json({ error: "Failed to fetch rituals" }, { status: 500 });
    }
}

import { awardXP } from "@/lib/gamification";

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { win, stuckPoint, planVsActual, mood, attendance } = data;

        // Get user from session
        const user = await getSession();
        if (!user) return unauthorizedResponse();

        const ritual = await prisma.ritual.create({
            data: {
                userId: user.id,
                win,
                stuckPoint,
                planVsActual,
                mood: parseInt(mood) || 5,
                attendance: attendance ?? true,
                date: new Date(),
            }
        });

        // Award XP for Weekly Check-in
        const xpResult = await awardXP(user.id, 'PIT_STOP_COMPLETED');

        // Optional: Trigger Achievement Check (if not handled by awardXP)
        const awarded = await checkAndAwardAchievements(user.id);

        return NextResponse.json({
            ...ritual,
            xpAwarded: xpResult.amount,
            newLevel: xpResult.newLevel,
            newXP: xpResult.newCurrentXP,
            newlyAwarded: awarded
        });
    } catch (error) {
        console.error("POST Ritual Error:", error);
        return NextResponse.json({ error: "Failed to submit ritual" }, { status: 500 });
    }
}
