import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Check the two specific users
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: ['cmke1fbow000njl04v594xlxc', 'cmkjxx9fc0001jm04yqpfk0rg']
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                userProfile: true,
                subscriptionPlan: true,
                subscriptionStatus: true,
            }
        });

        return NextResponse.json({
            message: 'User verification',
            users,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Verification failed', details: String(error) }, { status: 500 });
    }
}
