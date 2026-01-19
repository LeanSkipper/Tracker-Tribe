'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Target, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
import MemberGoalTracker from '@/components/MemberGoalTracker';

type ViewMode = 'operational' | 'tactical' | 'strategic' | 'task' | 'team-work';

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const tribeId = params?.id as string;

    const [members, setMembers] = useState<any[]>([]);
    const [tribe, setTribe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [trackerMode, setTrackerMode] = useState<ViewMode>('team-work');

    useEffect(() => {
        if (tribeId) {
            fetchSessionData();
        }
    }, [tribeId]);

    const fetchSessionData = async () => {
        try {
            // Fetch tribe details with members AND their goals (now included in API)
            const tribeRes = await fetch(`/api/tribes/${tribeId}`, { cache: 'no-store' });

            if (tribeRes.ok) {
                const data = await tribeRes.json();
                setTribe(data.tribe);

                // transformMembers in API already flattens user data
                // We just need to ensure goals are present (which they are via the new include)
                setMembers(data.tribe.members || []);
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch session data:", err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-indigo-600 font-bold">Loading session...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push(`/tribes/${tribeId}`)}
                        className="flex items-center text-slate-600 hover:text-indigo-600 font-bold mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Tribe Room
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">
                                🔴 Live Session
                            </h1>
                            <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                                {tribe?.name} <span className="text-slate-400 font-normal text-sm">| {tribe?.meetingTime}</span>
                            </h2>
                        </div>
                    </div>
                </div>

                {/* CHECK-IN ROUTINE */}
                <div className="mb-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" /> Check-in Routine
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-600">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="font-bold text-slate-900 mb-2">1. Personal Check-in</div>
                            <p className="text-sm">"On a scale of 1-10, how present are you? What is your biggest win from last week?"</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="font-bold text-slate-900 mb-2">2. Metric Review</div>
                            <p className="text-sm">Review KPIs and OKR progress below. Identify any red flags or blockers.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="font-bold text-slate-900 mb-2">3. The Hot Seat</div>
                            <p className="text-sm">Dive deep into one member's challenge. Brainstorm solutions and commit to actions.</p>
                        </div>
                    </div>
                </div>

                {/* SHARED GPS TRACKER */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Target className="text-indigo-600" />
                            Shared GPS Tracker
                        </h2>

                        {/* View Switcher */}
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                            {[
                                { id: 'team-work', label: 'Team Work' },
                                { id: 'tactical', label: 'Planning' },
                                { id: 'strategic', label: 'Strategy' }
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setTrackerMode(view.id as ViewMode)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-bold transition-all
                                        ${trackerMode === view.id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        }
                                    `}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {members.map(member => (
                            <div key={member.id} className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                {(member.name || '?').charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            {member.name}
                                            {(member.customTitle || member.role) && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${(member.customTitle || member.role) === 'ADMIN' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    (member.customTitle || member.role) === 'MODERATOR' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                                        'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {member.customTitle || member.role}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Level {member.level || 1} • Grit {member.grit || 0}%</div>
                                    </div>
                                </div>

                                {/* OKR/KPI Summary - Small and Read-Only */}
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {member.goals?.flatMap((g: any) =>
                                        (g.okrs || []).map((okr: any) => {
                                            // Get current month data
                                            let monthlyData = [];
                                            try {
                                                monthlyData = typeof okr.monthlyData === 'string'
                                                    ? JSON.parse(okr.monthlyData)
                                                    : (okr.monthlyData || []);
                                            } catch (e) { }

                                            const currentMonth = new Date().getMonth();
                                            const currentYear = new Date().getFullYear();
                                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            const data = monthlyData.find((d: any) =>
                                                d.monthId === monthNames[currentMonth] && d.year === currentYear
                                            );

                                            const hasActual = data?.actual !== null && data?.actual !== undefined;
                                            const isOnTrack = hasActual && (
                                                (okr.targetValue >= okr.currentValue && data.actual >= data.target) ||
                                                (okr.targetValue < okr.currentValue && data.actual <= data.target)
                                            );

                                            return (
                                                <div key={okr.id} className={`px-2 py-1 rounded-md text-xs font-medium border ${okr.type === 'KPI'
                                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                                    : hasActual
                                                        ? isOnTrack
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                            : 'bg-rose-50 border-rose-200 text-rose-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}>
                                                    <span className="font-bold">{okr.metricName}:</span>{' '}
                                                    <span className="font-black">{hasActual ? data.actual : '—'}</span>
                                                    <span className="opacity-60">/{data?.target || okr.targetValue}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <MemberGoalTracker
                                    member={member}
                                    viewMode={trackerMode}
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
