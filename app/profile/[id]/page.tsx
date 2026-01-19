'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Target, Users, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GPSViewPage() {
    const params = useParams();
    const id = params?.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchGPS();
        }
    }, [id]);

    const fetchGPS = async () => {
        try {
            const res = await fetch(`/api/users/${id}/gps`);
            const gpsData = await res.json();

            if (res.ok) {
                setData(gpsData);
            } else {
                setError(gpsData.message || 'Failed to load GPS');
                if (gpsData.user) {
                    // If partial data (user info but no goals), still show user profile
                    setData({ user: gpsData.user, goals: [] });
                }
            }
        } catch (err) {
            console.error(err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-indigo-600 font-bold animate-pulse">Loading Profile...</div>
        </div>
    );

    if (error && !data?.user) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
            <Lock size={48} className="text-slate-300" />
            <div>{error}</div>
            <button onClick={() => window.history.back()} className="text-indigo-600 underline">Go Back</button>
        </div>
    );

    const { user, goals } = data;
    const hasAccess = goals && goals.length > 0;

    // Stats calculation (safe defaults)
    const level = user.level || 1;
    const grit = user.grit || 0;
    const xp = user.currentXP || 0;
    const reputation = user.reputationScore || 0;

    const levelProgress = ((level % 10) / 10) * 100;
    const gritProgress = Math.min((grit / 100) * 100, 100);
    const xpProgress = Math.min((xp / 1000) * 100, 100);
    const reputationProgress = Math.min((reputation / 10) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <button onClick={() => window.location.href = '/dashboard'} className="flex items-center text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-2" /> Back to Peers
                </button>

                {/* Header Profile */}
                <div className="bg-white rounded-[40px] shadow-xl p-8 flex flex-col md:flex-row items-center gap-8 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600 z-0 opacity-10"></div>
                    <div className="relative z-10 w-32 h-32 bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white flex-shrink-0">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">{user.name?.[0]}</div>
                        )}
                    </div>
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{user.name}</h1>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                                Level {user.level} Strategist
                            </span>
                            {user.createdAt && (
                                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-bold border border-slate-100">
                                    Member since {new Date(user.createdAt).getFullYear()}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
                            {user.bio || "This user prefers to keep an air of mystery."}
                        </p>
                    </div>
                    {/* Visual Stats Summary for Header */}
                    <div className="relative z-10 flex gap-4 md:gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-slate-900">{reputation.toFixed(1)}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rep</div>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-slate-900">{grit}%</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grit</div>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Level */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Level</div>
                                <div className="text-xl font-black text-slate-900">{level}</div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${levelProgress}%` }}></div>
                        </div>
                    </div>

                    {/* Grit */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                <Target size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Grit</div>
                                <div className="text-xl font-black text-slate-900">{grit}</div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${gritProgress}%` }}></div>
                        </div>
                    </div>

                    {/* XP */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">XP</div>
                                <div className="text-xl font-black text-slate-900">{xp}</div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                    </div>

                    {/* Reputation */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Target size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Reputation</div>
                                <div className="text-xl font-black text-slate-900">{reputation.toFixed(1)}</div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${reputationProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Content Gate */}
                {!hasAccess ? (
                    <div className="bg-white rounded-[40px] shadow-md p-16 text-center border border-slate-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Lock size={40} className="text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Detailed GPS Locked</h2>
                        <p className="text-slate-500 max-w-md font-medium">
                            {error || "You do not have the required clearance to view this member's detailed Action Plan and OKRs. Join a tribe with them or level up!"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="text-indigo-600" />
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Public Roadmap</h2>
                        </div>

                        {goals.map((goal: any, idx: number) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
                            >
                                <h3 className="text-lg font-bold text-slate-800 mb-6">{goal.vision}</h3>

                                <div className="space-y-6">
                                    {goal.okrs?.map((okr: any, oIdx: number) => (
                                        <div key={okr.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{okr.metricName}</span>
                                                <span className="text-sm font-black text-indigo-600">
                                                    {okr.targetValue > 0 ? Math.round((okr.currentValue / okr.targetValue) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${okr.targetValue > 0 ? (okr.currentValue / okr.targetValue) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                                <span>{okr.currentValue}</span>
                                                <span>{okr.targetValue}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {goals.length === 0 && (
                            <div className="text-center py-12 text-slate-400 font-bold">
                                No public goals visible.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
