import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/tribes/[id]/applications - Get pending applications
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;

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
