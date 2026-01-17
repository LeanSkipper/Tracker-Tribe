'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Zap, Users, TrendingUp, Mail, Check, Sparkles, CreditCard } from 'lucide-react';
// import { signIn } from 'next-auth/react'; // Temporarily unused, preserved for future OAuth implementation

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

                {/* OAuth Sign In - Temporarily hidden, preserved for future use */}
                {/* <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/obeya' })}
                            disabled={isActivating}
                            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <button
                            onClick={() => signIn('linkedin', { callbackUrl: '/obeya' })}
                            disabled={isActivating}
                            className="flex items-center justify-center gap-2 bg-[#0077B5] hover:bg-[#006399] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
