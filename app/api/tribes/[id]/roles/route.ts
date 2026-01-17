import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export const runtime = "nodejs";

// PATCH /api/tribes/[id]/roles - Update a member's role
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: tribeId } = await params;
        const { memberId, role } = await req.json();

        // 1. Authenticate user
        const user = await getSession();
        if (!user) {
            return unauthorizedResponse();
        }

        // 2. Authorization: Check if current user is an ADMIN of the tribe
        const currentMember = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: user.id,
                    tribeId: tribeId
                }
            }
        });

        if (!currentMember || currentMember.role !== 'ADMIN') {
            return forbiddenResponse("Only Tribe Admins can manage roles");
        }

        // 3. Update the target member's role
        const updatedMember = await prisma.tribeMember.update({
            where: {
                id: memberId
            },
            data: {
                role: role // 'ADMIN', 'MODERATOR', 'TIME_KEEPER', 'PLAYER'
            }
        });

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error("Update Role Error:", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
