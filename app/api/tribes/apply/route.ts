import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
    try {
        const tribes = await prisma.tribe.findMany({
            include: {
                members: true,
                applications: {
                    where: { status: 'PENDING' }
                }
            }
        });
        return NextResponse.json(tribes);
    } catch (error) {
        console.error("GET Tribes Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribes" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { tribeId, message } = data;

        // Get user from session
        const user = await getSession();
        if (!user) return unauthorizedResponse();

        const application = await prisma.tribeApplication.create({
            data: {
                userId: user.id,
                tribeId: tribeId,
                message: message || "I would like to join this mastermind.",
                status: "PENDING"
            }
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error("POST Application Error:", error);
        return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const data = await req.json();
        const { applicationId, status } = data;

        const application = await prisma.tribeApplication.update({
            where: { id: applicationId },
            data: { status }
        });

        // If approved, add user to tribe members (in a real app, handle many-to-many)
        // Note: Our schema has User.tribes (relation TribeMembers)
        if (status === 'APPROVED') {
            // Logic to add user to tribe members would go here.
            // For now, we just update the status.
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error("PATCH Application Error:", error);
        return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }
}
