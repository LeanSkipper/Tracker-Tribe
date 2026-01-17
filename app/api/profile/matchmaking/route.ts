import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's matchmaking profile
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                // Identity & Context
                ageRange: true,
                country: true,
                timeZone: true,
                languagesSpoken: true,
                city: true,
                maritalStatus: true,
                hasChildren: true,

                // Professional
                professionalRole: true,
                industry: true,
                seniorityLevel: true,
                companySize: true,

                // Execution Style
                actionSpeed: true,
                planningStyle: true,
                followThroughLevel: true,
                needForAccountability: true,

                // Privacy Controls
                identityPrivacy: true,
                professionalPrivacy: true,
                executionPrivacy: true,

                // Metadata
                matchmakingCompleteness: true,
                profileXpEarned: true,
                profileLastUpdated: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching matchmaking profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update matchmaking profile
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Get current user to calculate XP rewards
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                matchmakingCompleteness: true,
                profileXpEarned: true,
                experience: true,
            },
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate completion percentage
        const identityFields = [body.ageRange, body.country, body.timeZone, body.languagesSpoken?.length, body.city, body.maritalStatus, body.hasChildren !== undefined];
        const professionalFields = [body.professionalRole, body.industry, body.seniorityLevel, body.companySize];
        const executionFields = [body.actionSpeed, body.planningStyle, body.followThroughLevel, body.needForAccountability];

        const identityComplete = identityFields.filter(Boolean).length;
        const professionalComplete = professionalFields.filter(Boolean).length;
        const executionComplete = executionFields.filter(Boolean).length;

        const identityPercent = Math.round((identityComplete / 7) * 100);
        const professionalPercent = Math.round((professionalComplete / 4) * 100);
        const executionPercent = Math.round((executionComplete / 4) * 100);

        const totalCompleteness = Math.round((identityPercent + professionalPercent + executionPercent) / 3);

        // Calculate XP rewards
        let xpToAward = 0;
        const previousCompleteness = currentUser.matchmakingCompleteness || 0;

        // Check if any category just reached 100%
        const categoriesComplete = [
            identityPercent === 100,
            professionalPercent === 100,
            executionPercent === 100,
        ].filter(Boolean).length;

        const previousCategoriesComplete = Math.floor(previousCompleteness / 34); // Rough estimate

        if (categoriesComplete > previousCategoriesComplete) {
            // First category: +5 XP, additional categories: +2 XP each
            if (previousCategoriesComplete === 0) {
                xpToAward = 5;
            } else {
                xpToAward = 2;
            }
        }

        // 100% completion bonus
        if (totalCompleteness === 100 && previousCompleteness < 100) {
            xpToAward += 10;
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                // Identity & Context
                ageRange: body.ageRange,
                country: body.country,
                timeZone: body.timeZone,
                languagesSpoken: body.languagesSpoken || [],
                city: body.city,
                maritalStatus: body.maritalStatus,
                hasChildren: body.hasChildren,

                // Professional
                professionalRole: body.professionalRole,
                industry: body.industry,
                seniorityLevel: body.seniorityLevel,
                companySize: body.companySize,

                // Execution Style
                actionSpeed: body.actionSpeed,
                planningStyle: body.planningStyle,
                followThroughLevel: body.followThroughLevel,
                needForAccountability: body.needForAccountability,

                // Privacy Controls
                identityPrivacy: body.identityPrivacy || 'private',
                professionalPrivacy: body.professionalPrivacy || 'members',
                executionPrivacy: body.executionPrivacy || 'members',

                // Metadata
                matchmakingCompleteness: totalCompleteness,
                profileXpEarned: (currentUser.profileXpEarned || 0) + xpToAward,
                experience: (currentUser.experience || 0) + xpToAward,
                profileLastUpdated: new Date(),
            },
            select: {
                matchmakingCompleteness: true,
                profileXpEarned: true,
                experience: true,
            },
        });

        return NextResponse.json({
            ...updatedUser,
            xpAwarded: xpToAward,
            message: xpToAward > 0 ? `Congratulations! You earned +${xpToAward} XP!` : 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Error updating matchmaking profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
