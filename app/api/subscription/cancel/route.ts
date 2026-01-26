import { NextResponse } from 'next/server';
import { getSession, unauthorizedResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const user = await getSession();

        if (!user) {
            return unauthorizedResponse('You must be signed in to cancel a subscription');
        }

        const { reason } = await req.json();

        // 1. Get user with subscription details
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                stripeSubscriptionId: true,
                subscriptionStatus: true,
                email: true,
            }
        });

        if (!dbUser || !dbUser.stripeSubscriptionId) {
            return NextResponse.json(
                { error: 'No active subscription found to cancel' },
                { status: 400 }
            );
        }

        // 2. Cancel in Stripe (at period end)
        if (stripe) {
            try {
                await stripe.subscriptions.update(dbUser.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                    metadata: {
                        cancellation_reason: reason || 'User requested via dashboard'
                    }
                });
            } catch (stripeError: any) {
                console.error('Stripe Cancellation Error:', stripeError);
                // If it's already canceled, we can proceed to update local DB implies success
                if (stripeError.code !== 'resource_missing') {
                    return NextResponse.json(
                        { error: 'Failed to process cancellation with payment provider' },
                        { status: 500 }
                    );
                }
            }
        }

        // 3. Update Local DB (Optional, but good for UI immediately)
        // We set status to CANCELLED locally if we want immediate feedback, 
        // OR we wait for webhook. 
        // Usually, 'active' + 'cancel_at_period_end' is still 'active' service-wise.
        // But we want to show "Cancels on [Date]" in UI.
        // For simplicity in this codebase, we can rely on Stripe Webhook to update status to EXPIRED later,
        // but we might want to store "cancellation pending".
        // Schema doesn't have "CANCELLATION_PENDING". 
        // We will just log the feedback and success.

        // 4. Store Feedback
        if (reason) {
            await prisma.feedback.create({
                data: {
                    content: `Cancellation Reason: ${reason}`,
                    userId: user.id,
                    email: dbUser.email,
                    page: 'CancellationModal'
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cancellation Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
