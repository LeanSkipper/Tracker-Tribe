import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // For prototype, get the first user
        const user = await prisma.user.findFirst();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
