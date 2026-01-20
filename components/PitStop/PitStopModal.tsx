'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

type ActionItem = {
    id: string;
    description: string;
    status: string;
    dueDate: string;
};

type PitStopModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
};

export default function PitStopModal({ isOpen, onClose, onComplete }: PitStopModalProps) {
    // Steps: 0:Start, 1:Execution(Widget), 2:Mood, 3:Win, 4:Lesson
    const [step, setStep] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Form Data
    const [mood, setMood] = useState<number | null>(null);
    const [win, setWin] = useState('');
    const [winImage, setWinImage] = useState<string | null>(null);
    const [lesson, setLesson] = useState('');

    // Actions Data (Loaded for submission context if needed, but managing is done on board)
    const [prevActions, setPrevActions] = useState<ActionItem[]>([]);

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

    // Fetch previous actions on mount (only to have data if needed)
    useEffect(() => {
        if (isOpen) {
            fetch('/api/pit-stop/previous-actions')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setPrevActions(data);
                })
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleStart = () => {
        setIsActive(true);
        setStep(1);
        setIsMinimized(true); // Start minimized immediately
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

    if (!isOpen) return null;

    // Floating Minimized Widget (Step 1: Execution)
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
                    <p className="font-bold">🎯 Step 1: Execution & Planning</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        <li>Mark last week's tasks as <strong>Done</strong> / <strong>Missed</strong>.</li>
                        <li>Create new tasks for next week.</li>
                    </ul>
                </div>

                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => { setIsMinimized(false); setStep(2); }}
                    className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-bold text-xs shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    TASKS DONE - NEXT STEP <CheckCircle size={14} />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <motion.div
                drag
                dragMomentum={false}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-emerald-400" />
                        <span className="font-mono text-xl font-bold">{formatTime(timer)}</span>
                    </div>
                    <div className="flex items-center gap-4" onPointerDown={(e) => e.stopPropagation()}>
                        {step === 1 && (
                            <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700 px-2 py-1 rounded hover:bg-slate-800">
                                Minimize
                            </button>
                        )}
                        <div className="text-sm font-medium text-slate-400">
                            {step === 0 ? 'Ready?' : `Step ${step} of 4`}
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors" aria-label="Close Modal">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1" onPointerDown={(e) => e.stopPropagation()}>
                    {step === 0 && (
                        <div className="text-center py-10 animate-fade-in">
                            <h2 className="text-3xl font-black text-slate-800 mb-4">Weekly Pit Stop 🏎️</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                The timer will start and this window will minimize so you can focus on updating your goals on the board.
                                <br />
                                <span className="text-sm italic mt-2 block">&quot;You can&apos;t improve what you don&apos;t measure.&quot;</span>
                            </p>
                            <button onClick={handleStart} className="px-8 py-4 bg-[var(--primary)] text-white text-xl font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
                                START PIT STOP
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="text-center py-12 space-y-6 animate-fade-in">
                            <div className="bg-blue-50 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center animate-pulse">
                                <Clock size={40} className="text-[var(--primary)]" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700">Execution Mode Active</h3>
                            <p className="text-lg text-slate-500 max-w-md mx-auto">
                                Please minimize this window to update your tasks directly on the Kanban board.
                            </p>
                            <button onClick={() => setIsMinimized(true)} className="px-6 py-2 border-2 border-[var(--primary)] text-[var(--primary)] font-bold rounded-lg hover:bg-blue-50 transition-colors">
                                Minimize & Update Tasks
                            </button>
                            <div className="pt-4">
                                <button onClick={() => setStep(2)} className="text-slate-400 text-sm hover:text-slate-600 underline">
                                    Skip to Mood
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center animate-fade-in">
                            <h3 className="text-2xl font-bold text-slate-800">How was your week?</h3>
                            <div className="flex justify-center gap-4 py-8">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setMood(val)}
                                        className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center border-2 transition-all ${mood === val ? 'bg-[var(--primary)] border-[var(--primary)] text-white scale-110 shadow-lg' : 'border-slate-200 text-slate-400 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                                    >
                                        {val === 1 ? '😫' : val === 2 ? '😕' : val === 3 ? '😐' : val === 4 ? '🙂' : '🤩'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl font-bold text-slate-800 text-center">Weekly Win 🏆</h3>
                            <p className="text-center text-slate-500">What&apos;s one thing you&apos;re proud of?</p>

                            <textarea
                                value={win}
                                onChange={(e) => setWin(e.target.value)}
                                className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none bg-slate-50"
                                placeholder="I finally shipped the MVP..."
                            />

                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative group">
                                {winImage ? (
                                    <div className="relative h-48 w-full">
                                        <img src={winImage} alt="Win" className="w-full h-full object-contain rounded-lg" />
                                        <button onClick={() => setWinImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove Image">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500 font-medium">Upload a photo (optional)</p>
                                        <p className="text-xs text-slate-400">Capture the moment</p>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload Image" />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl font-bold text-slate-800 text-center">The Vault 🧠</h3>
                            <p className="text-center text-slate-500">One lesson, realization, or piece of advice to your future self.</p>

                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 relative">
                                <div className="absolute top-4 left-4 text-4xl opacity-20">❝</div>
                                <textarea
                                    value={lesson}
                                    onChange={(e) => setLesson(e.target.value)}
                                    className="w-full h-32 bg-transparent border-none outline-none resize-none text-lg font-medium text-amber-900 placeholder-amber-900/40 text-center pt-8"
                                    placeholder="Write your lesson here..."
                                />
                                <div className="absolute bottom-4 right-4 text-4xl opacity-20">❞</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {step > 0 && (
                    <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-between" onPointerDown={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            className="px-6 py-2 rounded-lg text-slate-500 font-medium hover:bg-slate-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => step < 4 ? setStep(s => s + 1) : handleSubmit()}
                            className="px-8 py-2 rounded-lg bg-[var(--primary)] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                            {step < 4 ? 'Next' : 'Finish & Save'}
                            {step === 4 && <CheckCircle size={18} />}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
