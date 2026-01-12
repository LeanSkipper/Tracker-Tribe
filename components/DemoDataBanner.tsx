'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoDataBanner() {
    const [isDismissed, setIsDismissed] = useState(false);
    const router = useRouter();

    if (isDismissed) return null;

    const handleSignIn = () => {
        // Redirect to sign-in page
        router.push('/auth/signin');
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                <div className="flex-1">
                    <p className="font-semibold text-sm">
                        You're viewing demo data
                    </p>
                    <p className="text-xs text-blue-100">
                        Sign in to save your own goals and start your 60-day free trial
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleSignIn}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                >
                    Sign In Free
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
