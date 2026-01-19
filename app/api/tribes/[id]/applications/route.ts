import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/tribes/[id]/applications - Get pending applications
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tribeId = (await params).id;

        // Verify Admin Access
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

        const applications = await prisma.tribeApplication.findMany({
            where: {
                tribeId,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("GET Applications Error:", error);
        return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }
}
