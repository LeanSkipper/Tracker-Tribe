import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { feedback, email, page, timestamp } = body;

        if (!feedback || typeof feedback !== 'string') {
            return NextResponse.json(
                { error: 'Feedback is required' },
                { status: 400 }
            );
        }

        const session = await getSession();
        let xpEarned = 0;
        let userId: string | null = null;

        if (session) {
            userId = session.id;
            // Base XP for feedback
            xpEarned += 1;

            // Extra XP for email (if provided)
            if (email) {
                xpEarned += 1;
            }

            // Update user XP
            if (xpEarned > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        experience: { increment: xpEarned }
                    }
                });
            }
        }

        // Store feedback in database
        const feedbackEntry = await prisma.feedback.create({
            data: {
                content: feedback,
                email: email || (session ? session.email : null),
                page: page || null,
                userId: userId,
                createdAt: timestamp ? new Date(timestamp) : new Date(),
            },
        });

        // Optionally, you could also send an email notification here
        // or integrate with a service like Slack, Discord, etc.

        return NextResponse.json(
            {
                success: true,
                message: 'Feedback submitted successfully',
                id: feedbackEntry.id,
                xpEarned
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        );
    }
}
