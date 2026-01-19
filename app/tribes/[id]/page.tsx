'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle2, Target } from 'lucide-react';
import TribeReliabilityCircle from '@/components/TribeReliabilityCircle';
import MemberGoalTracker from '@/components/MemberGoalTracker';

type Badge = {
    id: string;
    name: string;
    iconName: string;
};

type Goal = {
    id: string;
    vision: string;
    category?: string;
    okrs?: any[];
    // Add other fields as needed
};

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    customTitle?: string;
    grit: number;
    badges: Badge[];
    goals: Goal[];
    actionPlansCount: number;
    attendanceRate: number;
};

type Tribe = {
    id: string;
    name: string;
    description?: string;
    topic?: string;
    meetingTime?: string;
    creatorId?: string;
    members: Member[];
};

type ViewMode = 'operational' | 'tactical' | 'strategic' | 'task';

export default function TribeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const tribeId = params?.id as string;

    const [tribe, setTribe] = useState<Tribe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [trackerMode, setTrackerMode] = useState<ViewMode>('operational');

    const [error, setError] = useState<string | null>(null);

    const fetchTribeDetails = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch(`/api/tribes/${tribeId}/details`);
            if (res.ok) {
                const data = await res.json();
                setTribe(data.tribe);
                setCurrentUserId(data.currentUserId);
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.details || errData.error || 'Failed to load tribe details');
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch tribe details:', err);
            setError(err instanceof Error ? err.message : 'Network error');
            setLoading(false);
        }
    }, [tribeId]);

    useEffect(() => {
        if (tribeId) {
            fetchTribeDetails();
        }
    }, [tribeId, fetchTribeDetails]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-indigo-600 font-bold">Loading tribe details...</div>
            </div>
        );
    }

    if (!tribe) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 flex-col gap-4">
                <div className="text-slate-600 text-xl font-bold">Tribe not found</div>
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-lg text-center border border-red-100">
                        Error details: {error}
                    </div>
                )}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // Check if current user is a member or creator
    const isCreator = tribe.creatorId === currentUserId;
    const isMember = isCreator || tribe.members.some(m => m.id === currentUserId);
    const isAdmin = isCreator || tribe.members.some(m => m.id === currentUserId && m.role === 'ADMIN');

    if (!isMember) {
        // --- PUBLIC PREVIEW VIEW ---
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="relative h-48 bg-indigo-600">
                        {/* Cover Image Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-6xl uppercase tracking-widest select-none">
                            {tribe.topic || 'TRIBE'}
                        </div>
                    </div>

                    <div className="px-8 py-8 -mt-12 relative">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h1 className="text-3xl font-black text-slate-900 mb-2">{tribe.name}</h1>
                            {tribe.topic && <p className="text-indigo-600 font-bold uppercase tracking-wide text-sm">{tribe.topic}</p>}

                            {/* Key Info */}
                            <div className="flex items-center gap-4 mt-4 text-slate-600 text-sm">
                                <span className="flex items-center gap-1"><Users size={16} /> {tribe.members.length} Members</span>
                                {tribe.meetingTime && <span className="flex items-center gap-1"><CheckCircle2 size={16} /> {tribe.meetingTime}</span>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">About this Table</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {tribe.description || "Join this high-performance mastermind group to accelerate your growth."}
                                </p>
                            </div>

                            {/* Join Action */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <button
                                    onClick={async () => {
                                        if (!confirm("Apply to join this tribe?")) return;
                                        try {
                                            const res = await fetch(`/api/tribes/${tribe.id}/apply`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ message: "I'd like to join!" })
                                            });
                                            if (res.ok) alert('Application sent!');
                                        } catch (e) { alert('Error applying'); }
                                    }}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-200 text-lg"
                                >
                                    Apply to Join
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-3">
                                    By applying, you agree to the community guidelines.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={() => router.push('/tribes')} className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
                                Back to Browse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const averageGrit = tribe.members.reduce((acc, m) => acc + m.grit, 0) / (tribe.members.length || 1);

    // --- MEMBER VIEW (TRIBE ROOM) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
            <div className="max-w-[1600px] mx-auto">
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
                    <h2 className="text-2xl font-bold text-indigo-600 mb-2">{tribe.name}</h2>
                    {tribe.meetingTime && (
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
                                <span>📅</span> {tribe.meetingTime}
                            </div>
                            <button
                                onClick={() => router.push(`/tribes/${tribe.id}/session`)}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm flex items-center gap-2"
                            >
                                <Users size={16} />
                                Enter Live Session
                            </button>
                        </div>
                    )}

                    {/* Admin Console - Only visible to ADMINs */}
                    {isAdmin && (
                        <div className="mt-6 bg-slate-800 text-white p-6 rounded-2xl">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                🛡️ Admin Console (Hats)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-700 p-4 rounded-xl">
                                    <h4 className="font-bold mb-2">Manage Hats</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {tribe.members.map(member => (
                                            <div key={member.id} className="bg-slate-600 p-3 rounded-lg flex flex-col gap-2 shadow-sm border border-slate-500/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold truncate pr-2">{member.name}</span>
                                                    <select
                                                        value={member.role}
                                                        onChange={async (e) => {
                                                            const newRole = e.target.value;
                                                            try {
                                                                const res = await fetch(`/api/tribes/${tribe.id}/roles`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    // Determine if we should preserve custom title or clear it? 
                                                                    // Use case: Admin changes hat, custom title likely stays unless cleared.
                                                                    // We pass the current customTitle to ensure it's not lost if the API did a full replace (it does update).
                                                                    body: JSON.stringify({ memberId: member.id, role: newRole, customTitle: member.customTitle })
                                                                });
                                                                if (res.ok) fetchTribeDetails();
                                                            } catch (err) { alert('Failed'); }
                                                        }}
                                                        className="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-500 focus:border-indigo-500 focus:outline-none"
                                                    >
                                                        <option value="ADMIN">Admin (Green)</option>
                                                        <option value="MODERATOR">Moderator (Orange)</option>
                                                        <option value="TIME_KEEPER">Time Keeper (Black)</option>
                                                        <option value="SPECIAL_GUEST">Special Guest (Purple)</option>
                                                        <option value="PLAYER">Player (None/Custom)</option>
                                                    </select>
                                                </div>
                                                {/* Custom Title Input */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-300 uppercase tracking-wide w-12 shrink-0">Specific Role:</span>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Finance Wizard"
                                                        className="flex-1 bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-500 focus:border-indigo-500 focus:outline-none"
                                                        defaultValue={member.customTitle || ''}
                                                        onBlur={async (e) => {
                                                            const val = e.target.value;
                                                            if (val === member.customTitle) return; // No change
                                                            try {
                                                                await fetch(`/api/tribes/${tribe.id}/roles`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ memberId: member.id, role: member.role, customTitle: val })
                                                                });
                                                                fetchTribeDetails();
                                                            } catch (err) { console.error(err); }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* VISUALIZATION: Tribe Reliability Circle (Hats) */}
                <TribeReliabilityCircle
                    members={tribe.members}
                    averageGrit={averageGrit}
                />

                {/* SHARED TRACKER VIEW */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Target className="text-indigo-600" />
                            Shared Tracker
                        </h2>

                        {/* View Switcher */}
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                            {[
                                { id: 'task', label: 'FUP' },
                                { id: 'operational', label: 'Execution' },
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
                        {tribe.members.map(member => (
                            <div key={member.id} className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {member.name}
                                            {member.id === currentUserId && <span className="ml-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">YOU</span>}
                                        </h3>
                                    </div>
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
