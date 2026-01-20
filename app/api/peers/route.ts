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

        const search = new URL(req.url).searchParams.get('search') || '';
        const role = new URL(req.url).searchParams.get('role');
        const industry = new URL(req.url).searchParams.get('industry');
        const location = new URL(req.url).searchParams.get('location'); // Country or City
        const start = parseInt(new URL(req.url).searchParams.get('start') || '0');
        const limit = parseInt(new URL(req.url).searchParams.get('limit') || '50');

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

        // Helper to build filter
        const whereClause: any = {
            id: { notIn: excludedIds },
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            whereClause.professionalRole = { contains: role, mode: 'insensitive' };
        }
        if (industry) {
            whereClause.industry = { contains: industry, mode: 'insensitive' };
        }
        if (location) {
            whereClause.OR = [
                { country: { contains: location, mode: 'insensitive' } },
                { city: { contains: location, mode: 'insensitive' } },
            ];
        }

        // Leaderboard Query (Keep strict for Top 5)
        // ... (We might want Top 5 to also respect filters? Or always be global? Usually Leaderboard is global. Let's keep it global for now or minimally filtered)
        // For now, let's keep Top 5 global as "Top Ranked" implies best of all.
        // We actually fetch allPeers for ranking. If we filter allPeers, Leaderboard filters too.
        // Let's Separate: Leaderboard is Global. Filtered List is below.

        // 1. Fetch Global Top 5 (Cached or separate query if needed, but for now we essentially duplicate effort if we don't reuse. 
        // Let's keep the original "All Peers" query for ranking, OR just use a separate small query for ranking if filters are applied.
        // To save performance, we can just fetch top 100 global for ranking.

        const rankingPeers = await prisma.user.findMany({
            where: { id: { not: userId } },
            select: {
                id: true, name: true, avatarUrl: true, level: true, grit: true, experience: true, reputationScore: true
            },
            take: 50, // Limit for ranking calculation
        });

        const ranked = rankingPeers.map(peer => {
            const gritPercent = peer.grit / 100;
            const score = Math.round(peer.level * (gritPercent || 0.1) * (peer.experience || 1) * (peer.reputationScore || 1));
            return {
                ...peer,
                rankingScore: score
            };
        }).sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 5);


        // 2. Fetch Filtered List for "Discover"
        const peers = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                bio: true,
                avatarUrl: true,
                level: true,
                // Matchmaking fields
                professionalRole: true,
                industry: true,
                country: true,
                city: true,
                skills: true,
            },
            skip: start,
            take: limit,
            orderBy: {
                level: 'desc', // Default sort
            },
        });

        return NextResponse.json({ peers, topRanked: ranked });
    } catch (error) {
        console.error('Error fetching peers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
