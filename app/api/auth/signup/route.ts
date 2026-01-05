import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

export const runtime = "nodejs";

// POST /api/auth/signup - Register new user with profile selection
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            name,
            userProfile = 'SOFT',
            subscriptionPlan
        } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }
        // Calculate trial/subscription dates based on profile
        const now = new Date();
        let trialStartDate: Date | null = null;
        let trialEndDate: Date | null = null;
        let subscriptionStatus: 'TRIAL' | 'ACTIVE' = 'TRIAL';
        let selectedPlan: SubscriptionPlan | null = null;

        if (userProfile === 'SOFT') {
            // SOFT users get 3-month free trial
            // Note: Schema doesn't have SOFT_FREE_TRIAL, using SOFT_FREE
            trialStartDate = now;
            trialEndDate = new Date(now);
            trialEndDate.setMonth(trialEndDate.getMonth() + 3);
            subscriptionStatus = 'TRIAL';
            selectedPlan = SubscriptionPlan.SOFT_FREE;
        } else if (userProfile === 'ENGAGED' || userProfile === 'HARD') {
            // ENGAGED and HARD users need to subscribe immediately
            // For now, we'll set them as TRIAL and require payment in onboarding
            // In production, this would integrate with Stripe
            subscriptionStatus = 'TRIAL';

            // Map string input to Enum if provided, otherwise default
            if (subscriptionPlan && Object.values(SubscriptionPlan).includes(subscriptionPlan as SubscriptionPlan)) {
                selectedPlan = subscriptionPlan as SubscriptionPlan;
            } else {
                selectedPlan = userProfile === 'ENGAGED'
                    ? SubscriptionPlan.ENGAGED_MONTHLY
                    : SubscriptionPlan.HARD_MONTHLY;
            }
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password, // TODO: Hash password with bcrypt in production
                name,
                userProfile,
                subscriptionStatus,
                ...(selectedPlan && { subscriptionPlan: selectedPlan }),
                ...(trialStartDate && { trialStartDate }),
                ...(trialEndDate && { trialEndDate }),
                // Initialize reputation and completeness
                reputationScore: 0,
                profileCompleteness: name ? 10 : 0, // 10% for having a name
            }
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            message: userProfile === 'SOFT'
                ? "Account created! Your 3-month free trial has started."
                : "Account created! Please complete payment to activate your subscription."
        });

    } catch (error) {
        console.error("=== SIGNUP ERROR ===");
        console.error("Error type:", typeof error);
        console.error("Error:", error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Prisma client available:", !!prisma);
        console.error("Prisma user model:", prisma.user ? 'Available' : 'Not available');
        console.error("===================");

        return NextResponse.json(
            {
                error: "Failed to create account",
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
