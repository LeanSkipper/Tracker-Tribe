import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { minLevel, minGrit, minExperience, minCompletionRate, minReputation } = await req.json();

        // Count users matching the criteria
        const count = await prisma.user.count({
            where: {
                level: { gte: minLevel || 1 },
                grit: { gte: minGrit || 0 },
                experience: { gte: minExperience || 0 },
                taskCompletionRate: { gte: (minCompletionRate || 0) / 100 },
                reputationScore: { gte: minReputation || 0 },
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error estimating pool:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
