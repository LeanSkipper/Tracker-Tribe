/**
 * Permissions & Access Control System
 * 
 * This module handles all permission checks for the three-tier user profile system:
 * - SOFT: Free tier with 3-month trial, GPS access only
 * - ENGAGED: Paid tier, can join tribes and view peer GPS
 * - HARD: Creator tier, can create and monetize tribes
 */

import { User, UserProfile, SubscriptionStatus } from '@prisma/client';

/**
 * Check if user can access GPS (OBEYA) features
 * 
 * Rules:
 * - SOFT users: Only during trial or grace period (with 20% surcharge)
 * - ENGAGED/HARD users: Only with active subscription
 */
export const canAccessGPS = (user: User): boolean => {
    const now = new Date();

    console.log('[canAccessGPS] Checking access for user:', {
        subscriptionStatus: user.subscriptionStatus,
        trialEndDate: user.trialEndDate,
        graceEndDate: user.graceEndDate,
        now: now.toISOString(),
    });

    // Check if trial is still active (applies to all profiles)
    if (user.subscriptionStatus === 'TRIAL' && user.trialEndDate) {
        const trialEnd = new Date(user.trialEndDate);
        const hasAccess = now < trialEnd;
        console.log('[canAccessGPS] TRIAL check:', { trialEnd: trialEnd.toISOString(), hasAccess });
        return hasAccess;
    }

    // Check if in grace period (applies to all profiles)
    if (user.subscriptionStatus === 'GRACE_PERIOD' && user.graceEndDate) {
        const graceEnd = new Date(user.graceEndDate);
        const hasAccess = now < graceEnd;
        console.log('[canAccessGPS] GRACE_PERIOD check:', { graceEnd: graceEnd.toISOString(), hasAccess });
        return hasAccess;
    }

    // Check if they have an active subscription
    const hasAccess = user.subscriptionStatus === 'ACTIVE';
    console.log('[canAccessGPS] ACTIVE check:', { hasAccess });
    return hasAccess;
};

/**
 * Check if user can join tribes
 * 
 * Rules:
 * - Only ENGAGED and HARD users
 * - Must have active subscription
 */
export const canJoinTribes = (user: User): boolean => {
    return ['ENGAGED', 'HARD'].includes(user.userProfile) &&
        user.subscriptionStatus === 'ACTIVE';
};

/**
 * Check if user can create tribes
 * 
 * Rules:
 * - Only HARD users
 * - Must have active subscription
 */
export const canCreateTribes = (user: User): boolean => {
    return user.userProfile === 'HARD' &&
        user.subscriptionStatus === 'ACTIVE';
};

/**
 * Check if user can view another user's GPS
 * 
 * Rules:
 * - Only ENGAGED and HARD users
 * - Must have active subscription
 * - Must share a tribe or be matched peers
 * 
 * Note: This is a basic check. Additional checks should be done
 * to verify tribe membership or peer matching status.
 */
export const canViewPeerGPS = (user: User, peer?: User): boolean => {
    if (!canJoinTribes(user)) return false;

    // Additional checks for tribe membership or peer matching
    // should be done in the API endpoints
    return true;
};

/**
 * Check if user can monetize tribes (set prices and earn revenue)
 * 
 * Rules:
 * - Only HARD users
 * - Must have active subscription
 * - Note: HARD users can create free tribes (no commission)
 */
export const canMonetizeTribe = (user: User): boolean => {
    return user.userProfile === 'HARD' &&
        user.subscriptionStatus === 'ACTIVE';
};

/**
 * Check if user is in trial period
 */
export const isInTrial = (user: User): boolean => {
    return user.subscriptionStatus === 'TRIAL' &&
        user.trialEndDate !== null &&
        new Date() < new Date(user.trialEndDate);
};

/**
 * Check if user is in grace period
 */
export const isInGracePeriod = (user: User): boolean => {
    return user.subscriptionStatus === 'GRACE_PERIOD' &&
        user.graceEndDate !== null &&
        new Date() < new Date(user.graceEndDate);
};

/**
 * Get days remaining in trial
 */
export const getTrialDaysRemaining = (user: User): number => {
    if (!user.trialEndDate) return 0;

    const now = new Date();
    const endDate = new Date(user.trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};

/**
 * Get days remaining in grace period
 */
export const getGraceDaysRemaining = (user: User): number => {
    if (!user.graceEndDate) return 0;

    const now = new Date();
    const endDate = new Date(user.graceEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};

/**
 * Check if user can upgrade to a specific profile
 * 
 * Rules:
 * - Progressive upgrades allowed: SOFT → ENGAGED → HARD
 * - Can skip levels: SOFT → HARD directly
 */
export const canUpgradeTo = (user: User, targetProfile: UserProfile): boolean => {
    const profileOrder: UserProfile[] = ['SOFT', 'ENGAGED', 'HARD'];
    const currentIndex = profileOrder.indexOf(user.userProfile);
    const targetIndex = profileOrder.indexOf(targetProfile);

    // Can only upgrade to higher tiers
    return targetIndex > currentIndex;
};

/**
 * Get user profile display name
 */
export const getProfileDisplayName = (profile: UserProfile): string => {
    const names = {
        SOFT: 'Explorer',
        ENGAGED: 'Member',
        HARD: 'Creator'
    };
    return names[profile];
};

/**
 * Get subscription status display name
 */
export const getSubscriptionStatusDisplayName = (status: SubscriptionStatus): string => {
    const names: Record<SubscriptionStatus, string> = {
        FREE: 'Free',
        TRIAL: 'Free Trial',
        ACTIVE: 'Active',
        GRACE_PERIOD: 'Grace Period',
        EXPIRED: 'Expired',
        CANCELLED: 'Cancelled',
        PAYMENT_FAILED: 'Payment Failed'
    };
    return names[status];
};

/**
 * Calculate grace period surcharge amount
 * Grace period has 20% extra charge
 */
export const calculateGraceSurcharge = (baseAmount: number): number => {
    const GRACE_SURCHARGE_RATE = 0.20; // 20%
    return baseAmount * (1 + GRACE_SURCHARGE_RATE);
};

/**
 * NEW 3-TIER MODEL PERMISSIONS
 */

/**
 * Check if user can save GPS data (not just view)
 * 
 * Rules:
 * - Guests: Cannot save (read-only demo mode)
 * - Trial users: Can save
 * - Subscribed users: Can save
 */
export const canSaveGPS = (user: User | null): boolean => {
    if (!user) return false; // Guest users cannot save
    return canAccessGPS(user); // Trial and subscribed can save
};

/**
 * Check if user can view masterminds/tribes
 * 
 * Rules:
 * - Guests: Cannot view (show tutorial modal)
 * - Trial users: Can view (read-only)
 * - Subscribed users: Can view and interact
 */
export const canViewMasterminds = (user: User | null): boolean => {
    if (!user) return false; // Guests cannot view

    // Trial users can view in read-only mode
    if (isInTrial(user)) return true;

    // Subscribed users can view
    return canJoinTribes(user);
};

/**
 * Check if user can create masterminds/tribes
 * 
 * Rules:
 * - Guests: Cannot create
 * - Trial users: Cannot create
 * - Subscribed users: Can create (HARD profile only)
 */
export const canCreateMasterminds = (user: User | null): boolean => {
    if (!user) return false;
    return canCreateTribes(user); // Only HARD with active subscription
};

/**
 * Check if user can interact with masterminds (not just view)
 * 
 * Rules:
 * - Guests: Cannot interact
 * - Trial users: Cannot interact (read-only)
 * - Subscribed users: Can interact
 */
export const canInteractWithMasterminds = (user: User | null): boolean => {
    if (!user) return false;
    if (isInTrial(user)) return false; // Trial is read-only
    return canJoinTribes(user);
};

/**
 * Check if user is eligible for trial discount (20% off)
 * 
 * Rules:
 * - Must be in trial period
 * - Must not have used discount before
 * - Must subscribe within 60 days of trial start
 */
export const isTrialDiscountEligible = (user: User): boolean => {
    if (!isInTrial(user)) return false;

    // Check if discount was already used (requires new DB field)
    // For now, assume eligible if in trial
    return true;
};

/**
 * Get user tier for display
 * 
 * Returns: 'visitor' | 'trial' | 'subscribed'
 */
export const getUserTier = (user: User | null): 'visitor' | 'trial' | 'subscribed' => {
    if (!user) return 'visitor';
    if (isInTrial(user)) return 'trial';
    if (user.subscriptionStatus === 'ACTIVE') return 'subscribed';
    return 'visitor';
};

