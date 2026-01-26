import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, forbiddenResponse, getSession, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const {
            name, description, topic, meetingTime, meetingDay, matchmakingCriteria, affiliateCommission, maxMembers, isPaid, monthlyPrice,
            // New fields
            meetingFrequency, meetingTimeHour, meetingTimeMinute, matchmaking,
            minLevel, minGrit, minExperience, minCompletionRate, minReputation,
            subscriptionPrice, subscriptionFrequency // New pricing fields
        } = await req.json();

        // Get authenticated user from session
        const user = await getSession();

        if (!user) {
            return unauthorizedResponse('Please sign in to create tribes');
        }

        // Check if user can create tribes (CREATOR subscription required)
        const permission = await checkPermission(user, 'createTribes');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        // Check if user can monetize (if tribe is paid)
        if (isPaid) {
            const monetizePermission = await checkPermission(user, 'monetizeTribe');

            if (!monetizePermission.allowed) {
                return forbiddenResponse(monetizePermission.message);
            }

            // Validate Pricing
            if (!subscriptionPrice || subscriptionPrice <= 0) {
                return NextResponse.json({ error: "Price must be greater than 0 for paid tribes" }, { status: 400 });
            }
            if (!subscriptionFrequency) {
                return NextResponse.json({ error: "Billing frequency is required for paid tribes" }, { status: 400 });
            }
        }

        // Validate at least one matchmaking criterion if provided
        if (matchmaking) {
            const hasMatchmaking = Object.values(matchmaking).some((c: any) => c?.enabled);
            if (!hasMatchmaking) {
                return NextResponse.json({ error: 'At least one matchmaking criterion is required' }, { status: 400 });
            }
        }

        // Create the Tribe and assign creator as ADMIN
        const tribe = await prisma.tribe.create({
            data: {
                name,
                description,
                topic,
                meetingTime,
                meetingDay,
                matchmakingCriteria,
                affiliateCommission: affiliateCommission || 0,
                maxMembers: maxMembers || 10,
                creatorId: user.id,
                isPaid: isPaid || false,
                subscriptionPrice: isPaid ? (monthlyPrice || subscriptionPrice || 0) : 0,
                subscriptionFrequency: isPaid ? subscriptionFrequency : null,

                // Meeting configuration
                meetingFrequency: meetingFrequency || null,
                meetingTimeHour: meetingTimeHour ?? null,
                meetingTimeMinute: meetingTimeMinute ?? null,

                // Matchmaking criteria (11 categories)
                matchmakingAgeRange: matchmaking?.ageRange?.enabled || false,
                matchmakingAgeRangeDesc: matchmaking?.ageRange?.description || null,
                matchmakingLifeFocus: matchmaking?.lifeFocus?.enabled || false,
                matchmakingLifeFocusDesc: matchmaking?.lifeFocus?.description || null,
                matchmakingProfessional: matchmaking?.professional?.enabled || false,
                matchmakingProfessionalDesc: matchmaking?.professional?.description || null,
                matchmakingWealth: matchmaking?.wealth?.enabled || false,
                matchmakingWealthDesc: matchmaking?.wealth?.description || null,
                matchmakingExecution: matchmaking?.execution?.enabled || false,
                matchmakingExecutionDesc: matchmaking?.execution?.description || null,
                matchmakingPersonality: matchmaking?.personality?.enabled || false,
                matchmakingPersonalityDesc: matchmaking?.personality?.description || null,
                matchmakingHealth: matchmaking?.health?.enabled || false,
                matchmakingHealthDesc: matchmaking?.health?.description || null,
                matchmakingSkills: matchmaking?.skills?.enabled || false,
                matchmakingSkillsDesc: matchmaking?.skills?.description || null,
                matchmakingValues: matchmaking?.values?.enabled || false,
                matchmakingValuesDesc: matchmaking?.values?.description || null,
                matchmakingSocial: matchmaking?.social?.enabled || false,
                matchmakingSocialDesc: matchmaking?.social?.description || null,
                matchmakingIntent: matchmaking?.intent?.enabled || false,
                matchmakingIntentDesc: matchmaking?.intent?.description || null,

                // Required stats
                minLevel: minLevel ?? 1,
                minGrit: minGrit ?? 0,
                minExperience: minExperience ?? 0,
                minCompletionRate: minCompletionRate ?? 0,
                minReputation: minReputation ?? 0,

                members: {
                    create: {
                        userId: user.id,
                        role: "ADMIN"
                    }
                }
            },
            include: {
                members: true
            }
        });

        return NextResponse.json(tribe);
    } catch (error) {
        console.error("Create Tribe Error:", error);
        return NextResponse.json({ error: "Failed to create tribe" }, { status: 500 });
    }
}
