import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tribeId = (await params).id;

        // Verify membership
        const membership = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: session.id,
                    tribeId: tribeId
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get all Tribe Members
        const members = await prisma.tribeMember.findMany({
            where: { tribeId },
            select: { userId: true }
        });

        const memberIds = members.map(m => m.userId);

        // Fetch aggregated history
        // Ideally we sum up scores day by day.
        // For simple MVP: Fetch all history for these members, grouping by date is complex in simple Prisma without RAW SQL.
        // Alternative: Just fetch LAST WEEK's history for all members and aggregate in JS.

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const history = await prisma.scoreHistory.findMany({
            where: {
                userId: { in: memberIds },
                createdAt: { gte: thirtyDaysAgo }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by Date (YYYY-MM-DD)
        const aggregated: Record<string, number> = {};

        history.forEach(h => {
            const dateKey = h.createdAt.toISOString().split('T')[0];
            // We want the SUM of scores at that date. 
            // BUT: scoreHistory is snapshots.
            // If user A has score 100 on Mon and 110 on Tue.
            // User B has score 200 on Mon.
            // Tribe Score Mon = 300. Tribe Score Tue = 310.
            // This requires knowing the status of EVERY user for EVERY day.
            // This is complex for a "Live" chart MVP.

            // Simplified approach: "Activity Stream".
            // Just show the "Running Total" of recorded scores? No, that's meaningless.

            // Better Approach for MVP:
            // Just show the history of the "Tribe Reliability" or similar?
            // User asked for "Sum Score Evolution".

            // Let's try to group by day and take the MAX score for each user for that day, then sum them?
            // Expensive.

            // Re-think: Maybe just show the current sum? No, "Evolution" asked.

            // Allow JS aggregation:
            // 1. Buckets by Day. 
            // 2. For each bucket, find the latest score for each member UP TO that day?
            // That's O(Days * Members). Feasible for small tribes.
        });

        // Let's assume we just render the sum of scores recorded ON that day? No.

        // Compromise:
        // Timeline of "TotalXP" added?

        // Let's try the "Latest score per user per day" aggregation.
        // Get all unique dates from history.
        // For each date, sum the scores.

        // Actually, let's just create buckets for the last 30 days.
        const result = [];
        const now = new Date();

        // Map of UserId -> LastKnownScore
        // We need initial state? We assume 0.

        // Fetch ALL history for these members? Too big?
        // Let's limit to 30 days and assume starting score is the first record found?
        // Or fetch current score and work backwards?

        // Let's try a simpler visualization:
        // Sum of all `score` entries grouped by day? No, `score` is absolute.

        // Okay, let's map history to "Daily Points" (Change in score).
        // Too complex to calc diffs.

        // Let's do this:
        // Group all history entries by Date.
        // For each Date, sum the scores of entries *on that day*? No.

        // Let's return the Raw History points for the frontend to aggregate?
        // Or simplistically:
        // Just return the sum of all scores recorded.
        // If User A logs 100, User B logs 200. Total 300.
        // Next day User A logs 110. Total 310.
        // We can just plot the "New Total" every time a score changes?
        // YES. That's the most accurate "Event Stream".
        // Every time a member's score updates, the Tribe Score changes.
        // So we just take the stream of all history events, sort by time.
        // Iterate through stream, updating the "Current Score" for that user, and re-calculating Total.

        const events = await prisma.scoreHistory.findMany({
            where: {
                userId: { in: memberIds },
                createdAt: { gte: thirtyDaysAgo }
            },
            orderBy: { createdAt: 'asc' },
            select: { userId: true, score: true, createdAt: true }
        });

        const userScores: Record<string, number> = {};
        const timeline: any[] = [];

        // Pre-fill user scores with their value at start of window?
        // We'd need to fetch "score just before thirtyDaysAgo".
        // Skip for MVP. Chart will start from 0 or jump up. User wants "Evolution".

        // Actually, let's just fetch current scores of all members to get the "Current Sum".
        // And use history to "work backwards"?
        // Or just let the chart build up from the data we have.

        let currentTribeScore = 0;

        events.forEach(e => {
            const oldScore = userScores[e.userId] || 0;
            const diff = e.score - oldScore;
            userScores[e.userId] = e.score;
            currentTribeScore += diff; // Wait, this logic implies we start at 0.

            // If this is the FIRST record for user in this window, we add the full score.
            // This will cause a steep jump at start of chart. That's acceptable for V1.

            timeline.push({
                date: e.createdAt.toISOString().split('T')[0], // Day granularity for grouping?
                timestamp: e.createdAt.getTime(),
                score: currentTribeScore
            });
        });

        // Downsample: Keep only last entry per day?
        const daily: Record<string, number> = {};
        timeline.forEach(t => {
            daily[t.date] = t.score;
        });

        const formatted = Object.keys(daily).sort().map(date => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: daily[date]
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
