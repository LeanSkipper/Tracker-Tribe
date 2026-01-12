import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, forbiddenResponse, getSession, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, topic, meetingTime, matchmakingCriteria, affiliateCommission, maxMembers, isPaid, monthlyPrice } = await req.json();

        // Get authenticated user from session
        const user = await getSession();

        if (!user) {
            return unauthorizedResponse('Please sign in to create tribes');
        }

        // Check if user can create tribes (HARD subscription required)
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
                subscriptionPrice: isPaid ? (monthlyPrice || 0) : 0,
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
