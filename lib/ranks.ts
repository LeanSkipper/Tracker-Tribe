import { prisma } from "./prisma";

export const RANKS = ["Scout", "Ranger", "Guardian", "Captain", "Commander"];

export async function getUserRank(userId: string): Promise<string> {
    const user: any = await (prisma.user as any).findUnique({
        where: { id: userId },
        include: {
            achievements: {
                include: {
                    badge: true
                }
            }
        }
    });

    if (!user) return "Scout";

    // 1. Manual Rank Override (for debugging/admin)
    if (user.manualRank && RANKS.includes(user.manualRank)) {
        return user.manualRank;
    }

    // 2. Find the highest Rank badge
    const rankBadges = user.achievements
        .filter(a => a.badge.type === "Rank")
        .map(a => a.badge.name);

    let highestRank = "Scout";
    let highestIndex = 0;

    for (const badgeName of rankBadges) {
        const index = RANKS.indexOf(badgeName);
        if (index > highestIndex) {
            highestIndex = index;
            highestRank = badgeName;
        }
    }

    return highestRank;
}

export function isAtLeastRank(currentRank: string, requiredRank: string): boolean {
    const currentIndex = RANKS.indexOf(currentRank);
    const requiredIndex = RANKS.indexOf(requiredRank);
    return currentIndex >= requiredIndex;
}
