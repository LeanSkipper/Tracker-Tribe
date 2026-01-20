import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock function to getting current user ID - replace with actual auth logic later
// For now, we'll try to get it from headers or use a hardcoded fallback for testing if no auth is set up
const getCurrentUserId = async (req: Request) => {
    // TODO: Implement actual session/auth retrieval
    // For now, returning a placeholder or checking for a specific header
    const userId = req.headers.get('x-user-id');
    return userId;
};

export async function GET(req: Request) {
    try {
        const userId = await getCurrentUserId(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const start = parseInt(new URL(req.url).searchParams.get('start') || '0');
        const limit = parseInt(new URL(req.url).searchParams.get('limit') || '10');

        // Fetch users excluding:
        // 1. The current user
        // 2. Users already matched (initiated by current user)
        // 3. (Optional) Users who rejected/blocked the current user?

        // Get IDs of users explicitly interacted with by current user
        const interactedMatches = await prisma.match.findMany({
            where: {
                initiatorId: userId,
            },
            select: {
                targetId: true,
            },
        });

        const excludedIds = [userId, ...interactedMatches.map(m => m.targetId)];

        const allPeers = await prisma.user.findMany({
            where: {
                id: { not: userId }, // Simply exclude self for ranking
            },
            select: {
                id: true,
                name: true,
                bio: true,
                avatarUrl: true,
                level: true,
                grit: true,
                experience: true,
                reputationScore: true,
                skills: true,
            },
            // We can't sort by calculated field in Prisma easily, so we fetch more and sort in JS
            // In a real large app, you'd have a computed column or scheduled job
            take: 100,
        });

        // Calculate Score: Level * (Grit/100) * XP * Reputation
        // Fallback defaults to avoid 0 multiplication if strictly needed, but user formula implies metrics matter.
        // If reputation is 0, score becomes 0. Let's assume min reputation 1 for calculation or pure formula?
        // User said: "level 1 x grit 90% x 200 XP x 5 reputation = 900" -> 1 * 0.9 * 200 * 5 = 900. Correct.

        const rankedPeers = allPeers.map(peer => {
            const gritPercent = peer.grit / 100;
            const score = Math.round(peer.level * (gritPercent || 0.1) * (peer.experience || 1) * (peer.reputationScore || 1));
            return {
                ...peer,
                rankingScore: score
            };
        }).sort((a, b) => b.rankingScore - a.rankingScore);

        const topRanked = rankedPeers.slice(0, 5);

        // Standard Browse Peers (Pagination logic remains similar but we might want to exclude Top 5 from general browse? 
        // Or just keep them. For now, we will perform the standard query for pagination as before).

        const peers = await prisma.user.findMany({
            where: {
                id: {
                    notIn: excludedIds,
                },
            },
            select: {
                id: true,
                name: true,
                bio: true,
                avatarUrl: true,
                level: true,
                skills: true,
                totalReliability: true,
            },
            skip: start,
            take: limit,
            orderBy: {
                level: 'desc',
            },
        });

        return NextResponse.json({ peers, topRanked });
    } catch (error) {
        console.error('Error fetching peers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
