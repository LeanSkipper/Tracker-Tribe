'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Target, ArrowLeft, CheckCircle2, Lock, Unlock, Link, Video, Play, ExternalLink, Edit2, TrendingUp } from 'lucide-react';
import SharedObeyaTracker from '@/components/SharedObeyaTracker';
import PitStopModal from '@/components/PitStop/PitStopModal';

import TribeScoreChart from '@/components/TribeScoreChart';

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
    const [isPitStopOpen, setIsPitStopOpen] = useState(false);
    const [meetingLink, setMeetingLink] = useState('');
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [savingLink, setSavingLink] = useState(false);

    const fetchSessionData = async () => {
        try {
            const tribeRes = await fetch(`/api/tribes/${tribeId}`, { cache: 'no-store' });

            if (tribeRes.ok) {
                const data = await tribeRes.json();
                setTribe(data.tribe);
                setMembers(data.tribe.members || []);
                setCurrentUserId(data.currentUserId || '');
                setMeetingLink(data.tribe.meetingLink || '');
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch session data:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tribeId) {
            fetchSessionData();
        }
    }, [tribeId]);

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

    const handleSaveMeetingLink = async () => {
        if (!tribeId) return;
        setSavingLink(true);
        try {
            await fetch(`/api/tribes/${tribeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingLink })
            });
            setIsEditingLink(false);
        } catch (error) {
            console.error("Failed to save meeting link:", error);
            alert("Failed to save meeting link");
        }
        setSavingLink(false);
    };

    const isAdmin = members.some(m => m.userId === currentUserId && (m.role === 'ADMIN' || m.role === 'MODERATOR')) || tribe?.creator?.id === currentUserId;

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

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">
                                🔴 Live Session
                            </h1>
                            <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                                {tribe?.name} <span className="text-slate-400 font-normal text-sm">| {tribe?.meetingTime}</span>
                            </h2>
                        </div>

                        {/* Meeting Link Section */}
                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center gap-3 min-w-[300px]">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                <Video size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Meeting Link</div>
                                {isEditingLink ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            placeholder="https://zoom.us/j/..."
                                            className="text-sm border rounded px-2 py-1 w-full"
                                        />
                                        <button
                                            onClick={handleSaveMeetingLink}
                                            disabled={savingLink}
                                            className="bg-indigo-600 text-white text-xs px-2 py-1 rounded hover:bg-indigo-700"
                                        >
                                            {savingLink ? '...' : 'Save'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        {meetingLink ? (
                                            <a
                                                href={meetingLink.startsWith('http') ? meetingLink : `https://${meetingLink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold text-indigo-700 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                            >
                                                Join Meeting <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">No link set</span>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => setIsEditingLink(true)}
                                                className="text-slate-400 hover:text-indigo-600 ml-2"
                                                title="Edit Link"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tribe Score Evolution */}
                <div className="mb-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <TrendingUp className="text-indigo-600" /> Tribe Momentum
                    </h3>
                    <TribeScoreChart tribeId={tribeId} />
                </div>

                {/* CHECK-IN ROUTINE */}
                <div className="mb-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" /> Check-in Routine
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-slate-600">
                        {/* Step 1 */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col h-full">
                            <div className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">1. Pit Stop</div>
                            <p className="text-xs mb-3 flex-1">Run your weekly Pit Stop to reflect on progress.</p>
                            <button
                                onClick={() => setIsPitStopOpen(true)}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Play size={14} /> Run Pit Stop
                            </button>
                        </div>

                        {/* Step 2 */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col h-full">
                            <div className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">2. Peer Support</div>
                            <p className="text-xs">Listen to your peer’s pitch. Propose, help, support, challenge, and congrat them.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col h-full">
                            <div className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">3. Pitch</div>
                            <p className="text-xs">Pitch to your peers. Share your thoughts. Keep engaged and committed to your action plan.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col h-full">
                            <div className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">4. Open Space</div>
                            <p className="text-xs">Open floor according to host rules: eg. books, tools, tricks, challenges, new ideas.</p>
                        </div>

                        {/* Step 5 */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col h-full">
                            <div className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">5. Closing</div>
                            <p className="text-xs">Confirm next meeting time and close the session with high energy!</p>
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

            {/* Pit Stop Modal */}
            <PitStopModal
                isOpen={isPitStopOpen}
                onClose={() => setIsPitStopOpen(false)}
                onComplete={() => {
                    // Start 5 min timer or refresh session data?
                }}
            />
        </div>
    );
}
