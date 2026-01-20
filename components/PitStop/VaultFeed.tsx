'use client';

import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Calendar, Clock } from 'lucide-react';

type PitStop = {
    id: string;
    date: string;
    duration: number;
    mood: number;
    win: string;
    winImageUrl?: string;
    lesson?: string;
    xpEarned: number;
};

export default function VaultFeed() {
    const [pitStops, setPitStops] = useState<PitStop[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'wins' | 'lessons'>('all');

    useEffect(() => {
        const fetchPitStops = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/pit-stop?filter=${filter}`);
                const data = await res.json();
                if (Array.isArray(data)) setPitStops(data);
            } catch (error) {
                console.error('Failed to fetch vault:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPitStops();
    }, [filter]);

    // Expose refresh function to parent if needed via context or props, but for now simple local effect

    if (loading && pitStops.length === 0) return <div className="p-8 text-center text-slate-400">Loading your vault...</div>;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex justify-center gap-2 mb-8">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>All Entries</button>
                <button onClick={() => setFilter('wins')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'wins' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Wins & Photos</button>
                <button onClick={() => setFilter('lessons')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'lessons' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Lessons</button>
            </div>

            {pitStops.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No entries found yet. Start your first Pit Stop!</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-100 ml-4 md:ml-8 pl-8 md:pl-12 py-4 space-y-12">
                    {pitStops.map((ps) => (
                        <div key={ps.id} className="relative animate-fade-in-up">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-full border-4 border-slate-50 flex items-center justify-center shrink-0 ${ps.mood >= 4 ? 'bg-emerald-500' : ps.mood === 3 ? 'bg-amber-400' : 'bg-slate-400'}`}>
                                <span className="text-[10px]">{ps.mood >= 4 ? '🤩' : ps.mood === 3 ? '😐' : '😫'}</span>
                            </div>

                            {/* Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center text-xs text-slate-400 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {formatDate(ps.date)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        {Math.floor(ps.duration / 60)}m {ps.duration % 60}s
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Win */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <Award size={16} className="text-amber-500" /> Weekly Win
                                        </h4>
                                        <p className="text-slate-700 leading-relaxed text-sm">{ps.win}</p>
                                        {ps.winImageUrl && (
                                            <div className="mt-4 rounded-lg overflow-hidden border border-slate-100">
                                                <img src={ps.winImageUrl} alt="Win moment" className="w-full object-cover max-h-[300px]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson */}
                                    {ps.lesson && (
                                        <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-50/50 relative mt-4">
                                            <div className="absolute top-2 right-2 text-emerald-200">
                                                <BookOpen size={20} />
                                            </div>
                                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                                                Lesson Learned
                                            </h4>
                                            <p className="text-emerald-900 font-medium italic text-sm">&quot;{ps.lesson}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
