import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { visibility } = await req.json();
        const goalId = params.id;

        // Validate visibility value
        if (!['PRIVATE', 'TRIBE', 'PUBLIC'].includes(visibility)) {
            return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update goal visibility
        const goal = await prisma.goal.update({
            where: {
                id: goalId,
                userId: user.id // Ensure user owns the goal
            },
            data: {
                visibility
            }
        });

        return NextResponse.json({ goal });
    } catch (error) {
        console.error('Error updating goal visibility:', error);
        return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 });
    }
}
