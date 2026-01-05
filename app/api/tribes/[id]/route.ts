import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
