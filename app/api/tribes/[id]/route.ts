import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateGlobalScore } from "@/lib/gamification";

export const runtime = "nodejs";

// GET /api/tribes/[id] - Get tribe details with members
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;
        const session = await getSession(); // Optional: to return currentUserId

        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                                level: true,
                                grit: true,

                                experience: true,      // Keep for legacy
                                currentXP: true,       // Added for accurate scoring
                                reputationScore: true, // Added
                                goals: {
                                    where: { visibility: 'TRIBE' },
                                    include: {
                                        okrs: {
                                            include: {
                                                actions: true
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

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        // Transform members to flatten user details for frontend convenience
        // Frontend expects member.name, member.grit, etc.
        const transformedMembers = tribe.members.map(member => {
            // Calculate Global Score (Standardized)
            const rankingScore = calculateGlobalScore({
                level: member.user.level,
                grit: member.user.grit,
                currentXP: member.user.currentXP,
                reputationScore: member.user.reputationScore
            });

            return {
                ...member.user, // Spread user details (name, avatar, grit, etc.)
                ...member,      // Spread member details (role, joinedAt, signedSOPAt). This overwrites user.id with member.id
                userId: member.userId, // Ensure userId is explicit
                rankingScore // Added
            };
        });

        // Check for pending application if user is logged in
        let isPending = false;
        if (session) {
            const pendingApp = await prisma.tribeApplication.findFirst({
                where: {
                    userId: session.id,
                    tribeId: tribeId,
                    status: 'PENDING'
                }
            });
            isPending = !!pendingApp;
        }

        return NextResponse.json({
            tribe: {
                ...tribe,
                members: transformedMembers
            },
            currentUserId: session?.id || '',
            isPending
        });
    } catch (error) {
        console.error("GET Tribe Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribe" }, { status: 500 });
    }
}

// PUT /api/tribes/[id] - Update tribe details (Admin only)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tribeId = (await params).id;
        const body = await req.json();
        console.log("PUT Tribe Body:", body); // DEBUG
        const {
            name, description, topic, standardProcedures,
            // Meeting Config
            meetingTime, meetingFrequency, meetingTimeHour, meetingTimeMinute, meetingLink,
            // Stats
            minLevel, minGrit, minExperience, minReputation,
            // Pricing
            isPaid, subscriptionPrice, subscriptionFrequency, affiliateCommission, maxMembers,
            // Complex Matchmaking Object (from Form)
            matchmaking,
            // Legacy/Simple Matchmaking (keep for backward compat if needed, or overwrite)
            matchmakingCriteria, matchmakingSkills, matchmakingValues, matchmakingSocial, matchmakingIntent
        } = body;

        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: { members: true }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        const isCreator = tribe.creatorId === session.id;
        const isAdmin = tribe.members.some(m => m.userId === session.id && m.role === 'ADMIN');

        if (!isCreator && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Construct meetingTime string if not provided but Hour/Minute are
        let finalMeetingTime = meetingTime;
        if (!finalMeetingTime && (meetingTimeHour !== undefined || meetingTimeHour !== null) && (meetingTimeMinute !== undefined || meetingTimeMinute !== null)) {
            // Pad with leading zeros
            const h = meetingTimeHour?.toString().padStart(2, '0') || '00';
            const m = meetingTimeMinute?.toString().padStart(2, '0') || '00';
            finalMeetingTime = `${h}:${m}`;
        }

        const updatedTribe = await prisma.tribe.update({
            where: { id: tribeId },
            data: {
                name,
                description,
                topic,
                standardProcedures,

                // Meeting Config
                meetingTime: finalMeetingTime, // Use constructed or provided time
                meetingLink, // New field
                meetingFrequency,
                meetingTimeHour: meetingTimeHour ?? null,
                meetingTimeMinute: meetingTimeMinute ?? null,

                // Stats
                minLevel: minLevel ? parseInt(minLevel) : undefined,
                minGrit: minGrit ? parseInt(minGrit) : undefined,
                minExperience: minExperience ? parseInt(minExperience) : undefined,
                minReputation: minReputation ? parseFloat(minReputation) : undefined,
                maxMembers: maxMembers ? parseInt(maxMembers) : undefined,

                // Pricing
                isPaid,
                subscriptionPrice: isPaid ? parseFloat(subscriptionPrice) : undefined,
                subscriptionFrequency: isPaid ? subscriptionFrequency : undefined,
                affiliateCommission: affiliateCommission ? parseInt(affiliateCommission) : undefined,

                // Matchmaking - Simple
                matchmakingCriteria,

                // Matchmaking - Detailed (Spread 11 categories)
                // Note: The form sends 'matchmaking' object with enabled/description
                // We need to map it if it exists
                ...(matchmaking ? {
                    matchmakingAgeRange: matchmaking.ageRange?.enabled,
                    matchmakingAgeRangeDesc: matchmaking.ageRange?.description,
                    matchmakingLifeFocus: matchmaking.lifeFocus?.enabled,
                    matchmakingLifeFocusDesc: matchmaking.lifeFocus?.description,
                    matchmakingProfessional: matchmaking.professional?.enabled,
                    matchmakingProfessionalDesc: matchmaking.professional?.description,
                    matchmakingWealth: matchmaking.wealth?.enabled,
                    matchmakingWealthDesc: matchmaking.wealth?.description,
                    matchmakingExecution: matchmaking.execution?.enabled,
                    matchmakingExecutionDesc: matchmaking.execution?.description,
                    matchmakingPersonality: matchmaking.personality?.enabled,
                    matchmakingPersonalityDesc: matchmaking.personality?.description,
                    matchmakingHealth: matchmaking.health?.enabled,
                    matchmakingHealthDesc: matchmaking.health?.description,
                    matchmakingSkills: matchmaking.skills?.enabled,
                    matchmakingSkillsDesc: matchmaking.skills?.description,
                    matchmakingValues: matchmaking.values?.enabled,
                    matchmakingValuesDesc: matchmaking.values?.description,
                    matchmakingSocial: matchmaking.social?.enabled,
                    matchmakingSocialDesc: matchmaking.social?.description,
                    matchmakingIntent: matchmaking.intent?.enabled,
                    matchmakingIntentDesc: matchmaking.intent?.description,
                } : {
                    // fallbacks if simple fields passed (e.g. from previous inline edit)
                    matchmakingSkills,
                    matchmakingValues,
                    matchmakingSocial,
                    matchmakingIntent
                })
            }
        });

        return NextResponse.json(updatedTribe);
    } catch (error) {
        console.error("PUT Tribe Error:", error);
        return NextResponse.json({ error: "Failed to update tribe" }, { status: 500 });
    }
}
