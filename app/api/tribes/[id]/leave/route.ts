import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tribeId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const body = await req.json();
        const { reason } = body;

        // Find membership
        const membership = await prisma.tribeMember.findFirst({
            where: {
                tribeId,
                userId: user.id
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'Not a member of this tribe' }, { status: 400 });
        }

        // Check if user is the creator
        const tribe = await prisma.tribe.findUnique({
            where: { id: tribeId },
            select: { creatorId: true }
        });

        if (tribe?.creatorId === user.id) {
            return NextResponse.json({ error: 'Creators cannot leave their own tribe. You must delete the tribe or transfer ownership.' }, { status: 400 });
        }

        // Delete membership
        await prisma.tribeMember.delete({
            where: { id: membership.id }
        });

        // Log the reason (we could add a LeaveLog table later, but for now just console/success)
        console.log(`User ${user.id} left tribe ${tribeId}. Reason: ${reason}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error leaving tribe:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
