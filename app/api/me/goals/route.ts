import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
    try {
        // Get user from session
        const user = await getSession();
        if (!user) return unauthorizedResponse();

        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            include: {
                okrs: {
                    include: {
                        sharedTribes: { select: { id: true, name: true } }
                    }
                }
            }
        });

        const tribes = await prisma.tribe.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id
                    }
                }
            },
            select: { id: true, name: true }
        });

        return NextResponse.json({ goals, joinedTribes: tribes });
    } catch (error) {
        console.error("Fetch My Goals Error:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}
