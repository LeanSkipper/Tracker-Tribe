'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlanName: string;
}

export default function CancelSubscriptionModal({ isOpen, onClose, currentPlanName }: CancelSubscriptionModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    if (!isOpen) return null;

    const reasons = [
        "Too expensive",
        "Not using it enough",
        "Missing features",
        "Found a better alternative",
        "Technical issues",
        "Other"
    ];

    const handleConfirmCancel = async () => {
        setLoading(true);
        try {
            const finalReason = reason === 'Other' ? `Other: ${otherReason}` : reason;

            const res = await fetch('/api/subscription/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: finalReason })
            });

            if (res.ok) {
                setStep(3); // Success
            } else {
                alert('Failed to cancel subscription. Please try again or contact support.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Cancellation failed', error);
            alert('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                        {step === 3 ? <CheckCircle className="text-red-600" size={24} /> : <AlertTriangle className="text-red-600" size={24} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900">
                            {step === 3 ? 'Subscription Cancelled' : 'Cancel Subscription?'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {step === 3
                                ? 'Your subscription will remain active until the end of your current billing period.'
                                : `You are about to cancel your ${currentPlanName} plan.`}
                        </p>
                    </div>
                    {step !== 3 && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-gray-600 font-medium">
                                Before you go, we'd love to know why you're leaving. Your feedback helps us improve.
                            </p>

                            <div className="space-y-2">
                                {reasons.map((r) => (
                                    <label key={r} className="flex items-center p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r}
                                            checked={reason === r}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                        />
                                        <span className="ml-3 text-gray-700 font-medium">{r}</span>
                                    </label>
                                ))}
                            </div>

                            {reason === 'Other' && (
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Please tell us more..."
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={3}
                                />
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Keep Subscription
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!reason || (reason === 'Other' && !otherReason)}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center">
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-gray-900">
                                    Are you absolutely sure?
                                </p>
                                <p className="text-gray-600">
                                    You'll lose access to premium features like Unlimited Goals, Tribe Creation, and Advanced Analytics at the end of your billing cycle.
                                </p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm text-left">
                                <strong>Tip:</strong> If you're not using it enough, consider downgrading to the Starter plan instead of cancelling completely.
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={18} />}
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-6">
                            <p className="text-gray-600">
                                Your subscription has been cancelled. You will continue to have access until your current billing period ends.
                            </p>
                            <button
                                onClick={() => {
                                    onClose();
                                    router.refresh();
                                }}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
