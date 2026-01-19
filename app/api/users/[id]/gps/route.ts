import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const getCurrentUserId = async (req: Request) => {
    return req.headers.get('x-user-id');
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const currentUserId = await getCurrentUserId(req);
        const { id } = await params;
        const targetUserId = id;

        if (!currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch target user and current user details needed for checks
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: {
                memberships: true, // To check tribes
                goals: {
                    where: {
                        status: 'ACTIVE'
                    },
                    include: {
                        okrs: {
                            include: {
                                actions: true
                            }
                        }
                    }
                }
            }
        });

        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            include: {
                memberships: true,
            }
        });

        if (!targetUser || !currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let accessLevel = 'NONE'; // NONE, BASIC, FULL

        // 1. Self Check
        if (currentUserId === targetUserId) {
            accessLevel = 'FULL';
        } else {
            // 2. Mastermind/Tribe Check
            // Check if they share any tribe
            const targetTribeIds = targetUser.memberships.map(m => m.tribeId);
            const currentTribeIds = currentUser.memberships.map(m => m.tribeId);
            const hasSharedTribe = targetTribeIds.some(id => currentTribeIds.includes(id));

            if (hasSharedTribe) {
                accessLevel = 'FULL';
            } else {
                // 3. Level Check
                if (currentUser.level >= targetUser.level) {
                    accessLevel = 'PARTIAL'; // Can see Public/Tribe visibility, but maybe not Private? 
                    // Requirement: "make only possible read or see others detailed GPS if the person has at least the same level"
                    // "For exemple, level 2 can not see GPS from level 3. But he can see others levels 2."
                    // So if Access OK:
                    // "Unless the member is accepted in the mastermind table. this case, every member can see... no matter level."
                } else {
                    // Lower level -> Cannot see GPS.
                    accessLevel = 'BASIC';
                }
            }
        }

        // Filter Data based on Access Level
        const userProfile = {
            id: targetUser.id,
            name: targetUser.name,
            bio: targetUser.bio,
            avatarUrl: targetUser.avatarUrl,
            level: targetUser.level,
            skills: targetUser.skills,
            grit: targetUser.grit,
            currentXP: targetUser.currentXP,
            reputationScore: targetUser.reputationScore,
            createdAt: targetUser.createdAt,
            // ... other public fields
        };

        if (accessLevel === 'NONE' || accessLevel === 'BASIC') {
            return NextResponse.json({
                user: userProfile,
                message: 'You need a higher level or be in the same Tribe to view detailed GPS.'
            });
        }

        // Filter Goals based on Visibility if PARTIAL
        let visibleGoals = targetUser.goals;

        if (accessLevel === 'PARTIAL') {
            visibleGoals = targetUser.goals.filter(g => g.visibility === 'PUBLIC');
            // If 'TRIBE' visibility, but we are not in tribe (otherwise we'd be FULL), then hide? 
            // Logic: 'TRIBE' means only Tribe members can see.
            // So PARTIAL (Level match but not Tribe) sees ONLY PUBLIC.
        }

        // If FULL (Self or Tribe Member), show everything (maybe excluding PRIVATE unless Self?)
        // Requirement: "every member can see the shared OKR/KPI... no matter level."
        if (accessLevel === 'FULL' && currentUserId !== targetUserId) {
            // Even tribe members shouldn't see PRIVATE goals?
            // Usually PRIVATE is self-only.
            visibleGoals = targetUser.goals.filter(g => g.visibility !== 'PRIVATE');
        }

        return NextResponse.json({
            user: userProfile,
            goals: visibleGoals
        });

    } catch (error) {
        console.error('Error fetching GPS:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
