import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/tribes/[id]/shared-goals - Get all goals shared with the tribe
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;

        // Verify user is a member of the tribe
        const user = await getSession();
        if (!user) {
            return unauthorizedResponse();
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

        // Get all tribe members
        const members = await prisma.tribeMember.findMany({
            where: { tribeId },
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
        });

        // Get all goals that are shared with this tribe (visibility = TRIBE)
        const sharedGoals = await prisma.goal.findMany({
            where: {
                visibility: 'TRIBE',
                userId: {
                    in: members.map(m => m.userId)
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                okrs: {
                    include: {
                        actions: true
                    }
                }
            }
        });

        // Map to include parsed monthlyData
        const mappedGoals = sharedGoals.map(g => ({
            ...g,
            okrs: g.okrs.map(okr => ({
                ...okr,
                monthlyData: okr.monthlyData ? JSON.parse(okr.monthlyData) : null,
            }))
        }));

        return NextResponse.json(mappedGoals);
    } catch (error) {
        console.error("GET Shared Goals Error:", error);
        return NextResponse.json({ error: "Failed to fetch shared goals" }, { status: 500 });
    }
}
