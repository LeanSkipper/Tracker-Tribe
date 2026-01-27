'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Upload, CheckCircle, AlertTriangle, ArrowRight, Layout, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type PitStopModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    nextWeekTaskCount?: number;
};

export default function PitStopModal({ isOpen, onClose, onComplete, nextWeekTaskCount = 0 }: PitStopModalProps) {
    // Steps: 0:Start, 1:Review(Past), 2:Plan(Next), 3:Mood, 4:Win, 5:Lesson
    const [step, setStep] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);

    // Form Data
    const [mood, setMood] = useState<number | null>(null);
    const [win, setWin] = useState('');
    const [winImage, setWinImage] = useState<string | null>(null);
    const [lesson, setLesson] = useState('');

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    // Format Time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setIsActive(true);
        setStep(1);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setWinImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsActive(false);
        try {
            const res = await fetch('/api/pit-stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood,
                    win,
                    winImageUrl: winImage,
                    lesson,
                    duration: timer
                })
            });

            if (!res.ok) throw new Error('Failed to save Pit Stop');

            const data = await res.json();
            toast.success(`Pit Stop Complete! +${data.xp} XP`, { icon: '🎉' });

            // Force refresh 
            window.location.reload();
            onClose();
            onComplete();

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        }
    };

    const handleNext = () => {
        if (step === 2 && nextWeekTaskCount === 0 && !showSkipConfirm) {
            setShowSkipConfirm(true);
            return;
        }
        setShowSkipConfirm(false);
        if (step < 5) setStep(s => s + 1);
        else handleSubmit();
    };

    if (!isOpen) return null;

    // MINIMIZED WIDGET (For Steps 1 & 2)
    if (isMinimized) {
        return (
            <motion.div
                drag
                dragMomentum={false}
                className="fixed bottom-6 right-6 z-50 bg-white shadow-2xl rounded-2xl p-4 border border-slate-200 animate-slide-up flex flex-col gap-3 w-72 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">Pit Stop Active <span className="animate-pulse text-red-500">●</span></span>
                    <button onClick={() => setIsMinimized(false)} className="text-[var(--primary)] text-xs font-bold hover:underline" onPointerDown={(e) => e.stopPropagation()}>
                        EXPAND
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 rounded-lg p-2 flex items-center justify-center w-12 h-12">
                        <Clock className="text-slate-500" size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-mono font-bold text-slate-700">
                            {formatTime(timer)}
                        </div>
                        <div className="text-[10px] text-slate-400">Duration</div>
                    </div>
                </div>

                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 space-y-2">
                    {step === 1 && <p className="font-bold">🎯 Step 1: Review & Update</p>}
                    {step === 2 && <p className="font-bold">📅 Step 2: Plan Next Week</p>}
                    <p className="opacity-80">Use the board to update your tasks.</p>
                </div>

                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setIsMinimized(false)}
                    className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold text-xs shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    I'M DONE UPDATING <ArrowRight size={14} />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-emerald-400" />
                        <span className="font-mono text-xl font-bold">{formatTime(timer)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {(step === 1 || step === 2) && (
                            <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700 px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1">
                                <Layout size={12} /> Minimize
                            </button>
                        )}
                        <div className="text-sm font-medium text-slate-400">
                            {step === 0 ? 'Start' : `Step ${step}/5`}
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors" aria-label="Close Modal">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-6">
                                <h2 className="text-3xl font-black text-slate-800 mb-2">Weekly Pit Stop 🏎️</h2>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                                    "You can't improve what you don't measure."
                                </p>
                                <button onClick={handleStart} className="w-full py-4 bg-[var(--primary)] text-white text-lg font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                                    START TIMER
                                </button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Review Last Week</h3>
                                    <p className="text-slate-500 text-sm mt-1">Check off completed tasks.</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Instructions</p>
                                    <ul className="text-sm space-y-2 text-slate-600">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mark completed tasks as DONE.</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Move unfinished tasks to next week.</li>
                                    </ul>
                                </div>
                                <button onClick={() => setIsMinimized(true)} className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <Layout size={16} /> Minimize to Board
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Plan Next Week</h3>
                                    <p className="text-slate-500 text-sm mt-1">Set yourself up for success.</p>
                                </div>

                                {/* Poka-Yoke Warning */}
                                {nextWeekTaskCount === 0 ? (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left">
                                        <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                                            <AlertTriangle size={18} /> warning
                                        </div>
                                        <p className="text-xs text-amber-700 mb-3">
                                            Your next week is <strong>empty</strong>. Starting a week without a plan is a recipe for drift.
                                        </p>
                                        <button onClick={() => setIsMinimized(true)} className="w-full py-2 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs hover:bg-amber-200">
                                            Add Tasks Now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center gap-3">
                                        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-emerald-900">Great Job!</p>
                                            <p className="text-xs text-emerald-700">You have <strong>{nextWeekTaskCount} methods</strong> planned.</p>
                                        </div>
                                    </div>
                                )}

                                {showSkipConfirm && (
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-600 animate-pulse">
                                        Are you sure? It's highly recommended to plan at least 1 task.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Weekly Mojo</h3>
                                    <p className="text-slate-500 text-sm mt-1">How did you feel overall?</p>
                                </div>
                                <div className="flex justify-center gap-2 py-4">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setMood(val)}
                                            className={`w-12 h-12 rounded-2xl text-xl flex items-center justify-center border-2 transition-all ${mood === val ? 'bg-[var(--primary)] border-[var(--primary)] text-white scale-110 shadow-lg' : 'border-slate-200 text-slate-400 hover:border-[var(--primary)] hover:text-[var(--primary)] bg-white'}`}
                                        >
                                            {val === 1 ? '😫' : val === 2 ? '😕' : val === 3 ? '😐' : val === 4 ? '🙂' : '🤩'}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 text-center">Weekly Win 🏆</h3>
                                    <p className="text-center text-slate-500 text-sm">Celebrate one victory.</p>
                                </div>
                                <textarea
                                    value={win}
                                    onChange={(e) => setWin(e.target.value)}
                                    className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none bg-white text-sm"
                                    placeholder="I finally..."
                                />
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative group bg-white">
                                    {winImage ? (
                                        <div className="relative h-32 w-full">
                                            <img src={winImage} alt="Win" className="w-full h-full object-contain rounded-lg" />
                                            <button onClick={() => setWinImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                                            <p className="text-xs text-slate-500">Upload photo (optional)</p>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 text-center">The Vault 🧠</h3>
                                    <p className="text-center text-slate-500 text-sm">One lesson for the future.</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 relative">
                                    <div className="absolute top-2 left-2 text-2xl opacity-20">❝</div>
                                    <textarea
                                        value={lesson}
                                        onChange={(e) => setLesson(e.target.value)}
                                        className="w-full h-24 bg-transparent border-none outline-none resize-none text-base font-medium text-amber-900 placeholder-amber-900/40 text-center pt-4"
                                        placeholder="Write your lesson here..."
                                    />
                                    <div className="absolute bottom-2 right-2 text-2xl opacity-20">❞</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {step > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                        <button
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            className="px-4 py-2 rounded-lg text-slate-500 font-medium hover:bg-slate-100 transition-colors text-sm"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className={`px-6 py-2 rounded-lg text-white font-bold shadow-lg transition-all flex items-center gap-2 text-sm ${step === 2 && nextWeekTaskCount === 0 && !showSkipConfirm ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[var(--primary)] hover:bg-blue-700'}`}
                        >
                            {step < 5 ? (step === 2 && nextWeekTaskCount === 0 && !showSkipConfirm ? 'Skip Anyway' : 'Next') : 'Finish'}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
