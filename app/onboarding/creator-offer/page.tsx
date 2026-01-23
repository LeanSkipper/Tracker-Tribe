'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Crown,
    TrendingUp,
    Check,
    Gem,
    Lightbulb
} from 'lucide-react';

export default function CreatorOfferPage() {
    const router = useRouter();
    const [monthlyContribution, setMonthlyContribution] = useState<number>(50); // Default to $50/mo -> $600/yr
    const [email, setEmail] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

    const yearlyTotal = monthlyContribution * 12;

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

    const handleProceed = async () => {
        if (!email) {
            alert('Please enter your email address to proceed.');
            return;
        }

        if (yearlyTotal < 200) {
            alert("Minimum yearly engagement for Creator status is $200 USD ($17/mo).");
            return;
        }

        setIsActivating(true);

        try {
            // 1. Ensure user exists (Start Trial / Get ID)
            const userRes = await fetch('/api/onboarding/start-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!userRes.ok) {
                const err = await userRes.json();
                throw new Error(err.message || "Failed to verify email");
            }

            const userData = await userRes.json();
            const userId = userData.user?.id;

            if (!userId) throw new Error("User ID not found");

            // 2. Create Stripe Checkout Session
            const checkoutRes = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType: 'CREATOR',
                    customAmount: yearlyTotal, // Send calculated yearly total
                    userId,
                    userEmail: email
                }),
            });

            if (!checkoutRes.ok) {
                const err = await checkoutRes.json();
                throw new Error(err.error || "Failed to initiate payment");
            }

            const { url } = await checkoutRes.json();

            // 3. Redirect to Stripe
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No payment URL returned");
            }

        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                    >
                        ← Back
                    </button>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                        Turn Strategy into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Plan.</span><br />
                        Your Plan into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Execution.</span><br />
                        Execution into <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Results.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
                        We are the average of our network. Join the elite.
                    </p>
                </div>
            </div>

            {/* Why This Matters (The Philosophy) */}
            <div className="bg-zinc-900/50 py-20 border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-6">
                            <Lightbulb size={14} /> The Road Less Stupid
                        </div>
                        <h2 className="text-3xl font-bold mb-6">Goals without plans are just fantasies.</h2>
                        <div className="space-y-6 text-gray-400 leading-relaxed">
                            <p>
                                <em className="text-white">"About the stupidest thing management can do is to announce some lofty goal for the year ('Our revenue target is $6,000,000 this year') without any thought about the working plan to attain it."</em>
                            </p>
                            <p>
                                The emphasis must be on the CRITICAL drivers and the COMMITMENT required. By tracking your effort, you immediately know if your goals are real or simply a mirage.
                            </p>
                            <p className="text-white font-medium">
                                This platform isn't just a tracker. It's an accountability engine for your reality.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-lg" />
                        <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-2xl">⚡</div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">Your Execution System</h3>
                                    <p className="text-sm text-gray-400">The difference between dreaming and doing.</p>
                                </div>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "GPS Tracking (Goals, Plans, Status)",
                                    "Visual Management",
                                    "Tribe Accountability",
                                    "A System with Rituals & Habits"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <Check size={18} className="text-green-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Creator Pack */}
            <div className="py-20 max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">The Creator Privileges</h2>
                    <p className="text-gray-400">Unlock the full power of the platform.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl hover:border-yellow-500/50 transition-colors group">
                        <Crown className="text-yellow-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-xl font-bold mb-3">Tribe Leadership</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Create, host, and run your own Tribes. Curate your circle. Lead the pack.
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl hover:border-green-500/50 transition-colors group">
                        <TrendingUp className="text-green-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-xl font-bold mb-3">Monetization</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Turn your leadership into income. Monetize your tribes directly on the platform.
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-colors group">
                        <Gem className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-xl font-bold mb-3">Max XP & Rewards</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Earn accelerated XP. Unlock rare badges. Rise to the top of the global leaderboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* The Offer / Check Your Value */}
            <div className="max-w-4xl mx-auto px-6 pb-24">
                <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl overflow-hidden p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            Grand Slam Offer
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black mb-6">Name Your Price</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
                            This open price is to check the perception of value. We are engaged to honor any generous offer with a <strong>VIP High Quality Experience</strong>.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-yellow-400 font-medium">
                            <span className="animate-pulse">●</span>
                            {spotsLeft !== null ? `${spotsLeft} Early Adopter spots remaining` : 'Checking availability...'}
                        </div>
                    </div>

                    <div className="max-w-md mx-auto space-y-6">
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                Your Contribution (Monthly)
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black text-white">$</span>
                                <input
                                    type="number"
                                    min="20"
                                    step="5"
                                    value={monthlyContribution}
                                    onChange={e => setMonthlyContribution(Number(e.target.value))}
                                    className="w-full bg-transparent text-5xl font-black text-yellow-400 outline-none border-b-2 border-zinc-700 focus:border-yellow-400 transition-colors pb-2"
                                />
                                <span className="text-sm font-bold text-gray-500 self-end mb-4">/ month</span>
                            </div>
                            <div className="text-left mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-400">Yearly Engagement:</span>
                                <span className="text-base font-bold text-white">${yearlyTotal}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={handleProceed}
                            disabled={isActivating}
                            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                        >
                            {isActivating ? 'Processing...' : 'Invest for 1 Year'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
