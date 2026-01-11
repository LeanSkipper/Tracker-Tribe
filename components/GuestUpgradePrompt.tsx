'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Clock, Shield } from 'lucide-react';

interface GuestUpgradePromptProps {
    onClose?: () => void;
    variant?: 'banner' | 'modal';
}

export default function GuestUpgradePrompt({ onClose, variant = 'banner' }: GuestUpgradePromptProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const handleUpgrade = () => {
        router.push('/auth/signup');
    };

    if (!isVisible) return null;

    if (variant === 'modal') {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>

                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                            <Sparkles size={32} className="text-white" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Save Your Progress Forever
                            </h3>
                            <p className="text-gray-600">
                                You're trying LAPIS as a guest. Create an account to save your goals permanently!
                            </p>
                        </div>

                        <div className="space-y-3 text-left bg-blue-50 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">60-Day Free Trial</p>
                                    <p className="text-sm text-gray-600">Full access to all features</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">Access Anywhere</p>
                                    <p className="text-sm text-gray-600">Sync across all your devices</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Sparkles size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">Unlimited Goals</p>
                                    <p className="text-sm text-gray-600">Track as many goals as you want</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Create Free Account
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Banner variant
    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Sparkles size={20} className="flex-shrink-0" />
                    <p className="text-sm font-medium">
                        <span className="hidden sm:inline">You're trying LAPIS as a guest. </span>
                        <span className="font-bold">Create an account</span> to save your progress forever!
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUpgrade}
                        className="bg-white text-blue-600 font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
                    >
                        Sign Up Free
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
