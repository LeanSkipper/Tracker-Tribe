
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPitStopReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // Authenticate Cron Job
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('[CRON] Starting Pit Stop Reminders check...');

        // 1. Find users who need a reminder
        // Criteria:
        // - Active user (not blocked/deleted? we don't have soft delete yet, assuming all users are active)
        // - Last Pit Stop was >= 6 days ago
        // - Haven't been reminded in the last 2 days (to prevent spam)
        const sixDaysAgo = new Date();
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const usersDue = await prisma.user.findMany({
            where: {
                OR: [
                    { lastPitStopAt: null }, // New users or never done pit stop (maybe handle differently? Let's just remind them if created > 6 days ago)
                    { lastPitStopAt: { lte: sixDaysAgo } }
                ],
                AND: [
                    {
                        OR: [
                            { lastPitStopReminderAt: null },
                            { lastPitStopReminderAt: { lte: twoDaysAgo } }
                        ]
                    },
                    { email: { not: null } } // Must have email
                ]
            },
            select: {
                id: true,
                email: true,
                name: true,
                currentStreak: true,
                createdAt: true,
                lastPitStopAt: true
            }
        });

        console.log(`[CRON] Found ${usersDue.length} users due for Pit Stop reminder.`);

        let sentCount = 0;
        let errorsCount = 0;

        // 2. Send Emails
        for (const user of usersDue) {
            // Filter out brand new users who joined < 6 days ago and haven't done a pit stop yet
            if (!user.lastPitStopAt && user.createdAt > sixDaysAgo) {
                continue;
            }

            if (!user.email) continue;

            const name = user.name || 'Champion';
            console.log(`[CRON] Sending reminder to ${user.email}...`);

            const result = await sendPitStopReminderEmail(user.email, name, user.currentStreak);

            if (result) {
                sentCount++;
                // 3. Update lastPitStopReminderAt
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastPitStopReminderAt: new Date() }
                });
            } else {
                errorsCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: usersDue.length,
            sent: sentCount,
            errors: errorsCount
        });

    } catch (error) {
        console.error('[CRON] Pit Stop Reminder Failed:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
