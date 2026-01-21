'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle2, FileText, Share2, Edit3, Save, Plus, Info, UserPlus } from 'lucide-react';
import TribeCreationForm from '@/components/TribeCreationForm';

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
};

type Member = {
    id: string; // TribeMember ID
    userId: string; // User ID
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
    isBanned?: boolean;
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
    minLevel?: number;
    minGrit?: number;
    matchmakingCriteria?: string;
    matchmakingSkills?: boolean;
    matchmakingValues?: boolean;
    matchmakingSocial?: boolean;
    matchmakingIntent?: boolean;
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
    const [showEditModal, setShowEditModal] = useState(false); // New state for modal
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
                    standardProcedures: data.tribe.standardProcedures || DEFAULT_SOP,
                    minLevel: data.tribe.minLevel,
                    minGrit: data.tribe.minGrit,
                    matchmakingCriteria: data.tribe.matchmakingCriteria,
                    matchmakingSkills: data.tribe.matchmakingSkills,
                    matchmakingValues: data.tribe.matchmakingValues,
                    matchmakingSocial: data.tribe.matchmakingSocial,
                    matchmakingIntent: data.tribe.matchmakingIntent
                });

                // Check for SOP signature (if member and not creator/admin)
                // Note: We need to check the current user's membership details
                // API returns member with flattened user details, but userId is the key connector
                const currentMember = data.tribe.members.find((m: any) => m.id === data.currentUserId);

                // Only show modal if:
                // 1. Member exists
                // 2. SOPs exist
                // 3. Member hasn't signed
                // 4. User is NOT the creator (creators implicitly agree)
                if (currentMember && data.tribe.standardProcedures && !currentMember.signedSOPAt && data.tribe.creatorId !== data.currentUserId) {
                    setShowSOPModal(true);
                }

                // If Admin, fetch applications
                const isCreator = data.tribe.creatorId === data.currentUserId;
                const isAdmin = isCreator || (currentMember?.role === 'ADMIN');


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

    // --- UNIFIED TRIBE VIEW (For Members AND Guests) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8 pb-32">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => router.push(isMember ? '/dashboard' : '/tribes')}
                        className="flex items-center text-slate-600 hover:text-indigo-600 font-bold transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to {isMember ? 'Dashboard' : 'Browse'}
                    </button>

                    {!isMember && (
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Info size={16} /> You are viewing this tribe as a guest.
                        </div>
                    )}
                </div>


                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">TABLE details</h1>
                            <h2 className="text-3xl font-bold text-indigo-600">{tribe.name}</h2>
                            {tribe.topic && <p className="text-slate-500 font-bold uppercase tracking-wide text-sm mt-1">{tribe.topic}</p>}
                        </div>

                        {/* Primary Action Button */}
                        <div className="flex gap-3">
                            {isMember && (
                                <button
                                    onClick={() => router.push(`/tribes/${tribe.id}/session`)}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm flex items-center gap-2"
                                >
                                    <Users size={18} />
                                    Enter Live Session
                                </button>
                            )}

                            {!isMember && (
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
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm flex items-center gap-2"
                                >
                                    <UserPlus size={18} />
                                    Apply to Join
                                </button>
                            )}
                        </div>
                    </div>


                    {tribe.meetingTime && (
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-700 mb-8">
                            <span>📅</span> {tribe.meetingTime}
                        </div>
                    )}

                    {/* Description - Visible to ALL */}
                    {tribe.description && (
                        <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">About this Tribe</h3>
                            <p className="text-slate-600 leading-relaxed">{tribe.description}</p>
                        </div>
                    )}


                    {/* UNIFIED TRIBE MEMBERS & CAPACITY */}
                    <div className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} />
                                Tribe Members ({tribe.members.length}/{tribe.maxMembers})
                            </h3>
                            {/* Share Link */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/tribes/${tribe.id}`);
                                    alert('Invite link copied!');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-xs border border-slate-200"
                            >
                                <Share2 size={14} />
                                Share
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                            {/* Filled Slots - Member Cards */}
                            {tribe.members.map(member => (
                                <div
                                    key={member.id}
                                    className="flex flex-col items-center gap-3 group cursor-pointer w-24"
                                    onClick={() => router.push(`/profile/${member.userId}`)}
                                    title={`View ${member.name}'s profile`}
                                >
                                    {/* Avatar Circle with Grit */}
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-indigo-100 border-4 border-white shadow-md overflow-hidden group-hover:border-indigo-400 transition-all group-hover:scale-105">
                                            {member.avatarUrl ? (
                                                <img
                                                    src={member.avatarUrl}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-indigo-600 text-2xl">
                                                    {(member.name || '?').charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Grit Badge */}
                                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border-2 border-white">
                                            {member.grit}%
                                        </div>
                                    </div>

                                    {/* Name & Role */}
                                    <div className="text-center w-full">
                                        <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate w-full">
                                            {member.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide truncate w-full">
                                            {member.customTitle || member.role}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty Slots */}
                            {Array.from({ length: Math.max(0, tribe.maxMembers - tribe.members.length) }).map((_, idx) => (
                                <div
                                    key={`empty-${idx}`}
                                    className="flex flex-col items-center gap-3 w-24 opacity-60"
                                    title="Open Spot"
                                >
                                    <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                                        <Plus size={24} />
                                    </div>
                                    <div className="text-center w-full">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Open Spot</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!isMember && (
                            <div className="mt-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                                <p className="text-indigo-800 text-sm font-medium">
                                    Want to join this circle? <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="underline font-bold hover:text-indigo-600">Apply above</button>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* SOPs Section REMOVED for Main View */}


                    {/* ADMIN CONSOLE COPY - Only for Admins */}
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
                                                onClick={() => setShowEditModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                                            >
                                                <Edit3 size={16} /> Edit Details
                                            </button>
                                        </div>

                                        <TribeCreationForm
                                            initialData={{
                                                ...tribe,
                                                meetingTimeHour: tribe.meetingTime ? parseInt(tribe.meetingTime.split(':')[0]) : 10,
                                                meetingTimeMinute: tribe.meetingTime ? parseInt(tribe.meetingTime.split(':')[1]) : 0,
                                            }}
                                            isModal={false}
                                            readOnly={true}
                                        />
                                    </div>
                                )}

                                {/* TAB: SOPs (Editable in Admin) */}
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
                                            <div key={member.id} className={`bg-slate-50 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border ${member.isBanned ? 'border-red-300 bg-red-50' : 'border-slate-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                                                        {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{(member.name || '?')[0]}</div>}
                                                        {member.isBanned && <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center text-white font-bold text-xs">BAN</div>}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold ${member.isBanned ? 'text-red-600 line-through' : 'text-slate-900'}`}>{member.name}</div>
                                                        <div className="text-xs text-slate-500">Grit: {member.grit}%</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-3">
                                                    <select
                                                        value={member.role}
                                                        disabled={member.isBanned}
                                                        onChange={async (e) => {
                                                            const newRole = e.target.value;
                                                            await fetch(`/api/tribes/${tribe.id}/roles`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ memberId: member.id, role: newRole, customTitle: member.customTitle })
                                                            });
                                                            fetchTribeDetails();
                                                        }}
                                                        className="bg-white text-slate-700 text-sm p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none disabled:opacity-50"
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
                                                        disabled={member.isBanned}
                                                        className="bg-white text-slate-700 text-sm p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none disabled:opacity-50"
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

                                                    {/* BAN BUTTON */}
                                                    {member.userId !== currentUserId && member.userId !== tribe.creatorId && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(member.isBanned ? `Unban ${member.name}?` : `Are you sure you want to BAN ${member.name}?`)) return;

                                                                await fetch(`/api/tribes/${tribe.id}/ban`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ memberId: member.id, action: member.isBanned ? 'unban' : 'ban' })
                                                                });
                                                                fetchTribeDetails();
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-colors ${member.isBanned
                                                                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                                                        >
                                                            {member.isBanned ? 'Unban' : 'Ban'}
                                                        </button>
                                                    )}
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

            {/* EDIT TRIBE MODAL */}
            {showEditModal && (
                <TribeCreationForm
                    initialData={{
                        ...tribe,
                        meetingTimeHour: tribe.meetingTime ? parseInt(tribe.meetingTime.split(':')[0]) : 10,
                        meetingTimeMinute: tribe.meetingTime ? parseInt(tribe.meetingTime.split(':')[1]) : 0,
                    }}
                    isModal={true}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        fetchTribeDetails();
                    }}
                />
            )}

        </div >
    );
}
