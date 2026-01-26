import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, forbiddenResponse, getSession, unauthorizedResponse } from "@/lib/auth";
import { TribeRole } from "@prisma/client";

export const runtime = "nodejs";

// POST /api/tribes/join - Join a tribe
export async function POST(req: Request) {
    try {
        const { tribeId } = await req.json();

        // Get authenticated user from session
        const user = await getSession();

        if (!user) {
            return unauthorizedResponse('Please sign in to join tribes');
        }

        // Check if user can join tribes (ENGAGED or CREATOR subscription required)
        const permission = await checkPermission(user, 'joinTribes');

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
