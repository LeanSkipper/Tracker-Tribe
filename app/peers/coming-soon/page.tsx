'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';

export default function PeersComingSoon() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-100 text-center max-w-lg w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                        <Users size={40} />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-4">
                        Browse Peers
                    </h1>

                    <div className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 font-bold rounded-full text-sm mb-6">
                        🚀 Coming Soon
                    </div>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        We&apos;re building a powerful way for you to discover and connect with like-minded peers based on goals, skills, and values. Stay tuned!
                    </p>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
