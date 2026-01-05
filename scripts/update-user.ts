import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUser() {
    try {
        // Find the first user
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('No user found in database');
            return;
        }

        console.log('Found user:', user.email);
        console.log('Current userProfile:', user.userProfile);
        console.log('Current subscriptionStatus:', user.subscriptionStatus);

        // Update the user with required fields if they're missing
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                userProfile: user.userProfile || 'SOFT',
                subscriptionStatus: user.subscriptionStatus || 'TRIAL',
                trialStartDate: user.trialStartDate || new Date(),
                trialEndDate: user.trialEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                reputationScore: user.reputationScore ?? 0,
                profileCompleteness: user.profileCompleteness ?? 0,
            }
        });

        console.log('✅ User updated successfully!');
        console.log('Updated user:', {
            email: updated.email,
            userProfile: updated.userProfile,
            subscriptionStatus: updated.subscriptionStatus,
            trialEndDate: updated.trialEndDate,
        });
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUser();
