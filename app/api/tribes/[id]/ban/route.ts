import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
        const { memberId, action } = await req.json(); // action: 'ban' | 'unban'

        if (!memberId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify permissions
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

        // Prevent banning self or creator
        const targetMember = tribe.members.find(m => m.id === memberId);
        if (!targetMember) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        if (targetMember.userId === tribe.creatorId) {
            return NextResponse.json({ error: "Cannot ban the Creator" }, { status: 403 });
        }

        if (targetMember.userId === session.id) {
            return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
        }

        // Execute Ban/Unban
        const isBanned = action === 'ban';

        const updatedMember = await prisma.tribeMember.update({
            where: { id: memberId },
            data: {
                isBanned: isBanned,
                bannedAt: isBanned ? new Date() : null
            }
        });

        return NextResponse.json(updatedMember);

    } catch (error) {
        console.error("Ban API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
