import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { voterId, nomineeId, category } = await req.json();

        if (!voterId || !nomineeId || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();

        const vote = await prisma.monthlyVote.create({
            data: {
                voterId,
                nomineeId,
                category,
                month,
                year
            }
        });

        return NextResponse.json(vote);
    } catch (error) {
        console.error("Vote Error:", error);
        return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

        const votes = await prisma.monthlyVote.groupBy({
            by: ['nomineeId', 'category'],
            _count: {
                _all: true
            },
            where: {
                month,
                year
            }
        });

        return NextResponse.json(votes);
    } catch (error) {
        console.error("Fetch Votes Error:", error);
        return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
    }
}
