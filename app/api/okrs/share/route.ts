import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { okrId, tribeId, action } = await req.json(); // action: 'share' | 'unshare'

        if (!okrId || !tribeId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (action === 'share') {
            await prisma.oKR.update({
                where: { id: okrId },
                data: {
                    sharedTribes: {
                        connect: { id: tribeId }
                    }
                }
            });
        } else {
            await prisma.oKR.update({
                where: { id: okrId },
                data: {
                    sharedTribes: {
                        disconnect: { id: tribeId }
                    }
                }
            });
        }

        return NextResponse.json({ message: `OKR ${action}d successfully` });
    } catch (error) {
        console.error("OKR Sharing Error:", error);
        return NextResponse.json({ error: "Failed to update OKR sharing" }, { status: 500 });
    }
}
