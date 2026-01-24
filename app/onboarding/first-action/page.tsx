'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Target, ArrowRight, Zap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

function FirstActionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const goalId = searchParams.get('goalId');
    const [action, setAction] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Calculate current week number
    const getCurrentWeek = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime() + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);
        return Math.ceil((day + 1) / 7);
    };

    const handleSave = async () => {
        if (!action.trim()) return;
        setIsSaving(true);

        try {
            // If we have a goalId, attach to it. If not (managed to skip logic?), maybe just create a generic one?
            // Ideally we need the goalId.
            if (!goalId) {
                console.error("No Goal Id found");
                // Fallback: Just go to dashboard? Or error?
                router.push('/obeya?tutorial=pitstop');
                return;
            }

            const currentWeek = getCurrentWeek();
            const currentYear = new Date().getFullYear();

            // Create Action via API
            // We reuse POST /api/goals to update the goal with a new action
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: goalId,
                    rows: [
                        {
                            actions: [
                                {
                                    id: `new-act-${Date.now()}`,
                                    title: action,
                                    status: 'WIP',
                                    weekId: `W${currentWeek}`,
                                    year: currentYear
                                }
                            ]
                        }
                    ]
                }),
            });

            if (response.ok) {
                router.push('/obeya?tutorial=pitstop');
            } else {
                alert('Failed to save action. Please try again.');
            }
        } catch (error) {
            console.error('Error saving action:', error);
            alert('An error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        router.push('/obeya?tutorial=pitstop');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
                >
                    <div className="bg-slate-900 p-8 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
                            <Zap className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">One Last Thing...</h1>
                        <p className="text-slate-400 text-lg">
                            Momentum is everything. Commit to <b>one major action</b> for this week.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Card Visualization */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl mb-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg border border-yellow-100 shadow-sm text-yellow-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1">
                                        Action Card - Week {getCurrentWeek()}
                                    </div>
                                    <div className="text-gray-900 font-medium italic">
                                        "{action || 'Write your action below...'}"
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    What is the detailed "Next Step" to start moving the needle?
                                </label>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-lg resize-none"
                                    rows={3}
                                    placeholder="e.g., Call 5 potential leads and schedule a demo..."
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!action.trim() || isSaving}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Committing...' : 'Enter the Arena'}
                                {!isSaving && <ArrowRight size={20} />}
                            </button>

                            <button
                                onClick={handleSkip}
                                className="w-full text-center text-gray-400 hover:text-gray-600 font-medium text-sm"
                            >
                                I'll define it later
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function FirstActionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FirstActionContent />
        </Suspense>
    );
}
