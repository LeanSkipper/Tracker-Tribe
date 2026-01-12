'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoDataBanner() {
    const [isDismissed, setIsDismissed] = useState(false);
    const router = useRouter();

    if (isDismissed) return null;

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                <div className="flex-1">
                    <p className="font-semibold text-sm">
                        You're viewing demo data
                    </p>
                    <p className="text-xs text-blue-100">
                        Sign up for free to save your own goals and track your progress
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push('/onboarding/upgrade')}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                >
                    Start Free Trial
                </button>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
