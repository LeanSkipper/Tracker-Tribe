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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold">Loading GPS...</div>;

    if (error && !data?.user) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
            <Lock size={48} className="text-slate-300" />
            <div>{error}</div>
            <button onClick={() => window.history.back()} className="text-indigo-600 underline">Go Back</button>
        </div>
    );

    const { user, goals } = data;
    const hasAccess = goals && goals.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <button onClick={() => window.location.href = '/peers'} className="flex items-center text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-2" /> Back to Peers
                </button>

                {/* Header Profile */}
                <div className="bg-white rounded-[40px] shadow-xl p-8 flex items-center gap-8 border border-slate-100">
                    <div className="w-24 h-24 bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">{user.name?.[0]}</div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                        <div className="flex gap-3 mt-2">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                Level {user.level} Strategist
                            </span>
                        </div>
                        <p className="mt-3 text-slate-500 font-medium max-w-xl">{user.bio || "Building something great."}</p>
                    </div>
                </div>

                {/* Content Gate */}
                {!hasAccess ? (
                    <div className="bg-white rounded-[40px] shadow-md p-16 text-center border border-slate-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Lock size={40} className="text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">GPS Locked</h2>
                        <p className="text-slate-500 max-w-md font-medium">
                            {error || "You do not have the required clearance to view this member's detailed Action Plan and OKRs."}
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
