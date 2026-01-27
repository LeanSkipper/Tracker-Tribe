import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Matchmaking Algorithm
 * Calculates compatibility score between a user and a tribe based on 11 criteria
 * Returns a score from 0-100
 */

interface MatchmakingCriteria {
    ageRange?: string | null;
    lifeFocus?: string[];
    professional?: string | null;
    wealth?: string | null;
    execution?: string[];
    personality?: string[];
    health?: string | null;
    skills?: string[];
    values?: string | null;
    social?: string | null;
    intent?: string | null;
}

function calculateMatchScore(userCriteria: MatchmakingCriteria, tribeCriteria: MatchmakingCriteria): number {
    let totalScore = 0;
    let criteriaCount = 0;

    // Helper function to calculate array overlap (for multi-select fields)
    const calculateArrayOverlap = (arr1: string[] = [], arr2: string[] = []): number => {
        if (arr1.length === 0 || arr2.length === 0) return 0;
        const overlap = arr1.filter(item => arr2.includes(item)).length;
        const maxLength = Math.max(arr1.length, arr2.length);
        return (overlap / maxLength) * 100;
    };

    // Helper function for exact match (single-select fields)
    const calculateExactMatch = (val1?: string | null, val2?: string | null): number => {
        if (!val1 || !val2) return 0;
        return val1 === val2 ? 100 : 0;
    };

    // 1. Age Range (exact match)
    if (userCriteria.ageRange && tribeCriteria.ageRange) {
        totalScore += calculateExactMatch(userCriteria.ageRange, tribeCriteria.ageRange);
        criteriaCount++;
    }

    // 2. Life Focus (array overlap) - weighted higher
    if (userCriteria.lifeFocus?.length && tribeCriteria.lifeFocus?.length) {
        totalScore += calculateArrayOverlap(userCriteria.lifeFocus, tribeCriteria.lifeFocus) * 1.5;
        criteriaCount += 1.5;
    }

    // 3. Professional (exact match)
    if (userCriteria.professional && tribeCriteria.professional) {
        totalScore += calculateExactMatch(userCriteria.professional, tribeCriteria.professional);
        criteriaCount++;
    }

    // 4. Wealth (exact match)
    if (userCriteria.wealth && tribeCriteria.wealth) {
        totalScore += calculateExactMatch(userCriteria.wealth, tribeCriteria.wealth);
        criteriaCount++;
    }

    // 5. Execution Style (array overlap) - weighted higher
    if (userCriteria.execution?.length && tribeCriteria.execution?.length) {
        totalScore += calculateArrayOverlap(userCriteria.execution, tribeCriteria.execution) * 1.5;
        criteriaCount += 1.5;
    }

    // 6. Personality (array overlap) - weighted higher
    if (userCriteria.personality?.length && tribeCriteria.personality?.length) {
        totalScore += calculateArrayOverlap(userCriteria.personality, tribeCriteria.personality) * 1.5;
        criteriaCount += 1.5;
    }

    // 7. Health (exact match)
    if (userCriteria.health && tribeCriteria.health) {
        totalScore += calculateExactMatch(userCriteria.health, tribeCriteria.health);
        criteriaCount++;
    }

    // 8. Skills (array overlap) - weighted higher
    if (userCriteria.skills?.length && tribeCriteria.skills?.length) {
        totalScore += calculateArrayOverlap(userCriteria.skills, tribeCriteria.skills) * 1.5;
        criteriaCount += 1.5;
    }

    // 9. Values (exact match) - weighted highest
    if (userCriteria.values && tribeCriteria.values) {
        totalScore += calculateExactMatch(userCriteria.values, tribeCriteria.values) * 2;
        criteriaCount += 2;
    }

    // 10. Social (exact match)
    if (userCriteria.social && tribeCriteria.social) {
        totalScore += calculateExactMatch(userCriteria.social, tribeCriteria.social);
        criteriaCount++;
    }

    // 11. Intent (exact match) - weighted highest
    if (userCriteria.intent && tribeCriteria.intent) {
        totalScore += calculateExactMatch(userCriteria.intent, tribeCriteria.intent) * 2;
        criteriaCount += 2;
    }

    // Return weighted average
    return criteriaCount > 0 ? Math.round(totalScore / criteriaCount) : 0;
}

// GET - Calculate match scores for user with all tribes
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's matchmaking profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                ageRange: true,
                lifeFocus: true,
                professional: true,
                wealth: true,
                execution: true,
                personality: true,
                health: true,
                skills: true,
                values: true,
                social: true,
                intent: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all tribes with their matchmaking criteria
        const tribes = await prisma.tribe.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                matchmakingCriteria: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });

        // Calculate match scores
        const tribesWithScores = tribes.map(tribe => {
            const tribeCriteria = tribe.matchmakingCriteria as any || {};

            const score = calculateMatchScore(
                {
                    ageRange: user.ageRange,
                    lifeFocus: user.lifeFocus,
                    professional: user.professional,
                    wealth: user.wealth,
                    execution: user.execution,
                    personality: user.personality,
                    health: user.health,
                    skills: user.skills,
                    values: user.values,
                    social: user.social,
                    intent: user.intent,
                },
                {
                    ageRange: tribeCriteria.ageRange?.description,
                    lifeFocus: tribeCriteria.lifeFocus?.description ? [tribeCriteria.lifeFocus.description] : [],
                    professional: tribeCriteria.professional?.description,
                    wealth: tribeCriteria.wealth?.description,
                    execution: tribeCriteria.execution?.description ? [tribeCriteria.execution.description] : [],
                    personality: tribeCriteria.personality?.description ? [tribeCriteria.personality.description] : [],
                    health: tribeCriteria.health?.description,
                    skills: tribeCriteria.skills?.description ? [tribeCriteria.skills.description] : [],
                    values: tribeCriteria.values?.description,
                    social: tribeCriteria.social?.description,
                    intent: tribeCriteria.intent?.description,
                }
            );

            return {
                id: tribe.id,
                name: tribe.name,
                description: tribe.description,
                memberCount: tribe._count.members,
                matchScore: score,
            };
        });

        // Sort by match score (highest first)
        tribesWithScores.sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({
            matches: tribesWithScores,
            userProfileCompleteness: user.ageRange ? 100 : 0, // Simplified check
        });
    } catch (error) {
        console.error('Error calculating matches:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
