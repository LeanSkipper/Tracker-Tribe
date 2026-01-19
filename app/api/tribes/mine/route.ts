
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const memberships = await prisma.tribeMember.findMany({
            where: { userId: user.id },
            include: { tribe: true }
        });

        const tribes = memberships.map(m => ({
            id: m.tribe.id,
            name: m.tribe.name,
        }));

        return NextResponse.json(tribes);
    } catch (error) {
        console.error("GET My Tribes Error:", error);
        return NextResponse.json({ error: "Failed to fetch tribes" }, { status: 500 });
    }
}
