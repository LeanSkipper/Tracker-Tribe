import { prisma } from '@/lib/prisma'; // Assuming global prisma client exists here, or I will adapt import

// XP Values
export const XP_TABLE = {
    REFERRAL_OPENED: 50,
    FEEDBACK_GIVEN: 1,
    TASK_GENERATED: 2,
    TASK_COMPLETED: 3,
    KPI_RED: 5,
    KPI_GREEN: 10,
    OKR_RED: 20,
    OKR_GREEN: 50,
    SESSION_ATTENDED: 10,
    OKR_QUARTER_ACHIEVED: 200,
    KPI_QUARTER_ACHIEVED: 40,
    PIT_STOP_COMPLETED: 20,

    // Negatives
    SESSION_MISSED: -10,
    PIT_STOP_MISS_WEEK: -10,
    PIT_STOP_LATE_WEEK: -5,
} as const;

export type XPAction = keyof typeof XP_TABLE;

/**
 * Calculates Grit based on lifetime positive and negative XP.
 * Formula: (1 - (TotalNegativeXP / TotalPositiveXP)) * 100
 * Clamped between 0 and 100.
 * If TotalPositiveXP is 0, Grit is 100 (benefit of doubt) or 0? 
 * Let's say 100 for now to avoid punishing new users, unless they have negatives.
 */
export function calculateGrit(positive: number, negative: number): number {
    if (positive === 0) return negative > 0 ? 0 : 100;

    // Use absolute values just in case
    const pos = Math.abs(positive);
    const neg = Math.abs(negative);

    const ratio = neg / pos;
    const grit = (1 - ratio) * 100;

    return Math.max(0, Math.min(100, Math.round(grit)));
}

/**
 * consistently calculates the Global Score (Ranking Score)
 * Formula: Level * (Grit%) * XP * Reputation
 * Matches Profile Logic
 */
export function calculateGlobalScore(user: { level: number, grit: number, currentXP: number, reputationScore: number }) {
    const gritPercent = (user.grit / 100) || 0.1;
    const rankingXP = user.currentXP || 1;
    const rankingRep = user.reputationScore || 1;
    return Math.round(user.level * gritPercent * rankingXP * rankingRep);
}

/**
 * Awards XP to a user and handles levelling and grit updates.
 * Usage: await awardXP('user-id', 'TASK_COMPLETED');
 */
export async function awardXP(userId: string, action: XPAction) {
    const xpAmount = XP_TABLE[action];
    const isPositive = xpAmount > 0;

    try {
        // Fetch current state
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                currentXP: true,
                level: true,
                lifetimePositiveXP: true,
                lifetimeNegativeXP: true
            }
        });

        if (!user) throw new Error('User not found');

        // Calculate new values
        let newCurrentXP = user.currentXP + xpAmount;
        let newLevel = user.level;

        // Handle Level Up (Unlimited levels, every 1000 XP)
        if (newCurrentXP >= 1000) {
            const levelsGained = Math.floor(newCurrentXP / 1000);
            newLevel += levelsGained;
            newCurrentXP = newCurrentXP % 1000;
        }

        // Handle negative XP dropping level? 
        // User said "Level will be increased every 1000XP". Didn't specify dropping.
        // Assuming level never drops, but currentXP can go negative? 
        // Let's prevent currentXP from going below 0 for now to keep it simple, 
        // OR allow it. "Level ... start from 0 of the next level".
        // If I have 50 XP and get -10, I have 40. 
        // If I have 0 XP and get -10? 
        // Let's just track the raw change for currentXP.

        // Update Lifetimes
        const newLifetimePos = user.lifetimePositiveXP + (isPositive ? xpAmount : 0);
        const newLifetimeNeg = user.lifetimeNegativeXP + (isPositive ? 0 : Math.abs(xpAmount));

        // Recalculate Grit
        const newGrit = calculateGrit(newLifetimePos, newLifetimeNeg);

        // Update User
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentXP: newCurrentXP,
                level: newLevel,
                lifetimePositiveXP: newLifetimePos,
                lifetimeNegativeXP: newLifetimeNeg,
                grit: newGrit
            }
        });

        return { success: true, newLevel, newCurrentXP, newGrit, amount: xpAmount };

    } catch (error) {
        console.error('Error in awardXP:', error);
        return { success: false, error };
    }
}
