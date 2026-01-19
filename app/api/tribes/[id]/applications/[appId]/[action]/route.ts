import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/tribes/[id]/applications/[appId]/[action]
// action: 'accept' | 'deny'
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; appId: string; action: string }> }
) {
    try {
        const { id: tribeId, appId, action } = await params;

        if (!['accept', 'deny'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const app = await prisma.tribeApplication.findUnique({
            where: { id: appId },
            include: { user: true } // Need user info to add to tribe
        });

        if (!app) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (action === 'deny') {
            await prisma.tribeApplication.update({
                where: { id: appId },
                data: { status: 'DECLINED' }
            });
            return NextResponse.json({ success: true, status: 'declined' });
        }

        // Accept: Add to tribe members and update app status
        /* 
           Transaction:
           1. Create TribeMember
           2. Update Application status to APPROVED
        */
        await prisma.$transaction([
            prisma.tribeMember.create({
                data: {
                    userId: app.userId,
                    tribeId: tribeId,
                    role: 'PLAYER'
                }
            }),
            prisma.tribeApplication.update({
                where: { id: appId },
                data: { status: 'APPROVED' }
            })
        ]);

        return NextResponse.json({ success: true, status: 'approved' });

    } catch (error) {
        console.error("Application Action Error:", error);
        return NextResponse.json({ error: "Failed to process application" }, { status: 500 });
    }
}
