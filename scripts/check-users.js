const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const libsql = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

const prisma = new PrismaClient({
    adapter: new PrismaLibSql(libsql),
});

async function main() {
    console.log('Fetching all users...\n');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            userProfile: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialStartDate: true,
            trialEndDate: true,
            graceStartDate: true,
            graceEndDate: true,
        }
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Name:', user.name);
        console.log('  Profile:', user.userProfile);
        console.log('  Subscription Status:', user.subscriptionStatus);
        console.log('  Subscription Plan:', user.subscriptionPlan);
        console.log('  Trial Start:', user.trialStartDate);
        console.log('  Trial End:', user.trialEndDate);
        console.log('  Grace Start:', user.graceStartDate);
        console.log('  Grace End:', user.graceEndDate);
        console.log('');
    });

    // Check which user findFirst() would return
    const firstUser = await prisma.user.findFirst();
    console.log('prisma.user.findFirst() returns:');
    console.log('  Email:', firstUser?.email);
    console.log('  Subscription Status:', firstUser?.subscriptionStatus);
    console.log('  Trial End Date:', firstUser?.trialEndDate);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
