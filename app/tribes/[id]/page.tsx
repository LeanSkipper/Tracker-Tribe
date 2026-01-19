'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TribeCapacityVisualizer from '@/components/TribeCapacityVisualizer';
import { ArrowLeft, Users, CheckCircle2, Target, Settings, FileText, UserPlus, Share2, Edit3, X, Save, Copy } from 'lucide-react';
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
    signedSOPAt?: string;
};

type Tribe = {
    id: string;
    name: string;
    description?: string;
    topic?: string;
    meetingTime?: string;
    creatorId?: string;
    maxMembers: number;
    standardProcedures?: string;
    members: Member[];
};

type ViewMode = 'operational' | 'tactical' | 'strategic' | 'task';

const DEFAULT_SOP = `🛠 [Mastermind Name] Standard Operating Procedure (SOP)
1. Tribe Identity & Purpose
Purpose: [Define the core mission. Example: "To empower entrepreneurs through collective intelligence and accountability in real estate."] 
Values & Principles:

2. Logistics & Cadence
Meeting Time: [Insert Day/Time/Timezone].
Platform: [Insert Google Meet/Zoom/Bitrix link]. 
Communication Hub: [Insert link to private WhatsApp/Discord/Tribe channel]. 

3. Roles & Responsibilities
The Facilitator (Admin): 
The Tribe Member: 
Time keeper
Player

4. The Rhythm (Meeting Agenda)
5. Rules of Engagement & The "Grit" System
6. Penalties & Moderation
Strikes Policy: 
Permanent Removal: `;

export default function TribeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const tribeId = params?.id as string;

    const [tribe, setTribe] = useState<Tribe | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [trackerMode, setTrackerMode] = useState<ViewMode>('operational');
    const [error, setError] = useState<string | null>(null);

    // Admin Console State
    const [adminTab, setAdminTab] = useState<'info' | 'sops' | 'members' | 'apps'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [applications, setApplications] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [showSOPModal, setShowSOPModal] = useState(false);

    const fetchTribeDetails = useCallback(async () => {
        try {
            setError(null);
            // Use the main endpoint which aligns with PUT and flattens member data correctly
            const res = await fetch(`/api/tribes/${tribeId}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setTribe(data.tribe);
                setCurrentUserId(data.currentUserId);
                setEditForm({
                    name: data.tribe.name,
                    description: data.tribe.description,
                    meetingTime: data.tribe.meetingTime,
                    topic: data.tribe.topic,
                    standardProcedures: data.tribe.standardProcedures || DEFAULT_SOP
                });

                // Check for SOP signature (if member and not creator/admin)
                // Note: We need to check the current user's membership details
                const currentMember = data.tribe.members.find((m: any) => m.id === data.currentUserId);
                if (currentMember && data.tribe.standardProcedures && !currentMember.signedSOPAt && data.tribe.creatorId !== data.currentUserId) {
                    setShowSOPModal(true);
                }

                // If Admin, fetch applications
                const isCreator = data.tribe.creatorId === data.currentUserId;
                const isAdmin = isCreator || data.tribe.members.some((m: any) => m.id === data.currentUserId && m.role === 'ADMIN');

                if (isAdmin) {
                    const appRes = await fetch(`/api/tribes/${tribeId}/applications`);
                    if (appRes.ok) {
                        const appData = await appRes.json();
                        setApplications(appData.applications || []);
                    }
                }
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

    const handleUpdateTribe = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/tribes/${tribeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setIsEditing(false);
                fetchTribeDetails();
                alert('Tribe updated successfully!');
            } else {
                alert('Failed to update tribe');
            }
        } catch (e) {
            alert('Error updating tribe');
        } finally {
            setSaving(false);
        }
    };

    const handleAppAction = async (appId: string, action: 'accept' | 'deny') => {
        try {
            const res = await fetch(`/api/tribes/${tribeId}/applications/${appId}/${action}`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchTribeDetails(); // Refresh list and members
            } else {
                alert('Failed to process application');
            }
        } catch (e) {
            alert('Error processing application');
        }
    };

    const handleSignSOP = async () => {
        try {
            const res = await fetch(`/api/tribes/${tribeId}/sop/sign`, { method: 'POST' });
            if (res.ok) {
                setShowSOPModal(false);
                fetchTribeDetails();
            } else {
                alert('Failed to sign SOP');
            }
        } catch (e) {
            alert('Error signing SOP');
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

                    {/* Tribe Capacity & Invite */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex-1">
                            <TribeCapacityVisualizer members={tribe.members} maxMembers={tribe.maxMembers} />
                        </div>
                        <div className="md:w-72">
                            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <Share2 size={18} /> Invite Peers
                                </h3>
                                <p className="text-indigo-100 text-xs mb-4">
                                    Share this link to grow your tribe.
                                </p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/tribes/${tribe.id}`);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="w-full bg-white text-indigo-600 font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors text-sm"
                                >
                                    <Copy size={16} /> Copy Invite Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* VISUALIZATION: Tribe Reliability Circle (Hats) - Moved Up */}
                    <div className="mb-12">
                        <TribeReliabilityCircle
                            members={tribe.members}
                            averageGrit={averageGrit}
                        />
                    </div>

                    {/* SOPs Read-Only View for NON-ADMINS (Displayed if exists) */}
                    {!isAdmin && tribe.standardProcedures && (
                        <div className="mb-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="text-indigo-600" /> Standard Procedures
                            </h3>
                            <div className="prose prose-slate max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-slate-600">{tribe.standardProcedures}</pre>
                            </div>
                        </div>
                    )}


                    {/* ADMIN CONSOLE */}
                    {isAdmin && (
                        <div className="mb-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    🛡️ Admin Console
                                </h3>
                                <div className="flex bg-slate-800 rounded-lg p-1">
                                    <button onClick={() => setAdminTab('info')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'info' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Info</button>
                                    <button onClick={() => setAdminTab('sops')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'sops' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>SOPs</button>
                                    <button onClick={() => setAdminTab('members')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'members' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Roles</button>
                                    <button onClick={() => setAdminTab('apps')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'apps' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                                        Apps {applications.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{applications.length}</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {/* TAB: INFO */}
                                {adminTab === 'info' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-700">General Information</h4>
                                            <button
                                                onClick={() => isEditing ? handleUpdateTribe() : setIsEditing(true)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Info</>}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tribe Name</label>
                                                <input
                                                    disabled={!isEditing}
                                                    className="w-full text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                    value={editForm.name || ''}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Topic</label>
                                                <input
                                                    disabled={!isEditing}
                                                    className="w-full font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                    value={editForm.topic || ''}
                                                    onChange={e => setEditForm({ ...editForm, topic: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                                                <textarea
                                                    disabled={!isEditing}
                                                    rows={3}
                                                    className="w-full text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:resize-none"
                                                    value={editForm.description || ''}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Meeting Time</label>
                                                <input
                                                    disabled={!isEditing}
                                                    className="w-full font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-transparent disabled:border-transparent disabled:px-0"
                                                    value={editForm.meetingTime || ''}
                                                    onChange={e => setEditForm({ ...editForm, meetingTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: SOPs */}
                                {adminTab === 'sops' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-700">Standard Operating Procedures</h4>
                                            <button
                                                onClick={handleUpdateTribe}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                            >
                                                <Save size={16} /> Save SOPs
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4">Define your tribe's rules, roles, and rituals here. All members can view this.</p>
                                        <textarea
                                            rows={12}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            placeholder="# Tribe Rules\n\n1. Be on time.\n2. Respect the circle."
                                            value={editForm.standardProcedures || ''}
                                            onChange={e => setEditForm({ ...editForm, standardProcedures: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* TAB: ROLES (Existing Logic) */}
                                {adminTab === 'members' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {tribe.members.map(member => (
                                            <div key={member.id} className="bg-slate-50 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                                        {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{member.name[0]}</div>}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{member.name}</div>
                                                        <div className="text-xs text-slate-500">Grit: {member.grit}%</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-3">
                                                    <select
                                                        value={member.role}
                                                        onChange={async (e) => {
                                                            const newRole = e.target.value;
                                                            await fetch(`/api/tribes/${tribe.id}/roles`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ memberId: member.id, role: newRole, customTitle: member.customTitle })
                                                            });
                                                            fetchTribeDetails();
                                                        }}
                                                        className="bg-white text-slate-700 text-sm p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                                                    >
                                                        <option value="ADMIN">Admin (Leader)</option>
                                                        <option value="MODERATOR">Moderator</option>
                                                        <option value="TIME_KEEPER">Time Keeper</option>
                                                        <option value="SPECIAL_GUEST">Special Guest</option>
                                                        <option value="PLAYER">Player</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Specific Role (e.g. Scribe)"
                                                        className="bg-white text-slate-700 text-sm p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                                                        defaultValue={member.customTitle || ''}
                                                        onBlur={async (e) => {
                                                            const val = e.target.value;
                                                            if (val === member.customTitle) return;
                                                            await fetch(`/api/tribes/${tribe.id}/roles`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ memberId: member.id, role: member.role, customTitle: val })
                                                            });
                                                            fetchTribeDetails();
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: APPLICATIONS */}
                                {adminTab === 'apps' && (
                                    <div>
                                        <h4 className="font-bold text-slate-700 mb-4">Pending Applications ({applications.length})</h4>
                                        {applications.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 font-bold bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                                No pending applications.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {applications.map(app => (
                                                    <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-lg">{app.user.name}</div>
                                                            <div className="text-sm text-slate-500 italic">"{app.message || 'No message provided.'}"</div>
                                                            <div className="text-xs text-slate-400 mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <button
                                                                onClick={() => handleAppAction(app.id, 'accept')}
                                                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-emerald-100 shadow-md"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleAppAction(app.id, 'deny')}
                                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                                            >
                                                                Deny
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

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


                {/* SOP SIGNATURE MODAL */}
                {showSOPModal && tribe.standardProcedures && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <FileText className="text-indigo-600" /> Community Guidelines
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">Please read and accept the tribe's rules to continue.</p>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                                <div className="prose prose-slate max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600">{tribe.standardProcedures}</pre>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-3xl">
                                <button
                                    onClick={handleSignSOP}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    I Have Read & Agree
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
