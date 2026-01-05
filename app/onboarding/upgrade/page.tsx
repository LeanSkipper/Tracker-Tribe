'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Zap, Users, TrendingUp, Mail, Check, Sparkles, CreditCard } from 'lucide-react';

export default function UpgradePage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isActivating, setIsActivating] = useState(false);

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
                // Trial activated, redirect to GPS view
                router.push('/obeya');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to start trial');
            }
        } catch (error) {
            console.error('Error starting trial:', error);
            alert('Failed to start trial. Please try again.');
        } finally {
            setIsActivating(false);
        }
    };

    const handleSubscribe = async (planType: 'MONTHLY' | 'YEARLY') => {
        if (!email) {
            alert('Please enter your email address first');
            return;
        }

        setIsActivating(true);

        try {
            // 1. Ensure user exists and get ID
            const userRes = await fetch('/api/onboarding/start-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const userResText = await userRes.text();
            let userData;
            try {
                userData = JSON.parse(userResText);
            } catch (e) {
                console.error('Failed to parse start-trial response:', userResText);
                throw new Error(`Server error (${userRes.status}): ${userResText.substring(0, 100)}...`);
            }

            // Accept both success types (created or existing)
            if (!userData.success && !userData.user) {
                throw new Error(userData.error || userData.message || 'Failed to verify account');
            }

            const userId = userData.user?.id;

            if (!userId) {
                throw new Error('Could not identify user account');
            }

            // 2. Create Stripe Checkout Session
            const checkoutRes = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType,
                    userId,
                    userEmail: email
                }),
            });

            const checkoutResText = await checkoutRes.text();
            let checkoutData;
            try {
                checkoutData = JSON.parse(checkoutResText);
            } catch (e) {
                console.error('Failed to parse checkout response:', checkoutResText);
                throw new Error(`Checkout Server Error (${checkoutRes.status}): ${checkoutResText.substring(0, 100)}...`);
            }

            if (!checkoutRes.ok) {
                throw new Error(checkoutData.error || 'Failed to initiate checkout');
            }

            const { url } = checkoutData;

            // 3. Redirect to Stripe
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (error: any) {
            console.error('Subscription error:', error);
            alert(error.message || 'Failed to start subscription');
            setIsActivating(false);
        }
    };

    const benefits = [
        { icon: Target, text: 'Unlimited goals for 60 days' },
        { icon: TrendingUp, text: 'Full GPS tracking & analytics' },
        { icon: Users, text: 'Access to tribes & community' },
        { icon: Sparkles, text: '20% discount if you subscribe during trial' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Unlock Unlimited Goals
                    </h1>
                    <p className="text-lg text-gray-600">
                        You've reached the free tier limit of 1 goal
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Benefits */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg">Start Your 60-Day Free Trial</h3>
                        <div className="space-y-3">
                            {benefits.map((benefit, idx) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                            <Icon size={20} className="text-blue-600" />
                                        </div>
                                        <span className="text-gray-700">{benefit.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleStartTrial()}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            We'll send you updates and reminders. No spam, ever.
                        </p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleStartTrial}
                        disabled={isActivating || !email}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                    >
                        {isActivating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Activating...
                            </>
                        ) : (
                            <>
                                <Check size={24} />
                                Start 60-Day Free Trial
                            </>
                        )}
                    </button>

                    {/* Pricing Info & Buttons */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-bold text-gray-900 text-center mb-4 flex items-center justify-center gap-2">
                            <CreditCard size={18} />
                            Ready to upgrade?
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSubscribe('MONTHLY')}
                                disabled={isActivating || !email}
                                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 mb-1">Monthly</span>
                                <span className="text-2xl font-black text-gray-900">$20<span className="text-sm text-gray-400 font-normal">/mo</span></span>
                                <span className="text-[10px] text-green-600 font-bold mt-1 bg-green-50 px-2 py-0.5 rounded-full">Save 20%</span>
                            </button>

                            <button
                                onClick={() => handleSubscribe('YEARLY')}
                                disabled={isActivating || !email}
                                className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-transparent rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            >
                                <span className="text-sm font-bold text-blue-100 mb-1">Yearly</span>
                                <span className="text-2xl font-black text-white">$200<span className="text-sm text-blue-200 font-normal">/yr</span></span>
                                <span className="text-[10px] text-blue-600 font-bold mt-1 bg-white px-2 py-0.5 rounded-full">Best Value</span>
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            Secure payment via Stripe. Cancel anytime.
                        </p>
                    </div>

                    {/* Alternative */}
                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                            Not ready yet?
                        </p>
                        <button
                            onClick={() => router.push('/obeya')}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Continue with Free tier (1 goal)
                        </button>
                    </div>
                </div>

                {/* Social Login (Future) */}
                {/* <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">Or sign up with</p>
                    <div className="flex gap-3 justify-center">
                        <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Google
                        </button>
                        <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            LinkedIn
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
