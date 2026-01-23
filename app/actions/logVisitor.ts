'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function logVisitor(path: string, source: string | null) {
    try {
        const cookieStore = await cookies();
        let visitorId = cookieStore.get('tnt_visitor_id')?.value;

        // Create a new visitor ID if not present
        if (!visitorId) {
            visitorId = crypto.randomUUID();
            // We can't set cookies in a server action directly if it's called from useEffect usually, 
            // but we can return it. Actually, Server Actions can set cookies.
            cookieStore.set('tnt_visitor_id', visitorId, { maxAge: 60 * 60 * 24 * 365 }); // 1 year

            // Set funnel stage
            cookieStore.set('tnt_funnel_stage', 'TOFU', { maxAge: 60 * 60 * 24 * 30 });
        }

        await prisma.visitorLog.create({
            data: {
                visitorId,
                path,
                source: source || 'direct',
                stage: 'TOFU'
            }
        });

        return { success: true, visitorId };
    } catch (error) {
        console.error("Failed to log visitor:", error);
        return { success: false };
    }
}
