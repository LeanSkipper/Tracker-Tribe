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
                // Don't leak sensitive data
            },
            skip: start,
            take: limit,
            orderBy: {
                level: 'desc', // Show higher level peers first? or random?
            },
        });

        return NextResponse.json({ peers });
    } catch (error) {
        console.error('Error fetching peers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
