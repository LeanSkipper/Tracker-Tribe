'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Users, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ApplicationSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-green-600 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Application Received!</h1>
                    <p className="text-green-100 text-lg">Your request to join the tribe has been securely submitted.</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                        What Happens Next?
                    </h2>

                    <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {/* Step 1 */}
                        <div className="relative z-10 flex gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                                <CheckCircle2 className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">1. Application Logged</h3>
                                <p className="text-slate-600">We've sent a confirmation email to you and notified the Tribe Admin.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                                <ShieldCheck className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">2. Admin Review</h3>
                                <p className="text-slate-600">The Admin will review your profile, stats, and badges to ensure a good fit.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">3. Member Consensus</h3>
                                <p className="text-slate-600">Many tribes share applications with existing members for a "vibe check".</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative z-10 flex gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">4. Final Decision (Max 15 Days)</h3>
                                <p className="text-slate-600">You will receive an acceptance or rejection email within 15 days. If accepted, you'll get an onboarding link.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={() => router.push('/tribes')}
                            className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            Browse More Tribes <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
