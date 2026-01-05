'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Award, Target, CheckCircle2 } from 'lucide-react';
import CircularProgress from '@/components/CircularProgress';
import { motion } from 'framer-motion';

type Badge = {
    id: string;
    name: string;
    iconName: string;
};

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    reliability: number;
    badges: Badge[];
    goals: any[];
    actionPlansCount: number;
    attendanceRate: number;
};

type Tribe = {
    id: string;
    name: string;
    topic?: string;
    meetingTime?: string;
    members: Member[];
};

export default function TribeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const tribeId = params?.id as string;

    const [tribe, setTribe] = useState<Tribe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        if (tribeId) {
            fetchTribeDetails();
        }
    }, [tribeId]);

    const fetchTribeDetails = async () => {
        try {
            const res = await fetch(`/api/tribes/${tribeId}/details`);
            if (res.ok) {
                const data = await res.json();
                setTribe(data.tribe);
                setCurrentUserId(data.currentUserId);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch tribe details:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-indigo-600 font-bold">Loading tribe details...</div>
            </div>
        );
    }

    if (!tribe) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-slate-600">Tribe not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-slate-600 hover:text-indigo-600 font-bold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">TABLE details</h1>
                    <h2 className="text-2xl font-bold text-indigo-600">{tribe.name}</h2>
                    {tribe.topic && <p className="text-slate-600 mt-1">{tribe.topic}</p>}
                </div>

                {/* Round Table Visualization */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Users className="text-indigo-600" />
                                Badges & Reliability
                            </h3>
                        </div>
                    </div>

                    {/* Members in circular layout */}
                    <div className="relative flex items-center justify-center min-h-[400px]">
                        {/* Center reliability circle */}
                        <div className="absolute">
                            <CircularProgress
                                value={tribe.members.reduce((acc, m) => acc + m.reliability, 0) / tribe.members.length}
                                size={140}
                                strokeWidth={10}
                            />
                        </div>

                        {/* Members positioned around circle */}
                        {tribe.members.map((member, index) => {
                            const angle = (360 / tribe.members.length) * index - 90;
                            const angleRad = (angle * Math.PI) / 180;
                            const radius = 200;
                            const x = 50 + radius * Math.cos(angleRad) / 4;
                            const y = 50 + radius * Math.sin(angleRad) / 4;

                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="absolute flex flex-col items-center gap-2"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    {/* Member avatar with badges */}
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 border-4 border-white shadow-lg">
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-2xl">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Top badge */}
                                        {member.badges[0] && (
                                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-indigo-100">
                                                <span className="text-xl">{member.badges[0].iconName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-900 text-sm">{member.name.split(' ')[0]}</div>
                                        <div className="text-xs font-bold text-indigo-600">{member.reliability}%</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Member GPS Views */}
                <div className="space-y-6">
                    {tribe.members.map((member, index) => (
                        <MemberGPSCard
                            key={member.id}
                            member={member}
                            isCurrentUser={member.id === currentUserId}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

type MemberGPSCardProps = {
    member: Member;
    isCurrentUser: boolean;
    index: number;
};

function MemberGPSCard({ member, isCurrentUser, index }: MemberGPSCardProps) {
    const getReliabilityColor = (reliability: number) => {
        if (reliability >= 76) return 'bg-green-500';
        if (reliability >= 51) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden"
        >
            {/* Member Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar with badges */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow">
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-xl">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {member.badges.slice(0, 3).map((badge, idx) => (
                                <div
                                    key={badge.id}
                                    className="absolute w-6 h-6 bg-white rounded-full shadow flex items-center justify-center border border-slate-200"
                                    style={{
                                        right: idx === 0 ? '-4px' : 'auto',
                                        top: idx === 0 ? '-4px' : idx === 1 ? '50%' : 'auto',
                                        bottom: idx === 2 ? '-4px' : 'auto',
                                        transform: idx === 1 ? 'translateY(-50%)' : 'none'
                                    }}
                                    title={badge.name}
                                >
                                    <span className="text-xs">{badge.iconName}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {member.name} {isCurrentUser && <span className="text-sm text-indigo-600">(Me)</span>}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getReliabilityColor(member.reliability)}`} />
                                    <span className="text-sm font-bold text-slate-600">Reliability: {member.reliability}%</span>
                                </div>
                                <div className="text-sm text-slate-600">
                                    <Award size={14} className="inline mr-1" />
                                    {member.badges.length} badges
                                </div>
                                <div className="text-sm text-slate-600">
                                    <Target size={14} className="inline mr-1" />
                                    {member.actionPlansCount} action plans
                                </div>
                            </div>
                        </div>
                    </div>

                    {isCurrentUser && (
                        <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                            Edit My GPS
                        </button>
                    )}
                </div>
            </div>

            {/* GPS View */}
            <div className="p-6">
                {member.goals.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Target size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No shared goals yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {member.goals.map((goal: any) => (
                            <div key={goal.id} className="border border-slate-200 rounded-2xl p-4">
                                <div className="flex items-start gap-4">
                                    {/* Strategic Context */}
                                    <div className="w-32 flex-shrink-0">
                                        <div className="bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-lg text-center">
                                            {goal.category || 'Health'}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-600 font-bold">
                                            STRATEGIC CONTEXT
                                        </div>
                                    </div>

                                    {/* Goal Details */}
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 mb-2">{goal.vision}</div>

                                        {/* OKRs */}
                                        {goal.okrs?.map((okr: any) => (
                                            <div key={okr.id} className="mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-slate-700">{okr.metricName}</span>
                                                    <span className="text-sm text-slate-600">
                                                        RESULT: <span className="font-bold text-green-600">{okr.currentValue}</span>
                                                    </span>
                                                </div>
                                                {/* Monthly progress bar */}
                                                <div className="flex gap-1 h-8">
                                                    {Array.from({ length: 12 }, (_, i) => {
                                                        const monthData = okr.monthlyData?.[i];
                                                        const progress = monthData ? (monthData.actual / monthData.target) * 100 : 0;
                                                        return (
                                                            <div key={i} className="flex-1 bg-slate-100 rounded relative overflow-hidden">
                                                                <div
                                                                    className={`absolute bottom-0 w-full ${progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{ height: `${Math.min(progress, 100)}%` }}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Action Plan */}
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <div className="text-xs font-bold text-slate-600 mb-2">ACTION PLAN</div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4].map((week) => (
                                                    <div key={week} className="flex-1 text-center text-xs text-slate-500">
                                                        W{week}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
