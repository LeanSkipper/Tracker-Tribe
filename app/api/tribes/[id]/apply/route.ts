import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/tribes/[id]/apply - Apply to join a tribe
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;
        const { message } = await req.json();

        // Get current user
        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already a member
        const existingMember = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: user.id,
                    tribeId: tribeId
                }
            }
        });

        if (existingMember) {
            return NextResponse.json({ error: "Already a member" }, { status: 400 });
        }

        // Check if already applied
        const existingApplication = await prisma.tribeApplication.findFirst({
            where: {
                userId: user.id,
                tribeId: tribeId,
                status: "PENDING"
            }
        });

        if (existingApplication) {
            return NextResponse.json({ error: "Application already pending" }, { status: 400 });
        }

        // Create application
        const application = await prisma.tribeApplication.create({
            data: {
                userId: user.id,
                tribeId: tribeId,
                message: message || "",
                status: "PENDING"
            }
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error("POST Apply Error:", error);
        return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
    }
}
