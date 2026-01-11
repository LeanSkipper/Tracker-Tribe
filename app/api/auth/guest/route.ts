import { NextResponse } from 'next/server';
import { createGuestSession, getGuestUser, updateGuestActivity } from '@/lib/guestAuth';

export const runtime = 'nodejs';

/**
 * POST /api/auth/guest
 * Create a new guest user session
 */
export async function POST() {
    try {
        const guestUser = await createGuestSession();

        return NextResponse.json({
            success: true,
            user: {
                id: guestUser.id,
                guestId: guestUser.guestId,
                name: guestUser.name,
                isGuest: guestUser.isGuest,
                maxGoals: guestUser.maxGoals,
            },
        });
    } catch (error) {
        console.error('Failed to create guest session:', error);
        return NextResponse.json(
            { error: 'Failed to create guest session' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/auth/guest?guestId=xxx
 * Get guest user information and update activity
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const guestId = searchParams.get('guestId');

        if (!guestId) {
            return NextResponse.json(
                { error: 'Guest ID is required' },
                { status: 400 }
            );
        }

        const guestUser = await getGuestUser(guestId);

        if (!guestUser) {
            return NextResponse.json(
                { error: 'Guest user not found' },
                { status: 404 }
            );
        }

        // Update last active timestamp
        await updateGuestActivity(guestId);

        return NextResponse.json({
            success: true,
            user: {
                id: guestUser.id,
                guestId: guestUser.guestId,
                name: guestUser.name,
                email: guestUser.email,
                isGuest: guestUser.isGuest,
                maxGoals: guestUser.maxGoals,
                subscriptionStatus: guestUser.subscriptionStatus,
            },
        });
    } catch (error) {
        console.error('Failed to get guest user:', error);
        return NextResponse.json(
            { error: 'Failed to get guest user' },
            { status: 500 }
        );
    }
}
