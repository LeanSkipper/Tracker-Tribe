import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const history = await prisma.scoreHistory.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true, score: true }
        });

        // Format for Chart (e.g. "Jan 22")
        const formatted = history.map(h => ({
            date: new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: h.score,
            fullDate: h.createdAt
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
