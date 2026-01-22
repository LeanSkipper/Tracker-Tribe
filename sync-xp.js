const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking user stats...");
    const users = await prisma.user.findMany();

    for (const user of users) {
        let needsUpdate = false;
        let { currentXP, experience } = user;

        // Arbitrage: User said "consider the biggest number".
        // But currentXP is the "live" one.
        // If experience > currentXP, we should probably bump currentXP?
        // Or if currentXP > experience, bump experience?
        // Let's assume currentXP is the source of truth for "Live" status.
        // But for "Total Lifetime", maybe experience was intended?
        // Wait, calculateGlobalScore uses currentXP now.
        // So currentXP is the only one that matters for Score.

        // If currentXP is low (e.g. 20) but experience is high (e.g. 74?), 
        // it might mean they have "banked" XP? No, typically XP is XP.
        // User saw "148 stars, 20 xp" (Self) vs "74 stars, 10 xp" (Public).
        // 148 score -> 20 xp.
        // 74 score -> 10 xp.
        // It seems the "Self" view has higher XP (20).
        // The "Public" view had lower XP (10).

        // So we just need to make sure Public uses the same field as Self.
        // Done by code changes.

        // However, if the DB actually has differing values in different fields, I should sync them.
        // Let's set experience = currentXP (since currentXP is now the standard).
        // OR better: set both to the MAX of both.

        const maxXP = Math.max(currentXP || 0, experience || 0);

        if (currentXP !== maxXP || experience !== maxXP) {
            console.log(`Updating user ${user.username || user.id}: Setting XP to ${maxXP}`);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    currentXP: maxXP,
                    experience: maxXP // Sync legacy field too just in case
                }
            });
        }
    }
    console.log("Done.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
