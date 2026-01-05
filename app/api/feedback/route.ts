import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Store feedback in database
        const feedbackEntry = await prisma.feedback.create({
            data: {
                content: feedback,
                email: email || null,
                page: page || null,
                userId: null, // Can be enhanced later with session
                createdAt: timestamp ? new Date(timestamp) : new Date(),
            },
        });

        // Optionally, you could also send an email notification here
        // or integrate with a service like Slack, Discord, etc.

        return NextResponse.json(
            {
                success: true,
                message: 'Feedback submitted successfully',
                id: feedbackEntry.id
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
