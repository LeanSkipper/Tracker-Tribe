
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const MAX_SPOTS = 100;

        // Count users with 'HARD' profile (Creators)
        const creatorCount = await prisma.user.count({
            where: {
                userProfile: 'HARD'
            }
        });

        const remainingSpots = Math.max(0, MAX_SPOTS - creatorCount);

        return NextResponse.json({
            remainingSpots,
            totalSpots: MAX_SPOTS,
            takenSpots: creatorCount
        });
    } catch (error) {
        console.error('Error fetching grand slam stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
