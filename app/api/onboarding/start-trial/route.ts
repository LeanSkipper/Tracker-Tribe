import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubscriptionPlan, UserProfile } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // User exists - check if they can start trial
            if (user.subscriptionStatus === 'TRIAL' || user.subscriptionStatus === 'ACTIVE') {
                return NextResponse.json({
                    success: true, // Treat as success for "ensure user" purpose
                    message: 'You already have an active trial or subscription',
                    user: {
                        id: user.id,
                        email: user.email,
                        subscriptionStatus: user.subscriptionStatus,
                        trialEndDate: user.trialEndDate,
                        maxGoals: user.maxGoals,
                    }
                });
            }

            // Activate trial for existing user
            const trialStart = new Date();
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 60); // 60 days from now

            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: 'TRIAL',
                    subscriptionPlan: SubscriptionPlan.ENGAGED_TRIAL as SubscriptionPlan,
                    userProfile: UserProfile.ENGAGED,
                    maxGoals: -1, // Unlimited
                    trialStartDate: trialStart,
                    trialEndDate: trialEnd,
                }
            });
        } else {
            // Create new user with trial
            const trialStart = new Date();
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 60);

            user = await prisma.user.create({
                data: {
                    email,
                    subscriptionStatus: 'TRIAL',
                    subscriptionPlan: SubscriptionPlan.ENGAGED_TRIAL as SubscriptionPlan,
                    userProfile: UserProfile.ENGAGED,
                    maxGoals: -1, // Unlimited
                    trialStartDate: trialStart,
                    trialEndDate: trialEnd,
                }
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                subscriptionStatus: user.subscriptionStatus,
                trialEndDate: user.trialEndDate,
                maxGoals: user.maxGoals,
            }
        });

    } catch (error) {
        console.error('Error starting trial:', error);
        return NextResponse.json(
            {
                message: 'Failed to start trial',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
