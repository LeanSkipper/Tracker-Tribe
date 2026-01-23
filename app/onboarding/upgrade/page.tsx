'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Zap, Users, TrendingUp, Mail, Crown, ArrowRight, Sparkles } from 'lucide-react';

export default function UpgradePage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

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

    const handleStartTrial = async () => {
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        setIsActivating(true);
        try {
            const response = await fetch('/api/onboarding/start-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (response.ok) {
                router.push('/obeya');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to start trial');
            }
        } catch (error) {
            alert('Failed to start trial. Please try again.');
        } finally {
            setIsActivating(false);
        }
    };

    const benefits = [
        { icon: Target, text: 'Unlimited goals for 60 days' },
        { icon: TrendingUp, text: 'Full GPS tracking & analytics' },
        { icon: Users, text: 'Access to tribes & community' },
        { icon: Crown, text: 'Priority access to new features' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Side: Free Trial / Login Context */}
                <div className="space-y-8 pt-8">
                    <div className="text-left">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                            <Zap size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                            Unlock Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Full Potential</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Join the community of high achievers. Track your goals, find your tribe, and master your life.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Start Your 60-Day Free Trial</h3>
                        <div className="space-y-4 mb-6">
                            {benefits.map((benefit, idx) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Icon size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-gray-700 text-sm font-medium">{benefit.text}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleStartTrial}
                                disabled={isActivating || !email}
                                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                            >
                                {isActivating ? 'Processing...' : 'Start Free Trial'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Grand Slam Offer Link */}
                <div className="relative group cursor-pointer" onClick={() => router.push('/onboarding/creator-offer')}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-[20px] blur opacity-75 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-8 overflow-hidden border border-white/10 shadow-2xl h-full flex flex-col justify-between">

                        {/* Blinking Badge */}
                        <div className="absolute top-4 right-4 animate-pulse flex items-center gap-1 bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transform rotate-2">
                            <Sparkles size={12} fill="currentColor" /> Early Adopter
                        </div>

                        <div className="mb-4">
                            <Crown size={48} className="text-yellow-400 mb-4 fill-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                            <h2 className="text-3xl font-black mb-2 text-white">Grand Slam Offer</h2>
                            <p className="text-indigo-200 text-lg leading-relaxed mb-4">
                                Become a <strong className="text-white">Sponsor & Investor</strong>.<br />
                                Unlock exclusive Creator privileges.
                            </p>

                            <div className="flex items-center gap-2 text-yellow-300 font-medium bg-white/10 p-2 rounded-lg w-fit">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                {spotsLeft !== null ? `${spotsLeft} spots available` : 'Checking spots...'}
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 group-hover:border-yellow-400/50 group-hover:text-yellow-100"
                            >
                                Explore Creator Privileges <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple footer link */}
            <div className="fixed bottom-4 text-center w-full pointer-events-none">
                <button
                    onClick={() => router.push('/obeya')}
                    className="pointer-events-auto text-sm text-gray-400 hover:text-gray-600 underline"
                >
                    No thanks, I'll stick to the free tier (1 goal)
                </button>
            </div>
        </div>
    );
}
