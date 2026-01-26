'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function TrialBanner() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

    // Don't show on auth pages or landing page
    if (pathname?.startsWith('/auth/') || pathname === '/') return null;

    // Don't show if user is already a creator (CREATOR profile)
    // @ts-ignore - userProfile might not be typed in session yet
    if (session?.user?.userProfile === 'CREATOR') return null;

    useEffect(() => {
        // Fetch remaining spots
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/grand-slam-stats');
                if (res.ok) {
                    const data = await res.json();
                    setSpotsLeft(data.remainingSpots);
                }
            } catch (e) {
                console.error('Failed to fetch stats', e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div
            onClick={() => router.push('/onboarding/upgrade')}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-sm py-2 px-4 flex items-center justify-center gap-3 cursor-pointer hover:opacity-95 transition-opacity relative overflow-hidden"
        >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-white/10 animate-pulse" />

            <div className="flex items-center gap-2 font-bold relative z-10 animate-bounce-subtle">
                <Sparkles size={16} className="text-yellow-300 animate-spin-slow" />
                <span className="uppercase tracking-wide text-yellow-300">Grand Slam Offer:</span>
                <span>
                    {spotsLeft !== null
                        ? `${spotsLeft} spots available`
                        : 'Limited spots available'
                    } or until Feb 28th!
                </span>
                <span className="underline decoration-yellow-300 decoration-2 underline-offset-2 ml-1">
                    Claim Creator Status 🚀
                </span>
            </div>
        </div>
    );
}
