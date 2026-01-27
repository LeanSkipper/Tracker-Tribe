/**
 * Reputation & Badge System
 * 
 * This module handles reputation score calculation based on badges.
 * Reputation acts as a "track record" similar to Tinder profiles or CVs,
 * helping users join or create tables.
 */

import { User, UserAchievement, BadgeCatalog } from '@prisma/client';

type UserWithAchievements = User & {
    achievements: (UserAchievement & {
        badge: BadgeCatalog;
    })[];
};

/**
 * Calculate user's reputation score based on badges
 * 
 * Factors:
 * - Badge reputation value (set in BadgeCatalog)
 * - Verified badges count 1.5x more
 * - Recent badges count more (recency multiplier)
 * - Profile completeness bonus (up to 10 points)
 * 
 * @param user User with achievements and badges
 * @returns Reputation score (0-1000+)
 */
export const calculateReputationScore = (user: UserWithAchievements): number => {
    const badges = user.achievements;
    let score = 0;

    badges.forEach(achievement => {
        const badge = achievement.badge;
        let value = badge.reputationValue;

        // Verified badges count more
        if (badge.isVerified) {
            value *= 1.5;
        }

        // Recent badges count more
        const monthsOld = (Date.now() - achievement.earnedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
        const recencyMultiplier = Math.max(0.5, 1 - (monthsOld / 12));

        score += value * recencyMultiplier;
    });

    // Profile completeness bonus (0-10 points)
    score += (user.profileCompleteness / 100) * 10;

    return Math.round(score);
};

/**
 * Calculate profile completeness percentage
 * 
 * Checks:
 * - Name (10%)
 * - Bio (15%)
 * - Avatar (10%)
 * - Life Vision (15%)
 * - Skills (20%)
 * - At least 1 goal (15%)
 * - At least 1 badge (15%)
 * 
 * @param user User object
 * @param goalCount Number of goals user has
 * @param badgeCount Number of badges user has
 * @returns Completeness percentage (0-100)
 */
export const calculateProfileCompleteness = (
    user: User,
    goalCount: number = 0,
    badgeCount: number = 0
): number => {
    let completeness = 0;

    if (user.name && user.name.trim().length > 0) completeness += 10;
    if (user.bio && user.bio.trim().length > 0) completeness += 15;
    if (user.avatarUrl && user.avatarUrl.trim().length > 0) completeness += 10;
    if (user.lifeVision && user.lifeVision.trim().length > 0) completeness += 15;
    if (user.skillMatrix && user.skillMatrix.trim().length > 0) completeness += 20;
    if (goalCount > 0) completeness += 15;
    if (badgeCount > 0) completeness += 15;

    return Math.min(100, completeness);
};

/**
 * Check if user meets tribe's reputation requirements
 * 
 * @param user User object
 * @param minReputationScore Minimum reputation required (null = no requirement)
 * @param minBadgeCount Minimum badge count required (null = no requirement)
 * @param userBadgeCount User's current badge count
 * @returns True if user meets requirements
 */
export const meetsReputationRequirements = (
    user: User,
    minReputationScore: number | null,
    minBadgeCount: number | null,
    userBadgeCount: number
): boolean => {
    // Check reputation score requirement
    if (minReputationScore !== null && user.reputationScore < minReputationScore) {
        return false;
    }

    // Check badge count requirement
    if (minBadgeCount !== null && userBadgeCount < minBadgeCount) {
        return false;
    }

    return true;
};

/**
 * Get reputation tier based on score
 * 
 * Tiers:
 * - Newcomer: 0-99
 * - Contributor: 100-299
 * - Established: 300-599
 * - Veteran: 600-999
 * - Legend: 1000+
 */
export const getReputationTier = (score: number): {
    tier: string;
    color: string;
    icon: string;
} => {
    if (score >= 1000) {
        return { tier: 'Legend', color: '#FFD700', icon: '👑' };
    } else if (score >= 600) {
        return { tier: 'Veteran', color: '#9B59B6', icon: '⭐' };
    } else if (score >= 300) {
        return { tier: 'Established', color: '#3498DB', icon: '💎' };
    } else if (score >= 100) {
        return { tier: 'Contributor', color: '#2ECC71', icon: '🌟' };
    } else {
        return { tier: 'Newcomer', color: '#95A5A6', icon: '🌱' };
    }
};

/**
 * Get badge verification status display
 */
export const getBadgeVerificationStatus = (badge: BadgeCatalog): {
    status: string;
    color: string;
    icon: string;
} => {
    if (badge.isVerified) {
        return { status: 'Verified', color: '#3498DB', icon: '✓' };
    }
    return { status: 'Unverified', color: '#95A5A6', icon: '○' };
};

/**
 * Sort badges by importance for showcase
 * Priority: verified > high reputation value > recent
 */
export const sortBadgesForShowcase = (
    achievements: (UserAchievement & { badge: BadgeCatalog })[]
): (UserAchievement & { badge: BadgeCatalog })[] => {
    return [...achievements].sort((a, b) => {
        // Verified badges first
        if (a.badge.isVerified && !b.badge.isVerified) return -1;
        if (!a.badge.isVerified && b.badge.isVerified) return 1;

        // Then by reputation value
        if (a.badge.reputationValue !== b.badge.reputationValue) {
            return b.badge.reputationValue - a.badge.reputationValue;
        }

        // Then by recency
        return b.earnedAt.getTime() - a.earnedAt.getTime();
    });
};

/**
 * Get top N badges for showcase
 */
export const getTopBadges = (
    achievements: (UserAchievement & { badge: BadgeCatalog })[],
    count: number = 5
): (UserAchievement & { badge: BadgeCatalog })[] => {
    const sorted = sortBadgesForShowcase(achievements);
    return sorted.slice(0, count);
};
