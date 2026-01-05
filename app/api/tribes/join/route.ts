import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, forbiddenResponse } from "@/lib/auth";
import { TribeRole } from "@prisma/client";

export const runtime = "nodejs";

// POST /api/tribes/join - Join a tribe
export async function POST(req: Request) {
    try {
        const { tribeId } = await req.json();

        // Get current user (in production, this would come from session)
        const targetEmail = 'tiago.mance@gmail.com';
        let user = await prisma.user.findUnique({ where: { email: targetEmail } });

        if (!user) {
            // Fallback to first available user
            user = await prisma.user.findFirst();
            if (!user) {
                return NextResponse.json({ error: "No users found" }, { status: 404 });
            }
        }

        // Check if user can join tribes (ENGAGED or HARD subscription required)
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
        }, 'joinTribes');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        // Get the tribe to check if it exists and has space
        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        // Check if tribe is full
        if (tribe._count.members >= tribe.maxMembers) {
            return NextResponse.json({ error: "Tribe is full" }, { status: 400 });
        }

        // Check if user is already a member
        const existingMember = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: user.id,
                    tribeId: tribeId
                }
            }
        });

        if (existingMember) {
            return NextResponse.json({ error: "Already a member of this tribe" }, { status: 400 });
        }

        // If tribe is paid, check if user has active subscription
        if (tribe.isPaid) {
            if (user.subscriptionStatus !== 'ACTIVE') {
                return forbiddenResponse('Paid tribes require an active subscription');
            }
            // TODO: In Phase 4, create Stripe subscription for the tribe
        }

        // Add user as a member
        const membership = await prisma.tribeMember.create({
            data: {
                userId: user.id,
                tribeId: tribeId,
                role: TribeRole.PLAYER
            }
        });

        return NextResponse.json(membership);
    } catch (error) {
        console.error("Join Tribe Error:", error);
        return NextResponse.json({ error: "Failed to join tribe" }, { status: 500 });
    }
}
