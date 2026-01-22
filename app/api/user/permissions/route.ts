'use server';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
    canAccessGPS,
    canJoinTribes,
    canCreateTribes,
    canViewPeerGPS,
    canMonetizeTribe,
    isInTrial,
    isInGracePeriod,
    getTrialDaysRemaining,
    getGraceDaysRemaining
} from '@/lib/permissions';

/**
 * GET /api/user/permissions
 * Returns the current user's permissions and subscription status
 */
export async function GET() {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json({
                canAccessGPS: false,
                canJoinTribes: false,
                canCreateTribes: false,
                canViewPeerGPS: false,
                canMonetizeTribe: false,
                userProfile: 'SOFT',
                subscriptionStatus: 'EXPIRED',
                reputationScore: 0,
                trialDaysRemaining: 0,
                graceDaysRemaining: 0,
                isInGracePeriod: false,
                isInTrial: false,
            });
        }

        const permissions = {
            canAccessGPS: canAccessGPS(user as any),
            canJoinTribes: canJoinTribes(user as any),
            canCreateTribes: canCreateTribes(user as any),
            canViewPeerGPS: canViewPeerGPS(user as any),
            canMonetizeTribe: canMonetizeTribe(user as any),
            userProfile: user.userProfile || 'SOFT',
            subscriptionStatus: user.subscriptionStatus || 'TRIAL',
            reputationScore: user.reputationScore || 0,
            trialDaysRemaining: getTrialDaysRemaining(user as any),
            graceDaysRemaining: getGraceDaysRemaining(user as any),
            isInGracePeriod: isInGracePeriod(user as any),
            isInTrial: isInTrial(user as any),
        };

        return NextResponse.json(permissions);
    } catch (error) {
        console.error('[API] Error fetching permissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch permissions' },
            { status: 500 }
        );
    }
}
