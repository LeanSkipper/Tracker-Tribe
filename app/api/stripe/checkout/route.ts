import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        console.log('Stripe Key Loaded:', !!process.env.STRIPE_SECRET_KEY, 'Length:', process.env.STRIPE_SECRET_KEY?.length);
        const { priceId, planType, userId, userEmail } = await req.json();

        if ((!priceId && !planType) || !userId || !userEmail) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        let finalPriceId = priceId;
        if (planType === 'MONTHLY') {
            finalPriceId = process.env.STRIPE_PRICE_ID_MONTHLY;
        } else if (planType === 'YEARLY') {
            finalPriceId = process.env.STRIPE_PRICE_ID_YEARLY;
        }

        if (!finalPriceId) {
            return NextResponse.json({ error: "Invalid price configuration" }, { status: 500 });
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
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: finalPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/upgrade?canceled=true`,
            metadata: {
                userId: userId,
            },
            subscription_data: {
                metadata: {
                    userId: userId
                }
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
