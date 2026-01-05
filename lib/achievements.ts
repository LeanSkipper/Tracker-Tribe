import { prisma } from "./prisma";

export async function checkAndAwardAchievements(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            rituals: { orderBy: { date: 'desc' }, take: 12 },
            actions: { orderBy: { dueDate: 'desc' }, take: 50 }, // assume last 50 actions for streak check
            achievements: { include: { badge: true } }
        }
    });

    if (!user) return;

    const existingBadges = new Set(user.achievements.map(a => a.badge.name));
    const newlyAwarded: string[] = [];

    // --- Helper to award badge ---
    const award = async (badgeName: string) => {
        if (existingBadges.has(badgeName)) return;
        const badge = await prisma.badgeCatalog.findUnique({ where: { name: badgeName } });
        if (badge) {
            await prisma.userAchievement.create({
                data: {
                    userId,
                    badgeId: badge.id
                }
            });
            newlyAwarded.push(badgeName);
        }
    };

    // --- Service / Attendance Badges ---
    if (user.sessionsAttended >= 25) await award("Bronze Star");
    if (user.sessionsAttended >= 50) await award("Silver Star");
    if (user.sessionsAttended >= 75) await award("Gold Star");

    // Iron Man: 100% attendance for 12 weeks
    if (user.rituals.length >= 12 && user.rituals.every(r => r.attendance)) {
        await award("Iron Man");
    }

    // --- Merit / Performance Badges ---
    // The Investor
    if (user.totalSponsorship >= 500) await award("The Investor");

    // The ROI King (Verified by Admin - assume projectROI field reflects this)
    if (user.projectROI && user.projectROI >= 1.2) await award("The ROI King");

    // Specialist / Peer related (Diplomat, Zen Master, etc.) 
    // These usually depend on votes/peer ratings which are calculated elsewhere or at month-end.
    // However, if we have the data, we can check.

    return newlyAwarded;
}
