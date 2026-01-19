import { prisma } from '@/lib/prisma'; // Assuming global prisma client exists here, or I will adapt import

// XP Values
export const XP_TABLE = {
    FEEDBACK_GIVEN: 1,
    TASK_GENERATED: 2,
    TASK_COMPLETED: 3,
    KPI_RED: 5,
    KPI_GREEN: 10,
    OKR_GREEN: 30,
    SESSION_ATTENDED: 5,
    PEER_EVALUATION_GIVEN: 5,
    WEEKLY_CHECKIN: 10,

    // Negatives
    SESSION_MISSED: -5,
    TASK_LATE: -2,
    NO_WEEKLY_CHECKIN: -10
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
