import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/tribes/[id]/sop/sign - Sign SOPs
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tribeId = (await params).id;

        // Verify Membership
        const member = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: session.id,
                    tribeId: tribeId
                }
            }
        });

        if (!member) {
            return NextResponse.json({ error: "You are not a member of this tribe" }, { status: 403 });
        }

        // Update signedSOPAt
        await prisma.tribeMember.update({
            where: { id: member.id },
            data: { signedSOPAt: new Date() }
        });

        return NextResponse.json({ success: true, signedAt: new Date() });

    } catch (error) {
        console.error("Sign SOP Error:", error);
        return NextResponse.json({ error: "Failed to sign SOP" }, { status: 500 });
    }
}
