'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';

function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            // Set cookie for 30 days
            document.cookie = `tracker_tribe_ref=${refCode}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }
    }, [searchParams]);

    return null;
}

export default function WelcomePage() {
    return (
        <Suspense fallback={null}>
            <WelcomePageContent />
        </Suspense>
    );
}

function WelcomePageContent() {
    const router = useRouter();
    const [isCreatingGuest, setIsCreatingGuest] = useState(false);

    const handleTryAsGuest = async () => {
        setIsCreatingGuest(true);
        // Temporary: Direct redirect until database migration is complete
        // TODO: Re-enable guest session creation after running: npx prisma migrate deploy
        router.push('/onboarding/tutorial');
    };

    return (
        <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden p-4">
            <ReferralTracker />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-blue-600/20 blur-[100px] rounded-full"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8 text-center">

                        {/* Logo */}
                        <div className="mb-8 flex justify-center">
                            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/10 shadow-lg inline-block">
                                <Image
                                    src="/tnt-logo.jpg"
                                    alt="TNT Logo"
                                    width={80}
                                    height={80}
                                    className="rounded-lg"
                                />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
                            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Dominate?</span>
                        </h1>

                        <p className="text-slate-400 mb-8 text-base leading-relaxed">
                            Stop planning. Start executing. <br />
                            <span className="text-slate-300 font-medium">Set your first goal in 60 seconds.</span>
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleTryAsGuest}
                                disabled={isCreatingGuest}
                                className="group w-full relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{isCreatingGuest ? 'Starting...' : 'Start Now'}</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />

                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                            </button>

                            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500" /> No account required
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <CheckCircle2 size={14} className="text-emerald-500" /> Free forever for personal use
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border-t border-white/5 p-4 text-center">
                        <p className="text-sm text-slate-500">
                            Already a member?{' '}
                            <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs text-slate-600">
                    By continuing, you acknowledge that you are ready to change your life.
                </p>
            </div>
        </main>
    );
}
