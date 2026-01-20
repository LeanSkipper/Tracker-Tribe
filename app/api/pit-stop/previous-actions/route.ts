import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch actions from the past 7 days for review
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get actions due in the last 7 days or created in the last 7 days but not done
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const actions = await prisma.action.findMany({
            where: {
                userId: user.id,
                OR: [
                    { weekDate: { gte: sevenDaysAgo } },
                    { createdAt: { gte: sevenDaysAgo } }
                ],
                // status: { not: 'DONE' } // Optional: only show unfinished ones? Or all for review? 
                // "Mark previous tasks as Done or Missed" implies we show all.
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(actions);

    } catch (error) {
        console.error('Error fetching actions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Batch update actions and create new ones
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await req.json();
        const { updates, newActions } = body;
        // updates: [{ id, status: 'DONE'|'MISSED' }]
        // newActions: [{ description }]

        const results = await prisma.$transaction(async (tx) => {
            // 1. Update status of old actions
            const updatePromises = (updates || []).map((u: any) => {
                // Determine status mapping. 'MISSED' isn't in default schema usually? 
                // Schema says: status String @default("NOT_DONE") // DONE, NOT_DONE, STUCK
                // We'll map 'Missed' to 'NOT_DONE' or keep it as is if we want to track 'Missed' explicitly?
                // Let's use 'STUCK' or 'NOT_DONE' for now, or just trust the string if schema allows.
                return tx.action.update({
                    where: { id: u.id, userId: user.id },
                    data: { status: u.status }
                });
            });

            // 2. Create new actions
            // For next week
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            const createPromises = (newActions || []).map((a: any) => {
                return tx.action.create({
                    data: {
                        userId: user.id,
                        description: a.description,
                        status: 'NOT_DONE',
                        dueDate: nextWeek,
                        weekDate: nextWeek // Roughly
                    }
                });
            });

            await Promise.all([...updatePromises, ...createPromises]);
            return { success: true };
        });

        return NextResponse.json(results);

    } catch (error) {
        console.error('Error processing actions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
