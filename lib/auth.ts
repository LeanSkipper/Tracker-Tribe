import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from './prisma';
import { canAccessGPS, canJoinTribes, canCreateTribes, canViewPeerGPS, canMonetizeTribe } from './permissions';

/**
 * Session user type with all necessary fields for permission checks
 */
export interface SessionUser {
    id: string;
    email: string; // Email is required for session
    name: string | null;
    userProfile: 'SOFT' | 'ENGAGED' | 'HARD';
    subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_FAILED';
    subscriptionPlan: string | null;
    trialStartDate: Date | null;
    trialEndDate: Date | null;
    graceStartDate: Date | null;
    graceEndDate: Date | null;
    reputationScore: number;
    profileCompleteness: number;
}

/**
 * Get user session from NextAuth and fetch full user data with permissions
 */
export async function getSession(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            email: true,
            name: true,
            userProfile: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialStartDate: true,
            trialEndDate: true,
            graceStartDate: true,
            graceEndDate: true,
            reputationScore: true,
            profileCompleteness: true,
        },
    });

    if (!user || !user.email) {
        // User must have an email to have a valid session
        return null;
    }

    // TypeScript now knows user.email is non-null after the check above
    return {
        id: user.id,
        email: user.email as string, // Guaranteed non-null by check above
        name: user.name,
        userProfile: user.userProfile as 'SOFT' | 'ENGAGED' | 'HARD',
        subscriptionStatus: user.subscriptionStatus as 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_FAILED',
        subscriptionPlan: user.subscriptionPlan,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        graceStartDate: user.graceStartDate,
        graceEndDate: user.graceEndDate,
        reputationScore: user.reputationScore,
        profileCompleteness: user.profileCompleteness,
    };
}

/**
 * Get user with all permission-related fields from database
 */
export async function getUserWithPermissions(userId: string): Promise<SessionUser | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            userProfile: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialStartDate: true,
            trialEndDate: true,
            graceStartDate: true,
            graceEndDate: true,
            reputationScore: true,
            profileCompleteness: true,
        },
    });

    if (!user || !user.email) {
        return null;
    }

    // Cast to SessionUser - the selected fields match our interface
    return {
        id: user.id,
        email: user.email as string, // Guaranteed non-null by check above
        name: user.name,
        userProfile: user.userProfile as 'SOFT' | 'ENGAGED' | 'HARD',
        subscriptionStatus: user.subscriptionStatus as 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_FAILED',
        subscriptionPlan: user.subscriptionPlan,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        graceStartDate: user.graceStartDate,
        graceEndDate: user.graceEndDate,
        reputationScore: user.reputationScore,
        profileCompleteness: user.profileCompleteness,
    };
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
    const session = await getSession();

    if (!session) {
        throw new Error('Authentication required');
    }

    return session;
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Authentication required') {
    return NextResponse.json(
        { error: message },
        { status: 401 }
    );
}

/**
 * Create a 403 Forbidden response
 */
export function forbiddenResponse(message: string = 'Access denied') {
    return NextResponse.json(
        { error: message },
        { status: 403 }
    );
}

/**
 * Permission check wrapper for API routes
 */
export async function checkPermission(
    user: SessionUser,
    permission: 'gps' | 'joinTribes' | 'createTribes' | 'viewPeerGPS' | 'monetizeTribe'
): Promise<{ allowed: boolean; message?: string }> {
    let allowed = false;
    let message = '';

    switch (permission) {
        case 'gps':
            allowed = canAccessGPS(user as any);
            if (!allowed) {
                message = 'GPS access requires an active subscription or trial period';
            }
            break;

        case 'joinTribes':
            allowed = canJoinTribes(user as any);
            if (!allowed) {
                message = 'Joining tribes requires an ENGAGED or HARD subscription';
            }
            break;

        case 'createTribes':
            allowed = canCreateTribes(user as any);
            if (!allowed) {
                message = 'Creating tribes requires a HARD subscription';
            }
            break;

        case 'viewPeerGPS':
            allowed = canViewPeerGPS(user as any);
            if (!allowed) {
                message = 'Viewing peer GPS requires an ENGAGED or HARD subscription';
            }
            break;

        case 'monetizeTribe':
            allowed = canMonetizeTribe(user as any);
            if (!allowed) {
                message = 'Monetizing tribes requires a HARD subscription';
            }
            break;
    }

    return { allowed, message };
}

/**
 * Get user permissions object for frontend
 */
export function getUserPermissions(user: SessionUser) {
    return {
        canAccessGPS: canAccessGPS(user as any),
        canJoinTribes: canJoinTribes(user as any),
        canCreateTribes: canCreateTribes(user as any),
        canViewPeerGPS: canViewPeerGPS(user as any),
        canMonetizeTribe: canMonetizeTribe(user as any),
        userProfile: user.userProfile,
        subscriptionStatus: user.subscriptionStatus,
        reputationScore: user.reputationScore,
    };
}
