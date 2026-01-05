import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        // For prototype, just use the first user
        const user = await prisma.user.findFirst();
        if (!user) return NextResponse.json({ error: "No user found" }, { status: 404 });

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
