'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, Loader2 } from 'lucide-react';

interface LeaveTribeModalProps {
    isOpen: boolean;
    onClose: () => void;
    tribeName: string;
    onConfirm: (reason: string) => Promise<void>;
}

export default function LeaveTribeModal({ isOpen, onClose, tribeName, onConfirm }: LeaveTribeModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    if (!isOpen) return null;

    const reasons = [
        "Too busy right now",
        "Not the right fit for me",
        "Meeting times don't work",
        "Tribe is too quiet",
        "Tribe is too intense",
        "Other"
    ];

    const handleConfirm = async () => {
        setLoading(true);
        const finalReason = reason === 'Other' ? `Other: ${otherReason}` : reason;
        await onConfirm(finalReason);
        setLoading(false);
        setStep(2); // Success step
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className={`${step === 2 ? 'bg-green-50' : 'bg-red-50'} p-6 border-b border-red-100 flex items-start gap-4`}>
                    <div className={`p-3 ${step === 2 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex-shrink-0`}>
                        {step === 2 ? <CheckCircle className="text-green-600" size={24} /> : <AlertTriangle className="text-red-600" size={24} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900">
                            {step === 2 ? 'Left Tribe' : `Leave ${tribeName}?`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {step === 2
                                ? "You've successfully left the tribe. We're sorry to see you go!"
                                : "Are you sure you want to leave this tribe? You can always apply again later."}
                        </p>
                    </div>
                    {step !== 2 && (
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
                                We'd love to know why you're leaving. Your feedback helps the tribe improve.
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
                                    Stay in Tribe
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading || !reason || (reason === 'Other' && !otherReason)}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={18} />}
                                    Confirm & Leave
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-6">
                            <p className="text-gray-600">
                                Your feedback has been recorded.
                            </p>
                            <button
                                onClick={onClose}
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
