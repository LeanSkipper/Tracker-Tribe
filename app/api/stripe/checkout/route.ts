import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        console.log('Stripe Key Loaded:', !!process.env.STRIPE_SECRET_KEY, 'Length:', process.env.STRIPE_SECRET_KEY?.length);
        const { priceId, planType, userId, userEmail, customAmount } = await req.json();

        if ((!priceId && !planType) || !userId || !userEmail) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        let lineItem;
        let finalPriceId = priceId;
        const metadata: any = { userId };
        const subscriptionMetadata: any = { userId };

        if (planType === 'CREATOR') {
            if (!customAmount || customAmount < 200) {
                return NextResponse.json({ error: "Invalid custom amount for Creator Plan (Min $200)" }, { status: 400 });
            }

            // Dynamic price creation for Creator Plan
            lineItem = {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Lapis Creator (Early Adopter)',
                        description: '1 Year Access to Creator Privileges. Includes Tribe Leadership, Monetization & Priority Support.',
                    },
                    unit_amount: Math.round(customAmount * 100), // cents
                    recurring: { interval: 'year' as const },
                },
                quantity: 1,
            };

            // Add profile upgrade metadata
            metadata.userProfile = 'HARD';
            subscriptionMetadata.userProfile = 'HARD';

        } else if (planType === 'ENGAGED') {
            if (!customAmount || customAmount < 120) {
                return NextResponse.json({ error: "Invalid custom amount for Engaged Plan (Min $120)" }, { status: 400 });
            }

            // Dynamic price creation for Engaged Plan
            lineItem = {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Lapis Engaged Member',
                        description: '1 Year Access to Full Platform. Includes Unlimited Goals, Full GPS & Community Access.',
                    },
                    unit_amount: Math.round(customAmount * 100), // cents
                    recurring: { interval: 'year' as const },
                },
                quantity: 1,
            };

            // Add profile upgrade metadata
            metadata.userProfile = 'ENGAGED';
            subscriptionMetadata.userProfile = 'ENGAGED';
        } else {
            // Standard Plans
            if (planType === 'MONTHLY') {
                finalPriceId = process.env.STRIPE_PRICE_ID_MONTHLY;
            } else if (planType === 'YEARLY') {
                finalPriceId = process.env.STRIPE_PRICE_ID_YEARLY;
            }

            if (!finalPriceId) {
                return NextResponse.json({ error: "Invalid price configuration" }, { status: 500 });
            }

            lineItem = {
                price: finalPriceId,
                quantity: 1,
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get or create Stripe Customer
        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userEmail,
                name: user.name || undefined,
                metadata: {
                    userId: userId
                }
            });
            customerId = customer.id;

            // Save customer ID to user
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }

        // Create Checkout Session
        // @ts-ignore - Stripe types might be strict about line_items structure
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [lineItem], // Use the constructed lineItem
            mode: 'subscription',
            payment_method_types: ['card'], // Explicitly enable card payments
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/obeya?success=true&upgraded=true`, // Redirect directly to Obeya
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/creator-offer?canceled=true`,
            metadata: metadata,
            subscription_data: {
                metadata: subscriptionMetadata
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout Error (Detailed):", {
            message: error.message,
            type: error.type,
            code: error.code,
            param: error.param,
            stack: error.stack
        });
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
