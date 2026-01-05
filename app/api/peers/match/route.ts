import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission, forbiddenResponse } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        // Get current user (in production, this would come from session)
        const user = await prisma.user.findFirst();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user can view peer GPS (ENGAGED or HARD subscription required)
        const permission = await checkPermission({
            id: user.id,
            email: user.email,
            name: user.name,
            userProfile: user.userProfile as any,
            subscriptionStatus: user.subscriptionStatus as any,
            subscriptionPlan: user.subscriptionPlan,
            trialStartDate: user.trialStartDate,
            trialEndDate: user.trialEndDate,
            graceStartDate: user.graceStartDate,
            graceEndDate: user.graceEndDate,
            reputationScore: user.reputationScore,
            profileCompleteness: user.profileCompleteness,
        }, 'viewPeerGPS');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }


        const body = await req.json();
        const { targetUserId, action } = body; // action: 'LIKE' | 'PASS'

        if (!targetUserId || !['LIKE', 'PASS'].includes(action)) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }

        if (targetUserId === user.id) {
            return NextResponse.json({ error: 'Cannot match with self' }, { status: 400 });
        }

        // Check if match already exists
        const existingMatch = await prisma.match.findUnique({
            where: {
                initiatorId_targetId: {
                    initiatorId: user.id,
                    targetId: targetUserId,
                },
            },
        });

        if (existingMatch) {
            return NextResponse.json({ message: 'Already processed this user' }, { status: 200 });
        }

        let status = 'PENDING';
        let isMatch = false;

        if (action === 'PASS') {
            status = 'REJECTED'; // Or IGNORED
        } else if (action === 'LIKE') {
            const reverseMatch = await prisma.match.findUnique({
                where: {
                    initiatorId_targetId: {
                        initiatorId: targetUserId,
                        targetId: user.id
                    }
                }
            });

            if (reverseMatch && reverseMatch.status === 'PENDING') {
                // It's a match!
                // Update reverse match to ACCEPTED
                await prisma.match.update({
                    where: { id: reverseMatch.id },
                    data: { status: 'ACCEPTED' }
                });
                // Create current match as ACCEPTED
                status = 'ACCEPTED';
                isMatch = true;
            } else if (reverseMatch && reverseMatch.status === 'ACCEPTED') {
                // Already accepted? (Shouldn't happen in normal flow)
                status = 'ACCEPTED';
                isMatch = true;
            }
        }

        // Create the match record
        await prisma.match.create({
            data: {
                initiatorId: user.id,
                targetId: targetUserId,
                status: status as any,
            },
        });

        return NextResponse.json({ success: true, isMatch, status });

    } catch (error) {
        console.error('Error processing match:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
