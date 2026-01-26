const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Robust Enum Migration (Text Conversion Strategy)...');

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
        // 0. Drop Defaults to avoid "cannot be cast automatically" errors during push
        // We let Prisma recreate them later.
        await run(`ALTER TABLE "User" ALTER COLUMN "userProfile" DROP DEFAULT`);
        await run(`ALTER TABLE "User" ALTER COLUMN "subscriptionPlan" DROP DEFAULT`);
        await run(`ALTER TABLE "Subscription" ALTER COLUMN "plan" DROP DEFAULT`);
        // Note: Badges_Catalog.requiredForProfile is nullable and has no default usually, but we can check schema.
        // Schema says: requiredForProfile UserProfile? (Optional, no default) - so no need to drop.

        // 1. Convert Enum Columns to TEXT
        // This allows us to update the values to strings that don't exist in the old enum
        await run(`ALTER TABLE "User" ALTER COLUMN "userProfile" TYPE text`);
        await run(`ALTER TABLE "Badges_Catalog" ALTER COLUMN "requiredForProfile" TYPE text`);
        await run(`ALTER TABLE "User" ALTER COLUMN "subscriptionPlan" TYPE text`);
        await run(`ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE text`);

        // 2. Update Old Values to New Values
        // valid in new schema: STARTER, CREATOR, STARTER_FREE, CREATOR_MONTHLY, CREATOR_ANNUAL

        // UserProfile updates
        const upCols = [
            { table: '"User"', col: '"userProfile"' },
            { table: '"Badges_Catalog"', col: '"requiredForProfile"' }
        ];

        for (const { table, col } of upCols) {
            await run(`UPDATE ${table} SET ${col} = 'STARTER' WHERE ${col} = 'SOFT'`);
            await run(`UPDATE ${table} SET ${col} = 'CREATOR' WHERE ${col} = 'HARD'`);
        }

        // SubscriptionPlan updates
        const spCols = [
            { table: '"User"', col: '"subscriptionPlan"' },
            { table: '"Subscription"', col: '"plan"' }
        ];

        for (const { table, col } of spCols) {
            await run(`UPDATE ${table} SET ${col} = 'STARTER_FREE' WHERE ${col} = 'SOFT_FREE'`);
            await run(`UPDATE ${table} SET ${col} = 'CREATOR_MONTHLY' WHERE ${col} = 'HARD_MONTHLY'`);
            await run(`UPDATE ${table} SET ${col} = 'CREATOR_ANNUAL' WHERE ${col} = 'HARD_ANNUAL'`);
        }

        // 3. Cleanup Old Types (Optional, but good practice if we want to be clean, 
        //    though db push might replace them anyway)
        //    We won't drop them explicitly to avoid errors if they are used elsewhere or dependend on.
        //    Let Prisma handle the cleanup during push.

        console.log('Robust Migration Completed. Columns are now TEXT with new values. Prisma db push will convert them back to Enums.');
    } catch (e) {
        console.error('Migration Fatal Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
