export interface RankInfo {
    name: string;
    icon: string;
    level: number;
}

export const RANKS: Record<string, RankInfo> = {
    SCOUT: { name: "Scout", icon: "Bronze Chevron", level: 1 },
    RANGER: { name: "Ranger", icon: "Silver Shield", level: 2 },
    GUARDIAN: { name: "Guardian", icon: "Gold Shield with Wings", level: 3 },
    CAPTAIN: { name: "Captain", icon: "Gold Bars", level: 4 },
    COMMANDER: { name: "Commander", icon: "Diamond Eagle", level: 5 },
};

export function calculateRank(user: any): RankInfo {
    if (user.manualRank && RANKS[user.manualRank.toUpperCase()]) {
        return RANKS[user.manualRank.toUpperCase()];
    }

    const now = new Date();
    const createdAt = new Date(user.createdAt);
    const monthsActive = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
    const yearsActive = monthsActive / 12;

    const hasGoGiver = user.achievements?.some((a: any) => a.badge?.name === "The Go-Giver");
    const taskCompletion = user.taskCompletionRate || 0;
    const attendance = user.sessionsAttended; // This would ideally be a rate for Ranger, but using raw count as requested or assuming last 10 weeks logic

    // Using a simplified logic for the "80% last 10 weeks" since we don't have the history query here, 
    // we assume sessionsAttended represents the relevant metric for this calculation in the simplified model.
    const attendanceRate = user.sessionsAttended > 0 ? (user.sessionsAttended / Math.max(user.sessionsAttended, 10)) : 0;

    // Rank 4: Captain
    if (yearsActive >= 1 && taskCompletion >= 0.85) {
        return RANKS.CAPTAIN;
    }

    // Rank 3: Guardian
    if (monthsActive >= 6 && user.totalSponsorship >= 500 && hasGoGiver) {
        return RANKS.GUARDIAN;
    }

    // Rank 2: Ranger
    if (attendanceRate >= 0.8 && taskCompletion >= 0.6) {
        return RANKS.RANGER;
    }

    // Rank 1: Scout (Default)
    return RANKS.SCOUT;
}
