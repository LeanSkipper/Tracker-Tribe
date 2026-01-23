'use client';

import { X, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TribeMonetizationTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TribeMonetizationTermsModal({ isOpen, onClose }: TribeMonetizationTermsModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" />
                            Monetization Rules & Terms
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-6">

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                            <DollarSign className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-emerald-800">Your Earning Potential</h4>
                                <p className="text-sm text-emerald-700 mt-1">
                                    As a Creator, you set the price. We handle the billing, taxes, and platform infrastructure so you can focus on leading your tribe.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-slate-900 border-b border-gray-100 pb-2">1. Commission & Fees</h4>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                                <li>
                                    <strong className="text-slate-900">Platform Fee:</strong> We take a flat <span className="font-bold text-slate-900">30% commission</span> on all tribe subscriptions.
                                </li>
                                <li>
                                    <strong className="text-slate-900">Payment Processing:</strong> Stripe processing fees (~2.9% + 30¢) are deducted before the split.
                                </li>
                                <li>
                                    <strong className="text-slate-900">Net Revenue:</strong> You receive ~70% of the subscription price directly to your connected Stripe account.
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-slate-900 border-b border-gray-100 pb-2">2. Payout Schedule</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Payouts are processed monthly via Stripe Connect. Funds typically arrive in your bank account within 2-5 business days after the payout initiates. A minimum balance of $50 is required for payout.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-slate-900 border-b border-gray-100 pb-2">3. Host Responsibilities</h4>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                                <li>
                                    <strong className="text-slate-900">Active Leadership:</strong> You must host at least one live session per month (or per your frequency setting).
                                </li>
                                <li>
                                    <strong className="text-slate-900">Refund Policy:</strong> If a tribe is inactive for 30 days, members are eligible for a full refund of their last month's subscription.
                                </li>
                                <li>
                                    <strong className="text-slate-900">Community Guidelines:</strong> Zero tolerance for hate speech, scams, or harassment. Violation results in immediate ban and forfeiture of unpaid earnings.
                                </li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <p>
                                By enabling monetization, you agree to these terms. We reserve the right to update these terms with 30 days notice.
                            </p>
                        </div>

                    </div>

                    <div className="p-6 border-t border-gray-100 bg-slate-50">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            I Understand
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
