import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, forbiddenResponse } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, topic, meetingTime, matchmakingCriteria, affiliateCommission, maxMembers, isPaid, monthlyPrice } = await req.json();

        // For prototype, try to get the specific prototype user, fallback to first user
        const targetEmail = 'tiago.mance@gmail.com';
        let user = await prisma.user.findUnique({ where: { email: targetEmail } });

        if (!user) {
            // Fallback to first available user
            user = await prisma.user.findFirst();
            if (!user) {
                return NextResponse.json({ error: "No users found" }, { status: 404 });
            }
        }

        // Check if user can create tribes (HARD subscription required)
        const permission = await checkPermission({
            id: user.id,
            email: user.email,
            name: user.name,
            userProfile: user.userProfile as any,
            subscriptionStatus: user.subscriptionStatus as any,
            subscriptionPlan: user.subscriptionPlan,
            trialStartDate: user.trialStartDate,
            trialEndDate: user.trialEndDate,
            graceStartDate: user.graceStartDate,
            graceEndDate: user.graceEndDate,
            reputationScore: user.reputationScore,
            profileCompleteness: user.profileCompleteness,
        }, 'createTribes');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        // Check if user can monetize (if tribe is paid)
        if (isPaid) {
            const monetizePermission = await checkPermission({
                id: user.id,
                email: user.email,
                name: user.name,
                userProfile: user.userProfile as any,
                subscriptionStatus: user.subscriptionStatus as any,
                subscriptionPlan: user.subscriptionPlan,
                trialStartDate: user.trialStartDate,
                trialEndDate: user.trialEndDate,
                graceStartDate: user.graceStartDate,
                graceEndDate: user.graceEndDate,
                reputationScore: user.reputationScore,
                profileCompleteness: user.profileCompleteness,
            }, 'monetizeTribe');

            if (!monetizePermission.allowed) {
                return forbiddenResponse(monetizePermission.message);
            }
        }

        // Create the Tribe and assign creator as ADMIN
        const tribe = await prisma.tribe.create({
            data: {
                name,
                topic,
                meetingTime,
                matchmakingCriteria,
                affiliateCommission: affiliateCommission || 0,
                maxMembers: maxMembers || 10,
                creatorId: user.id,
                isPaid: isPaid || false,
                monthlyPrice: isPaid ? (monthlyPrice || 0) : 0,
                platformFeePercentage: 30, // 30% platform fee
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
