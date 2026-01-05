import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/dashboard - Get user's dashboard data
export async function GET(req: Request) {
    try {
        // Get current user (in production, get from session)
        const user = await prisma.user.findFirst();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get user's tribes with members
        const userTribes = await prisma.tribeMember.findMany({
            where: { userId: user.id },
            include: {
                tribe: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Format tribes for dashboard
        const tribes = userTribes.map(ut => ({
            id: ut.tribe.id,
            name: ut.tribe.name,
            reliabilityRate: ut.tribe.reliabilityRate,
            maxMembers: ut.tribe.maxMembers,
            members: ut.tribe.members.map(m => ({
                id: m.user.id,
                name: m.user.name,
                avatarUrl: m.user.avatarUrl
            }))
        }));

        return NextResponse.json({ tribes });
    } catch (error) {
        console.error("GET Dashboard Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
    }
}
