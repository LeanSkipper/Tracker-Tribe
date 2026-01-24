'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Crown, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function UpgradePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isActivating, setIsActivating] = useState(false);

    // Custom Pricing State
    const [engagedPrice, setEngagedPrice] = useState(10);
    const [creatorPrice, setCreatorPrice] = useState(20);

    // Calculate yearly
    const engagedYearly = engagedPrice * 12;
    const creatorYearly = creatorPrice * 12;

    const handleSubscribe = async (planType: 'ENGAGED' | 'CREATOR') => {
        setIsActivating(true);
        try {
            if (!session?.user?.email) {
                // If not logged in, redirect to login
                router.push('/auth/signin?callbackUrl=/onboarding/upgrade');
                return;
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType,
                    customAmount: planType === 'ENGAGED' ? engagedYearly : creatorYearly,
                    userId: session.user.id,
                    userEmail: session.user.email
                }),
            });

            if (response.ok) {
                const { url } = await response.json();
                if (url) window.location.href = url;
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to start subscription');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to process request');
        } finally {
            setIsActivating(false);
        }
    };

    const handleStartTrial = async () => {
        setIsActivating(true);
        try {
            // Basic trial activation logic (simplified for this view)
            // Ideally this calls the same trial endpoint as before
            const response = await fetch('/api/onboarding/start-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email }),
            });
            if (response.ok) {
                router.push('/obeya');
            } else {
                const error = await response.json();
                // If already active, just go
                if (error.message?.includes('already')) router.push('/obeya');
                else alert(error.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">

            {/* Limited Time Banner */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-center py-2 font-bold text-sm uppercase tracking-wider animate-pulse">
                🔥 Offer available only until Feb 28th 🔥
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Choose Your Level</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Whether you&apos;re just visiting or ready to execute at the highest level, we have a spot for you in the tribe.
                    </p>
                </div>

                {/* Pricing Table */}
                <div className="grid md:grid-cols-4 gap-4 overflow-x-auto pb-8">

                    {/* VISITOR */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col min-w-[280px]">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-400">Visitor</h3>
                            <div className="text-3xl font-black mt-2 text-gray-500">Free</div>
                            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Limited Access</div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Free Trial (Limited)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Up to 1 Goal (60 days)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X size={16} className="text-red-900 shrink-0 mt-0.5" />
                                <span>Tracking & Analytics</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X size={16} className="text-red-900 shrink-0 mt-0.5" />
                                <span>Tribes & Community</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X size={16} className="text-red-900 shrink-0 mt-0.5" />
                                <span>Monetization</span>
                            </li>
                        </ul>
                        <button className="w-full py-3 border border-zinc-700 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed opacity-50">
                            Current Tier
                        </button>
                    </div>

                    {/* STARTER */}
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 flex flex-col min-w-[280px] relative">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white">Starter</h3>
                            <div className="text-3xl font-black mt-2 text-white">Trial</div>
                            <div className="text-xs text-blue-400 mt-1 uppercase tracking-wide">60 Days Access</div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-2 text-sm text-gray-300">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Free Trial (60 days)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-300">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Up to 10 Goals</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-500">
                                <Info size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                                <span>Restricted Access (Basic GPS)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X size={16} className="text-red-900 shrink-0 mt-0.5" />
                                <span>Tribes & Community</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleStartTrial}
                            disabled={isActivating}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            Log In / Start
                        </button>
                    </div>

                    {/* ENGAGED */}
                    <div className="bg-zinc-900 border-2 border-green-500/50 rounded-xl p-6 flex flex-col min-w-[280px] relative shadow-lg shadow-green-900/20">
                        <div className="absolute top-0 inset-x-0 h-1 bg-green-500 mx-6 rounded-b-lg"></div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                <Zap size={18} fill="currentColor" /> Engaged
                            </h3>
                            <div className="mt-2 text-white">
                                <div className="text-xs text-gray-400 mb-1">Name your price (min $10)</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg">$</span>
                                    <input
                                        type="number"
                                        min="10"
                                        aria-label="Engaged Plan Monthly Contribution"
                                        value={engagedPrice}
                                        onChange={(e) => setEngagedPrice(Math.max(10, parseInt(e.target.value) || 0))}
                                        className="bg-transparent text-3xl font-black w-20 outline-none border-b border-green-500/50 focus:border-green-500 text-center"
                                    />
                                    <span className="text-sm font-medium text-gray-400">/mo</span>
                                </div>
                                <div className="text-xs text-green-400 mt-1">Billed ${engagedYearly}/year</div>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Unlimited Goals</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Full GPS Tracking & Analytics</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Full Access to Tribes</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-500">
                                <X size={16} className="text-red-900 shrink-0 mt-0.5" />
                                <span>Create & Monetize Tribes</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleSubscribe('ENGAGED')}
                            disabled={isActivating}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-green-900/40"
                        >
                            Select Engaged
                        </button>
                    </div>

                    {/* CREATOR */}
                    <div className="bg-gradient-to-b from-yellow-900/20 to-zinc-900 border-2 border-yellow-500 rounded-xl p-6 flex flex-col min-w-[280px] relative shadow-2xl shadow-yellow-900/30 transform md:-translate-y-4">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                            Grand Slam Offer
                        </div>
                        <div className="mb-6 mt-2">
                            <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                                <Crown size={18} fill="currentColor" /> Creator
                            </h3>
                            <div className="mt-2 text-white">
                                <div className="text-xs text-gray-400 mb-1">Name your price (min $20)</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg">$</span>
                                    <input
                                        type="number"
                                        min="20"
                                        aria-label="Creator Plan Monthly Contribution"
                                        value={creatorPrice}
                                        onChange={(e) => setCreatorPrice(Math.max(20, parseInt(e.target.value) || 0))}
                                        className="bg-transparent text-3xl font-black w-20 outline-none border-b border-yellow-500/50 focus:border-yellow-500 text-center"
                                    />
                                    <span className="text-sm font-medium text-gray-400">/mo</span>
                                </div>
                                <div className="text-xs text-yellow-500 mt-1">Billed ${creatorYearly}/year</div>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <span>Everything in Engaged</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <span>Create, Host & Monetize Tribes</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <span>Priority Features Access</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white font-medium">
                                <Check size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <span>Early Adopter Badge</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleSubscribe('CREATOR')}
                            disabled={isActivating}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black rounded-lg font-black text-sm transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-[1.02]"
                        >
                            Become a Creator
                        </button>
                    </div>

                </div>

                <div className="text-center mt-12 space-y-4">
                    <p className="text-gray-500 text-sm">
                        All plans include a 14-day money-back guarantee. No questions asked.
                    </p>
                    <button onClick={() => router.push('/obeya')} className="text-gray-500 hover:text-white underline text-sm">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
