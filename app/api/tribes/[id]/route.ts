import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/tribes/[id] - Get tribe details with members
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;

        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                                level: true
                            }
                        }
                    }
                }
            }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        return NextResponse.json(tribe);
    } catch (error) {
        console.error("GET Tribe Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribe" }, { status: 500 });
    }
}

// PUT /api/tribes/[id] - Update tribe details (Admin only)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tribeId = (await params).id;
        const body = await req.json();
        const { name, description, topic, meetingTime, standardProcedures } = body;

        // Check permissions: Is user Creator or Admin?
        // We need to fetch the tribe first to check membership/creator status
        // We can optimize this by checking existence + permissions in one query or just fetching what we need.
        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: { members: true }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        const isCreator = tribe.creatorId === session.id;
        // Check if user is an ADMIN member
        // careful: member.userId is the User ID in schema (TribeMember model)
        const isAdmin = tribe.members.some(m => m.userId === session.id && m.role === 'ADMIN');

        if (!isCreator && !isAdmin) {
            return NextResponse.json({ error: "Forbidden: You must be an Admin to update this tribe." }, { status: 403 });
        }

        const updatedTribe = await prisma.tribe.update({
            where: { id: tribeId },
            data: {
                name,
                description,
                topic,
                meetingTime,
                standardProcedures
            }
        });

        return NextResponse.json(updatedTribe);
    } catch (error) {
        console.error("PUT Tribe Error:", error);
        return NextResponse.json({ error: "Failed to update tribe" }, { status: 500 });
    }
}
