/**
 * Guest User Authentication Library
 * Handles anonymous user sessions for onboarding without email
 */

import { prisma } from './prisma';
import { UserProfile, SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

const GUEST_SESSION_KEY = 'lapis_guest_session';
const GUEST_SESSION_EXPIRY_DAYS = 7;

/**
 * Generate a unique guest ID using timestamp and random string
 */
export function generateGuestId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `guest_${timestamp}_${randomStr}`;
}

/**
 * Create a new guest user session
 */
export async function createGuestSession() {
    const guestId = generateGuestId();

    const guestUser = await prisma.user.create({
        data: {
            guestId,
            isGuest: true,
            name: 'Guest User',
            email: null, // Guest users don't have email initially
            userProfile: UserProfile.STARTER,
            subscriptionStatus: SubscriptionStatus.FREE,
            subscriptionPlan: SubscriptionPlan.STARTER_FREE,
            maxGoals: 10, // Guests can create 10 goals
            lastActiveAt: new Date(),
        },
    });

    // Store guest session in localStorage (client-side)
    if (typeof window !== 'undefined') {
        const sessionData = {
            guestId,
            userId: guestUser.id,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + GUEST_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        };
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessionData));
    }

    return guestUser;
}

/**
 * Get current guest session from localStorage
 */
export function getGuestSessionData(): { guestId: string; userId: string; expiresAt: string } | null {
    if (typeof window === 'undefined') return null;

    const sessionStr = localStorage.getItem(GUEST_SESSION_KEY);
    if (!sessionStr) return null;

    try {
        const session = JSON.parse(sessionStr);

        // Check if session expired
        if (new Date(session.expiresAt) < new Date()) {
            localStorage.removeItem(GUEST_SESSION_KEY);
            return null;
        }

        return session;
    } catch (error) {
        console.error('Failed to parse guest session:', error);
        localStorage.removeItem(GUEST_SESSION_KEY);
        return null;
    }
}

/**
 * Get guest user from database
 */
export async function getGuestUser(guestId: string) {
    return await prisma.user.findUnique({
        where: { guestId },
    });
}

/**
 * Update guest user's last active timestamp
 */
export async function updateGuestActivity(guestId: string) {
    return await prisma.user.update({
        where: { guestId },
        data: { lastActiveAt: new Date() },
    });
}

/**
 * Convert guest user to full user with email/password
 */
export async function convertGuestToUser(
    guestId: string,
    email: string,
    password?: string,
    provider?: 'google' | 'linkedin' | 'credentials'
) {
    const guestUser = await prisma.user.findUnique({
        where: { guestId },
    });

    if (!guestUser) {
        throw new Error('Guest user not found');
    }

    if (!guestUser.isGuest) {
        throw new Error('User is not a guest');
    }

    // Update guest user to full user
    const updatedUser = await prisma.user.update({
        where: { id: guestUser.id },
        data: {
            email,
            password, // Should be hashed before calling this
            isGuest: false,
            convertedAt: new Date(),
            provider: provider || 'credentials',
            // Upgrade to trial
            subscriptionStatus: SubscriptionStatus.TRIAL,
            subscriptionPlan: SubscriptionPlan.ENGAGED_TRIAL,
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            maxGoals: -1, // Unlimited goals during trial
        },
    });

    // Clear guest session from localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_SESSION_KEY);
    }

    return updatedUser;
}

/**
 * Check if user is a guest
 */
export function isGuestSession(): boolean {
    return getGuestSessionData() !== null;
}

/**
 * Clear guest session
 */
export function clearGuestSession() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_SESSION_KEY);
    }
}

/**
 * Cleanup expired guest sessions (should be run periodically)
 */
export async function cleanupExpiredGuestSessions() {
    const expiryDate = new Date(Date.now() - GUEST_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.user.deleteMany({
        where: {
            isGuest: true,
            lastActiveAt: {
                lt: expiryDate,
            },
        },
    });

    return result.count;
}
