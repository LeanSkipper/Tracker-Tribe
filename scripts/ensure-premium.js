
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Ensuring specific users have CREATOR_ANNUAL plan...');

    const usersToUpdate = [
        'cmke1fbow000njl04v594xlxc', // tiago.mance@gmail.com
        'cmkjxx9fc0001jm04yqpfk0rg'  // jonathan.pechmajou@gmail.com
    ];

    for (const id of usersToUpdate) {
        try {
            const updated = await prisma.user.update({
                where: { id },
                data: {
                    userProfile: 'CREATOR',
                    subscriptionPlan: 'CREATOR_ANNUAL',
                    subscriptionStatus: 'ACTIVE',
                    maxGoals: -1 // Unlimited goals for creators
                }
            });
            console.log(`✅ Updated user ${updated.email} (${id}) to CREATOR_ANNUAL`);
        } catch (e) {
            console.error(`❌ Failed to update user ${id}:`, e.message);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
