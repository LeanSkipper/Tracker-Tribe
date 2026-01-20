'use client';

import React from 'react';
import { X, Clock, Quote, Trophy } from 'lucide-react';

type PitStopViewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    entry: {
        id: string;
        week: string;
        year: number;
        mood: number;
        win: string;
        winImageUrl?: string | null;
        lesson: string;
        date: string;
    } | null;
};

export default function PitStopViewModal({ isOpen, onClose, entry }: PitStopViewModalProps) {
    if (!isOpen || !entry) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative">

                {/* Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-[var(--primary)] text-white p-2 rounded-lg">
                            <Clock size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 leading-none">Pit Stop Review</h3>
                            <p className="text-xs text-slate-500 font-mono mt-1">{entry.week} • {new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-slate-200 p-2 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Mood */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-600 text-sm uppercase tracking-wider">Mood of the Week</span>
                        <div className="text-3xl" title={`${entry.mood}/5 Stars`}>
                            {entry.mood === 1 ? '😫' : entry.mood === 2 ? '😕' : entry.mood === 3 ? '😐' : entry.mood === 4 ? '🙂' : '🤩'}
                        </div>
                    </div>

                    {/* Win */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-wider">
                            <Trophy size={16} /> Weekly Win
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-slate-700 italic">
                            &quot;{entry.win || "No win recorded."}&quot;
                        </div>
                        {entry.winImageUrl && (
                            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <img src={entry.winImageUrl} alt="Weekly Win" className="w-full object-cover max-h-48" />
                            </div>
                        )}
                    </div>

                    {/* Lesson */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm uppercase tracking-wider">
                            <Quote size={16} /> The Lesson
                        </div>
                        <div className="relative bg-indigo-50 p-6 rounded-xl text-indigo-900 border border-indigo-100 font-serif text-lg leading-relaxed text-center">
                            <span className="absolute top-2 left-2 text-4xl opacity-10">❝</span>
                            {entry.lesson || "No lesson recorded."}
                            <span className="absolute bottom-2 right-2 text-4xl opacity-10">❞</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800">
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
