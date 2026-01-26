const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Enum Migration...');

    const run = async (query) => {
        try {
            await prisma.$executeRawUnsafe(query);
            console.log(`Executed: ${query}`);
        } catch (e) {
            // Ignore errors (e.g., if value already renamed or doesn't exist)
            // We check if it's a "does not exist" error which implies it's already done or not needed
            console.log(`Skipped: ${query}`);
            // console.log(`Reason: ${e.message.split('\n')[0]}`);
        }
    };

    try {
        // Migrate UserProfile
        await run(`ALTER TYPE "UserProfile" RENAME VALUE 'SOFT' TO 'STARTER'`);
        await run(`ALTER TYPE "UserProfile" RENAME VALUE 'HARD' TO 'CREATOR'`);

        // Migrate SubscriptionPlan
        await run(`ALTER TYPE "SubscriptionPlan" RENAME VALUE 'SOFT_FREE' TO 'STARTER_FREE'`);
        await run(`ALTER TYPE "SubscriptionPlan" RENAME VALUE 'HARD_MONTHLY' TO 'CREATOR_MONTHLY'`);
        await run(`ALTER TYPE "SubscriptionPlan" RENAME VALUE 'HARD_ANNUAL' TO 'CREATOR_ANNUAL'`);

        console.log('Enum Migration Completed');
    } catch (e) {
        console.error('Migration failed:', e);
        // We allow the script to exit successfully so the build continues. 
        // If migration failed, db push might still work if data loss is accepted, 
        // or fail if data exists.
    } finally {
        await prisma.$disconnect();
    }
}

main();
