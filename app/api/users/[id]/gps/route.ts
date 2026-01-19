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
                                actions: true,
                                sharedTribes: true,
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

        // 4. Granular Goal/OKR Filtering
        let visibleGoals = targetUser.goals;

        if (currentUserId !== targetUserId) {
            const viewerTribeIds = currentUser.memberships.map(m => m.tribeId);
            const targetTribeIds = targetUser.memberships.map(m => m.tribeId);
            const commonTribes = targetTribeIds.filter(id => viewerTribeIds.includes(id));
            const hasCommonTribe = commonTribes.length > 0;

            visibleGoals = targetUser.goals.map(goal => {
                // 1. Check Goal Visibility
                if (goal.visibility === 'PRIVATE') return null;
                if (goal.visibility === 'PUBLIC') return goal; // Public goals show all OKRs

                // 2. Handle TRIBE Visibility (Granular Check)
                if (goal.visibility === 'TRIBE') {
                    // Pre-check: Must share at least one tribe generally, OR be exempt?
                    // "Partial" access (Level check) sees only Public. 
                    // "Full" access (Tribe or Self) gets here.
                    // If we are here, we likely have accessLevel='FULL' OR 'PARTIAL'.

                    if (accessLevel === 'PARTIAL' && !hasCommonTribe) return null; // Partial/Level only -> See Public ONLY.

                    // Filter OKRs
                    const visibleOKRs = goal.okrs.filter(okr => {
                        // Cast to any because sharedTribes might not be in the default type unless included
                        // We must ensure 'sharedTribes' was included in the query.
                        // sharedTribes is included in the query
                        const sharedTribes = okr.sharedTribes as { id: string }[] | undefined;

                        // Case A: Granular sharing is defined
                        if (sharedTribes && sharedTribes.length > 0) {
                            // Visible if Viewer is in one of the shared tribes
                            return sharedTribes.some(t => viewerTribeIds.includes(t.id));
                        }

                        // Case B: No granular sharing defined (Legacy/Default)
                        // Visible if Viewer shares ANY tribe with Target (which we already checked with hasCommonTribe)
                        return true;
                    });

                    if (visibleOKRs.length === 0) return null;

                    return { ...goal, okrs: visibleOKRs };
                }

                return null;
            }).filter(g => g !== null) as any;
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
