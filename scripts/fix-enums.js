const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Safe Enum Migration (Preserves Existing Data)...');

    const run = async (query) => {
        try {
            await prisma.$executeRawUnsafe(query);
            console.log(`Executed: ${query}`);
        } catch (e) {
            console.log(`Failed/Skipped: ${query}`);
            console.log(`Reason: ${e.message.split('\n')[0]}`);
        }
    };

    try {
        // 0. Check if columns are already TEXT type
        const checkType = async (table, column) => {
            try {
                const result = await prisma.$queryRawUnsafe(`
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '${table}' AND column_name = '${column}'
                `);
                return result[0]?.data_type === 'text';
            } catch (e) {
                return false;
            }
        };

        const userProfileIsText = await checkType('User', 'userProfile');
        const subscriptionPlanIsText = await checkType('User', 'subscriptionPlan');

        // Only convert to TEXT if not already TEXT
        if (!userProfileIsText) {
            console.log('Converting userProfile to TEXT...');
            await run(`ALTER TABLE "User" ALTER COLUMN "userProfile" DROP DEFAULT`);
            await run(`ALTER TABLE "User" ALTER COLUMN "userProfile" TYPE text`);
            await run(`ALTER TABLE "Badges_Catalog" ALTER COLUMN "requiredForProfile" TYPE text`);

            // Update old enum values to new ones
            await run(`UPDATE "User" SET "userProfile" = 'STARTER' WHERE "userProfile" = 'SOFT'`);
            await run(`UPDATE "User" SET "userProfile" = 'CREATOR' WHERE "userProfile" = 'HARD'`);
            await run(`UPDATE "Badges_Catalog" SET "requiredForProfile" = 'STARTER' WHERE "requiredForProfile" = 'SOFT'`);
            await run(`UPDATE "Badges_Catalog" SET "requiredForProfile" = 'CREATOR' WHERE "requiredForProfile" = 'HARD'`);
        } else {
            console.log('userProfile already TEXT, skipping conversion');
        }

        if (!subscriptionPlanIsText) {
            console.log('Converting subscriptionPlan to TEXT...');
            await run(`ALTER TABLE "User" ALTER COLUMN "subscriptionPlan" DROP DEFAULT`);
            await run(`ALTER TABLE "Subscription" ALTER COLUMN "plan" DROP DEFAULT`);
            await run(`ALTER TABLE "User" ALTER COLUMN "subscriptionPlan" TYPE text`);
            await run(`ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE text`);

            // Update old enum values to new ones
            await run(`UPDATE "User" SET "subscriptionPlan" = 'STARTER_FREE' WHERE "subscriptionPlan" = 'SOFT_FREE'`);
            await run(`UPDATE "User" SET "subscriptionPlan" = 'CREATOR_MONTHLY' WHERE "subscriptionPlan" = 'HARD_MONTHLY'`);
            await run(`UPDATE "User" SET "subscriptionPlan" = 'CREATOR_ANNUAL' WHERE "subscriptionPlan" = 'HARD_ANNUAL'`);
            await run(`UPDATE "Subscription" SET "plan" = 'STARTER_FREE' WHERE "plan" = 'SOFT_FREE'`);
            await run(`UPDATE "Subscription" SET "plan" = 'CREATOR_MONTHLY' WHERE "plan" = 'HARD_MONTHLY'`);
            await run(`UPDATE "Subscription" SET "plan" = 'CREATOR_ANNUAL' WHERE "plan" = 'HARD_ANNUAL'`);
        } else {
            console.log('subscriptionPlan already TEXT, skipping conversion');
        }

        // Update specific users to CREATOR_ANNUAL
        console.log('Setting specific users to CREATOR_ANNUAL...');
        await run(`UPDATE "User" SET "userProfile" = 'CREATOR', "subscriptionPlan" = 'CREATOR_ANNUAL', "subscriptionStatus" = 'ACTIVE', "maxGoals" = -1 WHERE "id" = 'cmke1fbow000njl04v594xlxc'`);
        await run(`UPDATE "User" SET "userProfile" = 'CREATOR', "subscriptionPlan" = 'CREATOR_ANNUAL', "subscriptionStatus" = 'ACTIVE', "maxGoals" = -1 WHERE "id" = 'cmkjxx9fc0001jm04yqpfk0rg'`);

        console.log('Safe Migration Completed. Prisma db push will handle the rest.');
    } catch (e) {
        console.error('Migration Fatal Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
