import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/tribes/[id]/sessions - List all sessions for a tribe
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;

        // Verify user is a member of the tribe
        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const membership = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: user.id,
                    tribeId: tribeId
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Not a member of this tribe" }, { status: 403 });
        }

        // Get all sessions for the tribe
        const sessions = await prisma.session.findMany({
            where: { tribeId },
            orderBy: { scheduledAt: 'desc' }
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("GET Sessions Error:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

// POST /api/tribes/[id]/sessions - Create new session
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;
        const data = await req.json();

        // Verify user is admin or moderator of the tribe
        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const membership = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: user.id,
                    tribeId: tribeId
                }
            }
        });

        if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR')) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        // Create session
        const session = await prisma.session.create({
            data: {
                tribeId,
                title: data.title,
                description: data.description,
                scheduledAt: new Date(data.scheduledAt),
                duration: data.duration || 60,
                status: "SCHEDULED"
            }
        });

        return NextResponse.json(session);
    } catch (error) {
        console.error("POST Session Error:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}
