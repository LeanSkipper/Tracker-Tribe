import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateGlobalScore } from "@/lib/gamification";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                bio: true,
                avatarUrl: true,
                createdAt: true,

                // Stats
                level: true,
                grit: true,
                experience: true,
                currentXP: true, // Use currentXP for display consistency if needed, schema says 'experience' and 'currentXP'. 
                // In User model: experience Int @default(0), currentXP Int @default(0). 
                // Let's return both or check usage. Profile page uses 'currentXP' as 'xp'.
                reputationScore: true,

                // Identity / Matchmaking
                ageRange: true,
                country: true,
                city: true,
                languagesSpoken: true,
                professionalRole: true,
                industry: true,
                seniorityLevel: true,
                companySize: true,
                actionSpeed: true,
                planningStyle: true,
                followThroughLevel: true,
                needForAccountability: true,
                skills: true, // JSON string

                // Tribes
                memberships: {
                    include: {
                        tribe: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                reliabilityRate: true,
                                members: {
                                    take: 5,
                                    select: {
                                        user: {
                                            select: {
                                                avatarUrl: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate Global Score (consistent with other views)
        // Calculate Global Score (consistent with other views)
        const rankingScore = calculateGlobalScore({
            level: user.level,
            grit: user.grit,
            currentXP: user.currentXP,
            reputationScore: user.reputationScore
        });

        // Calculate Reputation Breakdown
        const reviews = await prisma.reputationReview.findMany({
            where: { targetUserId: user.id },
            select: {
                reliability: true,
                activePresence: true,
                constructiveCandor: true,
                generosity: true,
                energyCatalyst: true,
                responsiveness: true,
                coachability: true,
                knowledgeTransparency: true,
                emotionalRegulation: true,
                preparation: true
            }
        });

        const reputationBreakdown: Record<string, number> = {};
        const criteriaList = [
            'reliability', 'activePresence', 'constructiveCandor', 'generosity',
            'energyCatalyst', 'responsiveness', 'coachability', 'knowledgeTransparency',
            'emotionalRegulation', 'preparation'
        ];

        if (reviews.length > 0) {
            criteriaList.forEach(key => {
                const total = reviews.reduce((sum, r) => sum + (r[key as keyof typeof r] as number || 0), 0);
                reputationBreakdown[key] = parseFloat((total / reviews.length).toFixed(1));
            });
        }

        return NextResponse.json({
            ...user,
            rankingScore,
            reputationBreakdown
        });

    } catch (error) {
        console.error('Error fetching public profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
