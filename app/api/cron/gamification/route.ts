import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardXP } from "@/lib/gamification";

export const runtime = "nodejs";

/**
 * CRON Job Handler for Gamification checks
 * Should be scheduled to run once a week (e.g. Sunday night or Monday morning).
 * Checks if users have submitted their Weekly Ritual.
 * If not, creates a "Missed" ritual and awards negative XP.
 */
export async function GET(req: Request) {
    // secure this endpoint with a secret key if possible
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                isGuest: false, // Don't punish guests
                subscriptionStatus: { not: 'EXPIRED' } // Only active users?
            },
            select: { id: true }
        });

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Reset to Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const results = [];

        for (const user of users) {
            // Check for any ritual this week
            const existingRitual = await prisma.ritual.findFirst({
                where: {
                    userId: user.id,
                    date: { gte: startOfWeek }
                }
            });

            if (!existingRitual) {
                // No check-in found (neither successful nor missed)
                // 1. Create a "Missed" ritual record to prevent double-penalizing
                await prisma.ritual.create({
                    data: {
                        userId: user.id,
                        win: 'Missed Weekly Check-in',
                        stuckPoint: 'Did not submit ritual',
                        mood: 1,
                        attendance: false,
                        date: new Date()
                    }
                });

                // 2. Award Negative XP
                const xpResult = await awardXP(user.id, 'PIT_STOP_MISS_WEEK');

                results.push({ userId: user.id, status: 'penalized', xp: xpResult.amount });
            } else {
                results.push({ userId: user.id, status: 'ok' });
            }
        }

        return NextResponse.json({
            success: true,
            processed: users.length,
            penalized: results.filter(r => r.status === 'penalized').length
        });

    } catch (error) {
        console.error("Cron Gamification Error:", error);
        return NextResponse.json({ error: "Failed to process gamification cron" }, { status: 500 });
    }
}
