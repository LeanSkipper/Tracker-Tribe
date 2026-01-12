import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Debug endpoint to check if session is working
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        return NextResponse.json({
            hasSession: !!session,
            session: session ? {
                user: session.user,
                expires: session.expires
            } : null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get session',
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
