import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { awardXP } from '@/lib/gamification';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSession();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: revieweeId } = await params;
    const reviewerId = user.id;

    if (revieweeId === reviewerId) {
        return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { stars, badges, comment } = body;

        // Validation
        if (!stars || stars < 1 || stars > 5) {
            return NextResponse.json({ error: 'Stars must be 1-5' }, { status: 400 });
        }

        // Create Review
        await prisma.peerReview.create({
            data: {
                reviewerId,
                userId: revieweeId,
                stars,
                badges: badges || [],
                comment
            }
        });

        // Award XP to Reviewer (+5 XP)
        await awardXP(reviewerId, 'FEEDBACK_GIVEN');

        // Update Reviewee's Reputation Score
        // (Average of all reviews)
        const aggregations = await prisma.peerReview.aggregate({
            where: { userId: revieweeId },
            _avg: { stars: true },
            _count: { id: true }
        });

        const newScore = aggregations._avg.stars || 0;
        const newCount = aggregations._count.id || 0;

        await prisma.user.update({
            where: { id: revieweeId },
            data: {
                reputationScore: newScore,
                reviewCount: newCount
            }
        });

        // Also award XP to Reviewee? Not in spec "Evaluate other peers +5XP", implies reviewer gets it.
        // "Experience will be related to small actions ... Evaluate other peers +5XP" -> This is for reviewer.
        // Does reviewee get XP? Spec doesn't say. Reputation assumes good reviews are reliable?
        // Spec said "Reputation will be différents bages of other peers...". 
        // I will stick to updating reputation score only.

        return NextResponse.json({ success: true, newReputation: newScore });

    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
