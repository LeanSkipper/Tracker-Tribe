'use client';

import { X, Crown, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SubscriptionLockedModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-zinc-900 border border-yellow-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mb-6 shadow-lg shadow-orange-500/20 relative">
                            <Lock className="text-white relative z-10" size={32} />
                            <div className="absolute inset-0 rounded-full animate-pulse bg-white/20"></div>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2">Creator Access Required</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            Creating and leading a Tribe is a premium feature reserved for our <span className="text-yellow-400 font-bold">Creators</span>.
                        </p>

                        <div className="bg-zinc-800/50 rounded-xl p-4 mb-8 border border-white/5 text-left">
                            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Crown size={14} className="text-yellow-400" />
                                Why become a creator?
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-zinc-300">
                                    <Sparkles size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <span>Lead your own private Tribe</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-zinc-300">
                                    <Sparkles size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <span>Monetization tools (Coming Soon)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-zinc-300">
                                    <Sparkles size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <span>Locked "Grand Slam" pricing for life</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => router.push('/onboarding/creator-offer')}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black uppercase tracking-wide rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20"
                        >
                            Become a Creator
                        </button>

                        <p className="mt-4 text-xs text-zinc-500">
                            Early Adopter Offer Available
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
