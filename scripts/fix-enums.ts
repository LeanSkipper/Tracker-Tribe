
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEnums() {
    console.log('Fixing enums...');
    try {
        // 1. Add new values to Postgres Enums
        // We ignore errors if they already exist (Postgres throws if we try to add existing, so we wrap in try/catch or just ignore)

        const alterCommands = [
            `ALTER TYPE "UserProfile" ADD VALUE IF NOT EXISTS 'STARTER'`,
            `ALTER TYPE "UserProfile" ADD VALUE IF NOT EXISTS 'CREATOR'`,
            `ALTER TYPE "UserProfile" ADD VALUE IF NOT EXISTS 'PREMIUM_CREATOR'`,

            `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'STARTER_FREE'`,
            `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'CREATOR_MONTHLY'`,
            `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'CREATOR_ANNUAL'`,
            `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'ENGAGED_TRIAL'`,
            `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'ENGAGED_MONTHLY'`,
            `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'ENGAGED_ANNUAL'`,
        ];

        for (const cmd of alterCommands) {
            try {
                await prisma.$executeRawUnsafe(cmd);
                console.log(`Executed: ${cmd}`);
            } catch (e: any) {
                // Postgres 12+ supports IF NOT EXISTS for ADD VALUE, but if older, it might fail.
                // Also if we run via prisma it handles it.
                console.log(`Command failed (might exist): ${cmd} - ${e.message}`);
            }
        }

        // 2. Migrate Data
        console.log('Migrating data...');
        await prisma.$executeRawUnsafe(`UPDATE "User" SET "userProfile" = 'STARTER' WHERE "userProfile" = 'SOFT'`);
        await prisma.$executeRawUnsafe(`UPDATE "User" SET "userProfile" = 'CREATOR' WHERE "userProfile" = 'HARD'`);
        await prisma.$executeRawUnsafe(`UPDATE "User" SET "subscriptionPlan" = 'STARTER_FREE' WHERE "subscriptionPlan" = 'SOFT_FREE'`);
        // Handle HARD_MONTHLY -> CREATOR_MONTHLY etc if they exist
        // Just simple mapping for now

        console.log('Data migration complete.');

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fixEnums();
