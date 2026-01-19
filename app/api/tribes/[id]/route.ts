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
        const session = await getSession(); // Optional: to return currentUserId

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
                                level: true,
                                grit: true
                            }
                        }
                    }
                }
            }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        // Transform members to flatten user details for frontend convenience
        // Frontend expects member.name, member.grit, etc.
        const transformedMembers = tribe.members.map(member => ({
            ...member.user, // Spread user details (name, avatar, grit, etc.)
            ...member,      // Spread member details (role, joinedAt, signedSOPAt). This overwrites user.id with member.id
            userId: member.userId // Ensure userId is explicit
        }));

        return NextResponse.json({
            tribe: {
                ...tribe,
                members: transformedMembers
            },
            currentUserId: session?.id || ''
        });
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
