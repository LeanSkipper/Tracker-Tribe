'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    const [step, setStep] = useState(0); // 0: Start, 1: Mood, 2: Win, 3: Plan, 4: Lesson, 5: Summary
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);

    // Form Data
    const [mood, setMood] = useState<number | null>(null);
    const [win, setWin] = useState('');
    const [winImage, setWinImage] = useState<string | null>(null);
    const [lesson, setLesson] = useState('');

    // Actions Data
    const [prevActions, setPrevActions] = useState<ActionItem[]>([]);
    const [newActions, setNewActions] = useState<string[]>(['', '', '']);
    const [actionUpdates, setActionUpdates] = useState<Record<string, string>>({});

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

    // Fetch previous actions on mount
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
            // 1. Submit Pit Stop Entry
            const pitStopRes = await fetch('/api/pit-stop', {
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

            if (!pitStopRes.ok) throw new Error('Failed to save Pit Stop');

            // 2. Submit Action Updates
            const updates = Object.entries(actionUpdates).map(([id, status]) => ({ id, status }));
            const newActionItems = newActions.filter(a => a.trim().length > 0).map(desc => ({ description: desc }));

            await fetch('/api/pit-stop/previous-actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updates,
                    newActions: newActionItems
                })
            });

            toast.success('Pit Stop Saved! +20 XP');
            onComplete();
            onClose();

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-emerald-400" />
                        <span className="font-mono text-xl font-bold">{formatTime(timer)}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-400">
                        {step === 0 ? 'Ready?' : `Step ${step} of 4`}
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors" aria-label="Close Modal">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1">
                    {step === 0 && (
                        <div className="text-center py-10">
                            <h2 className="text-3xl font-black text-slate-800 mb-4">Weekly Pit Stop</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Take a moment to reflect, celebrate wins, and calibrate for the week ahead.
                                <br />
                                <span className="text-sm italic mt-2 block">&quot;You can&apos;t improve what you don&apos;t measure.&quot;</span>
                            </p>
                            <button onClick={handleStart} className="btn btn-primary px-8 py-4 text-xl shadow-lg hover:scale-105 transition-transform">
                                START PIT STOP
                            </button>
                        </div>
                    )}

                    {step === 1 && (
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
                            <div className="flex justify-between w-full max-w-xs mx-auto text-xs text-slate-400 font-bold uppercase tracking-wider">
                                <span>Rough</span>
                                <span>Epic</span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
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

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl font-bold text-slate-800 text-center">Plan vs Actual ⚖️</h3>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Last Week&apos;s Actions</h4>
                                {prevActions.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic text-center py-4">No actions tracked last week.</p>
                                ) : (
                                    prevActions.map(action => (
                                        <div key={action.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-sm font-medium text-slate-700 truncate flex-1 pr-4">{action.description}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setActionUpdates(prev => ({ ...prev, [action.id]: 'DONE' }))}
                                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${actionUpdates[action.id] === 'DONE' || (!actionUpdates[action.id] && action.status === 'DONE') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
                                                >
                                                    DONE
                                                </button>
                                                <button
                                                    onClick={() => setActionUpdates(prev => ({ ...prev, [action.id]: 'MISSED' }))}
                                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${actionUpdates[action.id] === 'MISSED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
                                                >
                                                    MISSED
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-slate-100 my-4"></div>

                            {/* New Actions */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">Next Week&apos;s Focus (Max 3)</h4>
                                {newActions.map((action, idx) => (
                                    <input
                                        key={idx}
                                        value={action}
                                        onChange={(e) => {
                                            const updated = [...newActions];
                                            updated[idx] = e.target.value;
                                            setNewActions(updated);
                                        }}
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm"
                                        placeholder={`Action ${idx + 1} (Start with a verb e.g. "Call", "Draft", "Ship")`}
                                    />
                                ))}
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
                    <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-between">
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
            </div>
        </div>
    );
}
