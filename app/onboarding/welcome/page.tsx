'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Target, Lightbulb, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export default function WelcomePage() {
    const router = useRouter();
    const [isCreatingGuest, setIsCreatingGuest] = useState(false);

    const handleTryAsGuest = async () => {
        // Temporary: Direct redirect until database migration is complete
        // TODO: Re-enable guest session creation after running: npx prisma migrate deploy
        router.push('/onboarding/tutorial');

        /* Full implementation (enable after database migration):
        setIsCreatingGuest(true);
        try {
            const response = await fetch('/api/auth/guest', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to create guest session');
            }

            const data = await response.json();
            console.log('Guest session created:', data);

            router.push('/onboarding/tutorial');
        } catch (error) {
            console.error('Failed to create guest session:', error);
            alert('Failed to start guest session. Please try again.');
            setIsCreatingGuest(false);
        }
        */
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Logo/Brand */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Target size={48} className="text-[var(--primary)]" />
                    <h1 className="text-5xl font-black text-[var(--primary)]">LAPIS</h1>
                </div>

                {/* Hero */}
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                        Your Personal GPS for Life Goals
                    </h2>
                    <p className="text-xl text-gray-600 max-w-xl mx-auto">
                        Set, track, and achieve your most important goals using the same OKR system that top companies use.
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 py-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Clear Vision</h3>
                        <p className="text-sm text-gray-600">Define your goals with clarity and purpose</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={24} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Track Progress</h3>
                        <p className="text-sm text-gray-600">Measure what matters with OKRs and KPIs</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={24} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Stay Accountable</h3>
                        <p className="text-sm text-gray-600">Join tribes and share your journey</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="space-y-4 pt-4">
                    <button
                        onClick={handleTryAsGuest}
                        disabled={isCreatingGuest}
                        className="inline-block bg-[var(--primary)] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreatingGuest ? 'Starting...' : 'Try Without Email - 60 Seconds'}
                    </button>
                    <p className="text-sm text-gray-500">
                        No email required • Try with 1 free goal • Save progress anytime
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/auth/signup"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Already have an account? Sign in →
                        </Link>
                    </div>
                </div>

                {/* What is LAPIS - Expandable */}
                <details className="text-left bg-white p-6 rounded-xl border border-gray-200 max-w-xl mx-auto">
                    <summary className="font-bold text-gray-900 cursor-pointer flex items-center gap-2">
                        <Lightbulb size={20} className="text-yellow-500" />
                        What is LAPIS?
                    </summary>
                    <div className="mt-4 space-y-3 text-gray-600 text-sm">
                        <p>
                            <strong>LAPIS</strong> (Life Achievement Planning & Implementation System) is your personal GPS for achieving life goals.
                        </p>
                        <p>
                            We use <strong>OKRs</strong> (Objectives and Key Results) - the same goal-setting framework used by Google, Intel, and thousands of successful companies - adapted for your personal life.
                        </p>
                        <p>
                            Whether you want to get fit, advance your career, improve relationships, or build wealth, LAPIS helps you set clear targets, track progress, and stay accountable.
                        </p>
                    </div>
                </details>
            </div>
        </div>
    );
}
