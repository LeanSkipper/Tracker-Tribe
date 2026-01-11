import { NextResponse } from 'next/server';
import { convertGuestToUser } from '@/lib/guestAuth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/**
 * POST /api/auth/convert
 * Convert a guest user to a full user account
 * 
 * Body: {
 *   guestId: string,
 *   email: string,
 *   password?: string,
 *   provider?: 'google' | 'linkedin' | 'credentials'
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guestId, email, password, provider } = body;

        if (!guestId || !email) {
            return NextResponse.json(
                { error: 'Guest ID and email are required' },
                { status: 400 }
            );
        }

        // Hash password if provided
        let hashedPassword: string | undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Convert guest to full user
        const user = await convertGuestToUser(
            guestId,
            email,
            hashedPassword,
            provider || 'credentials'
        );

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subscriptionStatus: user.subscriptionStatus,
                subscriptionPlan: user.subscriptionPlan,
                trialEndDate: user.trialEndDate,
                maxGoals: user.maxGoals,
            },
            message: 'Account created successfully! Your 60-day free trial has started.',
        });
    } catch (error: any) {
        console.error('Failed to convert guest user:', error);

        // Handle specific errors
        if (error.message === 'Guest user not found') {
            return NextResponse.json(
                { error: 'Guest session not found' },
                { status: 404 }
            );
        }

        if (error.message === 'User is not a guest') {
            return NextResponse.json(
                { error: 'User already has an account' },
                { status: 400 }
            );
        }

        // Check for duplicate email
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
