'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Target, ArrowLeft, CheckCircle2 } from 'lucide-react';
import SharedObeyaTracker from '@/components/SharedObeyaTracker';

const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const firstSunday = new Date(firstDayOfYear);
    const dayOfWeek = firstDayOfYear.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    firstSunday.setDate(firstDayOfYear.getDate() + daysUntilSunday);
    const diffTime = date.getTime() - firstSunday.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
};

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const tribeId = params?.id as string;

    const [members, setMembers] = useState<any[]>([]);
    const [tribe, setTribe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        if (tribeId) {
            fetchSessionData();
        }
    }, [tribeId]);

    const fetchSessionData = async () => {
        try {
            const tribeRes = await fetch(`/api/tribes/${tribeId}`, { cache: 'no-store' });

            if (tribeRes.ok) {
                const data = await tribeRes.json();
                setTribe(data.tribe);
                setMembers(data.tribe.members || []);
                setCurrentUserId(data.currentUserId || '');
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch session data:", err);
            setLoading(false);
        }
    };

    // Transform goals for SharedObeyaTracker
    const transformedGoals = members.flatMap(member =>
        (member.goals || []).map((goal: any) => {
            // Transform OKRs to MetricRows
            const metricRows = (goal.okrs || []).map((okr: any) => {
                let monthlyData = [];
                try {
                    monthlyData = typeof okr.monthlyData === 'string'
                        ? JSON.parse(okr.monthlyData)
                        : (okr.monthlyData || []);
                } catch (e) {
                    monthlyData = [];
                }

                return {
                    id: okr.id,
                    type: okr.type || 'OKR',
                    label: okr.metricName,
                    monthlyData
                };
            });

            // Transform actions to ActionRow
            const allActions = (goal.okrs || []).flatMap((okr: any) =>
                (okr.actions || []).map((action: any) => {
                    const weekDate = new Date(action.weekDate);
                    const weekNum = getWeekNumber(weekDate);
                    return {
                        id: action.id,
                        weekId: `W${weekNum}`,
                        year: weekDate.getFullYear(),
                        title: action.description,
                        status: action.status === 'DONE' ? 'DONE' : 'TBD'
                    };
                })
            );

            const actionRow = {
                id: 'act-' + goal.id,
                label: 'Action Plan',
                actions: allActions
            };

            return {
                id: goal.id,
                userId: member.userId,
                userName: member.name || 'Unknown',
                category: goal.category || 'Business/Career',
                title: goal.vision,
                visibility: goal.visibility || 'PRIVATE',
                rows: [...metricRows, actionRow]
            };
        })
    );

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
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Target className="text-indigo-600" />
                            Shared GPS Tracker
                        </h2>
                    </div>

                    <SharedObeyaTracker
                        goals={transformedGoals}
                        currentUserId={currentUserId}
                        readOnly={false}
                    />
                </div>

            </div>
        </div>
    );
}
