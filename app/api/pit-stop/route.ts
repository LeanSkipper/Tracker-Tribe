import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch Pit Stop History (The Vault)
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

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter'); // 'wins', 'lessons', 'all'

        let whereClause: any = { userId: user.id };

        if (filter === 'wins') {
            whereClause.winImageUrl = { not: null };
        } else if (filter === 'lessons') {
            whereClause.lesson = { not: null, not: '' };
        }

        const pitStops = await prisma.pitStop.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            take: 50, // Pagination limit for now
        });

        return NextResponse.json(pitStops);

    } catch (error) {
        console.error('Error fetching vault:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new Pit Stop Entry
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
        const { mood, win, winImageUrl, lesson, duration } = body;

        // Validation
        if (!mood || !win) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction: Create PitStop, Update User XP and Streak
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create PitStop
            const pitStop = await tx.pitStop.create({
                data: {
                    userId: user.id,
                    mood,
                    win,
                    winImageUrl,
                    lesson,
                    duration: duration || 0,
                    xpEarned: 20
                }
            });

            // 2. Calculate Streak
            // Logic: If lastPitStopAt was < 8 days ago, increment. Else, reset to 1.
            const now = new Date();
            let newStreak = user.currentStreak;

            if (user.lastPitStopAt) {
                const dayDiff = (now.getTime() - user.lastPitStopAt.getTime()) / (1000 * 60 * 60 * 24);
                if (dayDiff <= 8) { // Allow a bit of buffer around 7 days
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset
                }
            } else {
                newStreak = 1; // First one
            }

            // 3. Update User
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    experience: { increment: 20 },
                    currentXP: { increment: 20 }, // Check if level up logic needed elsewhere
                    currentStreak: newStreak,
                    lastPitStopAt: now
                }
            });

            return { pitStop, xp: updatedUser.currentXP, streak: updatedUser.currentStreak };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error creating pit stop:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
