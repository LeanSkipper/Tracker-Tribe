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
                // 11 Core Matchmaking Criteria
                ageRange: true,
                ageRangeCustom: true,
                ageRangeVisibility: true,
                lifeFocus: true,
                lifeFocusCustom: true,
                lifeFocusVisibility: true,
                professional: true,
                professionalCustom: true,
                professionalVisibility: true,
                wealth: true,
                wealthCustom: true,
                wealthVisibility: true,
                execution: true,
                executionCustom: true,
                executionVisibility: true,
                personality: true,
                personalityCustom: true,
                personalityVisibility: true,
                health: true,
                healthCustom: true,
                healthVisibility: true,
                skills: true,
                skillsCustom: true,
                skillsVisibility: true,
                values: true,
                valuesCustom: true,
                valuesVisibility: true,
                social: true,
                socialCustom: true,
                socialVisibility: true,
                intent: true,
                intentCustom: true,
                intentVisibility: true,

                // Legacy fields
                country: true,
                timeZone: true,
                languagesSpoken: true,
                city: true,
                maritalStatus: true,
                hasChildren: true,
                professionalRole: true,
                industry: true,
                seniorityLevel: true,
                companySize: true,
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

        // Calculate completion percentage based on 11 criteria
        const criteriaFields = [
            body.ageRange,
            body.lifeFocus?.length,
            body.professional,
            body.wealth,
            body.execution?.length,
            body.personality?.length,
            body.health,
            body.skills?.length,
            body.values,
            body.social,
            body.intent,
        ];

        const completedFields = criteriaFields.filter(Boolean).length;
        const totalCompleteness = Math.round((completedFields / 11) * 100);

        // Calculate XP rewards - 2 XP per field completed
        const previousCompletedFields = Math.round((currentUser.matchmakingCompleteness || 0) / 100 * 11);
        const newFieldsCompleted = completedFields - previousCompletedFields;
        const xpToAward = Math.max(0, newFieldsCompleted * 2);

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                // 11 Core Matchmaking Criteria
                ageRange: body.ageRange || null,
                ageRangeCustom: body.ageRangeCustom || null,
                ageRangeVisibility: body.ageRangeVisibility || 'private',
                lifeFocus: body.lifeFocus || [],
                lifeFocusCustom: body.lifeFocusCustom || null,
                lifeFocusVisibility: body.lifeFocusVisibility || 'private',
                professional: body.professional || null,
                professionalCustom: body.professionalCustom || null,
                professionalVisibility: body.professionalVisibility || 'private',
                wealth: body.wealth || null,
                wealthCustom: body.wealthCustom || null,
                wealthVisibility: body.wealthVisibility || 'private',
                execution: body.execution || [],
                executionCustom: body.executionCustom || null,
                executionVisibility: body.executionVisibility || 'private',
                personality: body.personality || [],
                personalityCustom: body.personalityCustom || null,
                personalityVisibility: body.personalityVisibility || 'private',
                health: body.health || null,
                healthCustom: body.healthCustom || null,
                healthVisibility: body.healthVisibility || 'private',
                skills: body.skills || [],
                skillsCustom: body.skillsCustom || null,
                skillsVisibility: body.skillsVisibility || 'private',
                values: body.values || null,
                valuesCustom: body.valuesCustom || null,
                valuesVisibility: body.valuesVisibility || 'private',
                social: body.social || null,
                socialCustom: body.socialCustom || null,
                socialVisibility: body.socialVisibility || 'private',
                intent: body.intent || null,
                intentCustom: body.intentCustom || null,
                intentVisibility: body.intentVisibility || 'private',

                // Legacy fields (keeping for backward compatibility)
                country: body.country || null,
                timeZone: body.timeZone || null,
                languagesSpoken: body.languagesSpoken || [],
                city: body.city || null,
                maritalStatus: body.maritalStatus || null,
                hasChildren: body.hasChildren,
                professionalRole: body.professionalRole || null,
                industry: body.industry || null,
                seniorityLevel: body.seniorityLevel || null,
                companySize: body.companySize || null,
                actionSpeed: body.actionSpeed || null,
                planningStyle: body.planningStyle || null,
                followThroughLevel: body.followThroughLevel || null,
                needForAccountability: body.needForAccountability || null,

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
