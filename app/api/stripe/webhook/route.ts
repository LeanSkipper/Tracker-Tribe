import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        // Validation needs the raw body - in Next.js App Router req.text() gives us that
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            // For initial testing without webhook secret, just parse without verification
            // WARNING: Only for dev/testing. Functionality is limited without verification logic which relies on secret
            console.warn("Missing STRIPE_WEBHOOK_SECRET, skipping signature verification");
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        }
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                // Subscription was created
                const subscriptionId = session.subscription as string;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error("Webhook Error: No userId in metadata");
                    break;
                }

                // Get subscription details to know end date
                const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        stripeSubscriptionId: subscriptionId,
                        subscriptionStatus: "ACTIVE",
                        subscriptionStartDate: new Date(subscription.current_period_start * 1000),
                        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                        // We could map the price ID to a plan enum here if needed
                    }
                });
                break;
            }
            case "invoice.payment_succeeded": {
                // Subscription renewed
                const subscriptionId = (event.data.object as Stripe.Invoice).subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                // Find user by subscription ID
                const user = await prisma.user.findUnique({
                    where: { stripeSubscriptionId: subscriptionId }
                });

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            subscriptionStatus: "ACTIVE",
                            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                        }
                    });
                }
                break;
            }
            case "customer.subscription.deleted": {
                // Subscription canceled/expired
                const subscriptionId = (event.data.object as Stripe.Subscription).id;

                await prisma.user.update({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: {
                        subscriptionStatus: "CANCELED", // Or revert to FREE/SOFT
                        // Keep end date so they have access until then? 
                        // Usually deleted means immediate or end of period passed.
                    }
                });
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error("Webhook handler failed:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
