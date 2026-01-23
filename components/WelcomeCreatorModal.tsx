'use client';

import { X, Crown, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeCreatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-zinc-900 border border-yellow-500/50 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                >
                    {/* Header with Confetti effect background idea */}
                    <div className="relative bg-gradient-to-r from-yellow-600 to-orange-600 p-8 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 border-2 border-yellow-400 shadow-xl">
                                <Crown className="text-yellow-400" size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Welcome, Creator!</h2>
                            <p className="text-yellow-100 font-medium mt-2">You have unlocked the highest tier.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-zinc-800 p-3 rounded-lg">
                                    <Users className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Lead Your Tribe</h3>
                                    <p className="text-gray-400 text-sm">Create private Tribes, invite details, and lead the pack toward their goals.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-zinc-800 p-3 rounded-lg">
                                    <TrendingUp className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Monetization (Coming Soon)</h3>
                                    <p className="text-gray-400 text-sm">Turn your leadership into a revenue stream. Early adopters get priority access.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-zinc-800 p-3 rounded-lg">
                                    <ShieldCheck className="text-purple-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Grand Slam Rate Locked</h3>
                                    <p className="text-gray-400 text-sm">Your price is locked for life. No future price hikes for you.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wide rounded-xl transition-all hover:scale-[1.02] shadow-lg"
                            >
                                Let's Get Started 🚀
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
