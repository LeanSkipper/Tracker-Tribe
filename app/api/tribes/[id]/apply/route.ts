import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/auth";
import { sendTribeApplicationEmails } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/tribes/[id]/apply - Apply to join a tribe
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tribeId = (await params).id;
        const { message } = await req.json();

        // Get current user
        const user = await getSession();
        if (!user) {
            return unauthorizedResponse();
        }

        // Fetch user email details (need full user object for email)
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { email: true, name: true } // Assuming email is on User model. Auth adapter might handle it differently but usually it's there.
        });

        // Check if already a member
        const existingMember = await prisma.tribeMember.findUnique({
            where: {
                userId_tribeId: {
                    userId: user.id,
                    tribeId: tribeId
                }
            }
        });

        if (existingMember) {
            return NextResponse.json({ error: "Already a member" }, { status: 400 });
        }

        // Check if already applied
        const existingApplication = await prisma.tribeApplication.findFirst({
            where: {
                userId: user.id,
                tribeId: tribeId,
                status: "PENDING"
            }
        });

        if (existingApplication) {
            return NextResponse.json({ error: "Application already pending" }, { status: 400 });
        }

        // Fetch tribe with creator email
        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            include: {
                creator: {
                    select: { email: true, name: true }
                }
            }
        });

        if (!tribe) {
            return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
        }

        // Create application
        const application = await prisma.tribeApplication.create({
            data: {
                userId: user.id,
                tribeId: tribeId,
                message: message || "",
                status: "PENDING"
            }
        });

        // Send Emails (Async - don't block response if it fails, but nice to await)
        if (dbUser?.email && tribe.creator.email) {
            await sendTribeApplicationEmails({
                adminEmail: tribe.creator.email,
                adminName: tribe.creator.name || 'Tribe Admin',
                userEmail: dbUser.email,
                userName: dbUser.name || 'User',
                tribeName: tribe.name,
                tribeId: tribe.id,
                userProfileLink: `${process.env.NEXTAUTH_URL || 'https://tracker-tribe.vercel.app'}/profile/${user.id}`
            });
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error("POST Apply Error:", error);
        return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
    }
}
