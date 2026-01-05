'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RoundTable from '@/components/RoundTable';
import { Users, Target, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
    role: 'ADMIN' | 'MODERATOR' | 'PLAYER';
    badges?: any[];
};

type Goal = {
    id: string;
    vision: string;
    category: string;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    okrs: any[];
};

export default function SessionPage() {
    const params = useParams();
    const tribeId = params?.id as string;

    const [members, setMembers] = useState<Member[]>([]);
    const [sharedGoals, setSharedGoals] = useState<Goal[]>([]);
    const [tribe, setTribe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tribeId) {
            fetchSessionData();
        }
    }, [tribeId]);

    const fetchSessionData = async () => {
        try {
            // Fetch tribe details with members
            const tribeRes = await fetch(`/api/tribes/${tribeId}`);
            const tribeData = await tribeRes.json();

            if (tribeRes.ok) {
                setTribe(tribeData);

                // Map members with their badges
                const membersWithBadges = await Promise.all(
                    tribeData.members.map(async (m: any) => {
                        // Fetch user achievements/badges
                        const badgesRes = await fetch(`/api/users/${m.user.id}/badges`);
                        const badges = badgesRes.ok ? await badgesRes.json() : [];

                        return {
                            id: m.user.id,
                            name: m.user.name,
                            avatarUrl: m.user.avatarUrl,
                            role: m.role,
                            badges: badges.slice(0, 3) // Show max 3 badges
                        };
                    })
                );

                setMembers(membersWithBadges);
            }

            // Fetch shared goals
            const goalsRes = await fetch(`/api/tribes/${tribeId}/shared-goals`);
            if (goalsRes.ok) {
                const goalsData = await goalsRes.json();
                setSharedGoals(goalsData);
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-slate-600 hover:text-indigo-600 font-bold mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Tribe
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">
                                {tribe?.name} Session
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span>{members.length} / {tribe?.maxMembers || 10} Members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{tribe?.meetingTime || 'Schedule TBD'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                                Schedule Session
                            </button>
                            <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                                Start Session
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Round Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Users className="text-indigo-600" />
                                Mastermind Table
                            </h2>

                            <div className="flex justify-center">
                                <RoundTable
                                    members={members}
                                    maxSeats={tribe?.maxMembers || 10}
                                    onInvite={() => {
                                        // TODO: Open invite modal
                                        alert('Invite member functionality coming soon!');
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shared Goals Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Target className="text-indigo-600" size={20} />
                                Shared Goals
                            </h2>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {sharedGoals.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <Target size={48} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No shared goals yet</p>
                                        <p className="text-sm mt-1">Members can share their goals from the OBEYA view</p>
                                    </div>
                                ) : (
                                    sharedGoals.map((goal, idx) => (
                                        <motion.div
                                            key={goal.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 transition-colors"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
                                                    {goal.user.avatarUrl ? (
                                                        <img src={goal.user.avatarUrl} alt={goal.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black">
                                                            {goal.user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-slate-500 mb-1">{goal.user.name}</div>
                                                    <div className="font-bold text-slate-900">{goal.vision}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{goal.category}</div>
                                                </div>
                                            </div>

                                            {goal.okrs && goal.okrs.length > 0 && (
                                                <div className="space-y-2">
                                                    {goal.okrs.slice(0, 2).map((okr: any) => (
                                                        <div key={okr.id} className="bg-white rounded-lg p-2 text-xs">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-slate-700">{okr.metricName}</span>
                                                                <span className="text-indigo-600 font-black">
                                                                    {okr.targetValue > 0 ? Math.round((okr.currentValue / okr.targetValue) * 100) : 0}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-500 rounded-full"
                                                                    style={{ width: `${okr.targetValue > 0 ? (okr.currentValue / okr.targetValue) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
