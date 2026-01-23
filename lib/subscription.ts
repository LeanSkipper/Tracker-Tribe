
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CREATOR';

export interface UserSubscriptionData {
    userProfile: string | null;  // 'HARD' = Creator/Active, 'SOFT' = Free/Trial
    subscriptionStatus: string | null; // 'ACTIVE', 'TRIALING', 'bounced', etc.
    trialEndDate: Date | string | null;
}

export function getSubscriptionStatus(user: UserSubscriptionData): SubscriptionStatus {
    // 1. Creator (HARD) is always valid/active
    if (user.userProfile === 'HARD') return 'CREATOR';

    // 2. Check if explicit subscription is active
    if (user.subscriptionStatus === 'ACTIVE') return 'ACTIVE';

    // 3. Check Trial
    if (user.trialEndDate) {
        const now = new Date();
        const trialEnd = new Date(user.trialEndDate);
        if (trialEnd > now) {
            return 'TRIAL';
        }
    }

    // 4. Fallback -> Expired/Restricted
    return 'EXPIRED';
}

export function isRestricted(user: UserSubscriptionData): boolean {
    const status = getSubscriptionStatus(user);
    // Restricted if EXPIRED.
    // (Creators, Active Subscribers, and Trial users are NOT restricted)
    return status === 'EXPIRED';
}

export const LIMITS = {
    GOALS: 3,
    KPIS: 9
};
