'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle2, FileText, Share2, Edit3, Save, Plus, Info, UserPlus, Lock, CreditCard, AlertCircle, X } from 'lucide-react';
import TribeCreationForm from '@/components/TribeCreationForm';
import SubscriptionLockedModal from '@/components/SubscriptionLockedModal';

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
    isPaid?: boolean;
    subscriptionPrice?: number;
    subscriptionFrequency?: string;
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
    const [isPending, setIsPending] = useState(false); // New state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
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

    const [isRestricted, setIsRestricted] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(user => {
                const isActive = user.userProfile === 'CREATOR' ||
                    user.subscriptionStatus === 'ACTIVE' ||
                    (user.trialEndDate && new Date(user.trialEndDate) > new Date());

                if (!isActive) {
                    setIsRestricted(true);
                    setShowLockModal(true);
                }
            });
    }, []);

    const fetchTribeDetails = useCallback(async () => {
        try {
            setError(null);
            // Use the main endpoint which aligns with PUT and flattens member data correctly
            const res = await fetch(`/api/tribes/${tribeId}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setTribe(data.tribe);
                setCurrentUserId(data.currentUserId);
                setIsPending(data.isPending || false); // Set pending status
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

    const handleApply = async () => {
        if (tribe?.isPaid) {
            setShowPaymentModal(true);
        } else {
            if (!confirm("Apply to join this tribe?")) return;
            submitApplication();
        }
    };

    const submitApplication = async () => {
        try {
            const res = await fetch(`/api/tribes/${tribe?.id}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "I'd like to join!" }) // You might want to allow a custom message later
            });
            if (res.ok) {
                // Redirect to success explanation page
                router.push('/tribes/application-success');
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to send application.');
            }
        } catch (e) { alert('Error applying'); }
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

    const isCreator = tribe.creatorId === currentUserId;
    const isMember = isCreator || tribe.members.some(m => m.userId === currentUserId);
    const isAdmin = isCreator || tribe.members.some(m => m.userId === currentUserId && m.role === 'ADMIN');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8 pb-32">
            <div className="max-w-[1600px] mx-auto">
                {/* Header ... (same as before) */}
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
                    {/* Title and Action Button Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">TABLE details</h1>
                            <h2 className="text-3xl font-bold text-indigo-600">{tribe.name}</h2>
                            {tribe.topic && <p className="text-slate-500 font-bold uppercase tracking-wide text-sm mt-1">{tribe.topic}</p>}
                        </div>

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
                                    onClick={isPending ? undefined : handleApply}
                                    disabled={isPending}
                                    className={`px-6 py-3 font-bold rounded-full shadow-lg transition-all text-sm flex items-center gap-2 ${isPending
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                                        }`}
                                >
                                    {isPending ? (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Application Sent
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            {tribe.isPaid ? 'Apply to Join ($)' : 'Apply to Join'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {tribe.meetingTime && (
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-700 mb-8">
                            <span>📅</span> {tribe.meetingTime}
                        </div>
                    )}

                    {/* Description */}
                    {tribe.description && (
                        <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">About this Tribe</h3>
                            <p className="text-slate-600 leading-relaxed">{tribe.description}</p>
                        </div>
                    )}

                    {/* FULL TRIBE DETAILS (Read-Only for Everyone) */}
                    <div className="mb-12">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-600" />
                                    Tribe Configuration & Requirements
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Review the structure, schedule, and requirements before applying.
                                </p>
                            </div>
                            <div className="p-6">
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
                        </div>
                    </div>

                    {/* Members Grid ... (existing code) */}
                    <div className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        {/* ... existing members grid code ... */}
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
                            {tribe.members.map(member => (
                                <div
                                    key={member.id}
                                    className="flex flex-col items-center gap-3 group cursor-pointer w-24"
                                    onClick={() => router.push(`/profile/${member.userId}`)}
                                    title={`View ${member.name}'s profile`}
                                >
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
                                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border-2 border-white flex items-center gap-0.5">
                                            <span className="text-yellow-300">★</span> {(member as any).rankingScore?.toLocaleString()}
                                        </div>
                                    </div>
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
                            {Array.from({ length: Math.max(0, tribe.maxMembers - tribe.members.length) }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="flex flex-col items-center gap-3 w-24 opacity-60">
                                    <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                                        <Plus size={24} />
                                    </div>
                                    <div className="text-center w-full">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Open Spot</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ADMIN CONSOLE (Modified to remove Info tab since it's now public) */}
                    {isAdmin && (
                        <div className="mb-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    🛡️ Admin Console
                                </h3>
                                <div className="flex bg-slate-800 rounded-lg p-1">
                                    <button onClick={() => setShowEditModal(true)} className="px-4 py-1.5 rounded-md text-sm font-bold transition-all text-slate-400 hover:text-white flex items-center gap-2">
                                        <Edit3 size={14} /> Edit Settings
                                    </button>
                                    <div className="w-px bg-slate-700 mx-1"></div>
                                    {/* Removed Info Tab button as it's redundant now */}
                                    <button onClick={() => setAdminTab('sops')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'sops' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>SOPs</button>
                                    <button onClick={() => setAdminTab('members')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'members' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Roles</button>
                                    <button onClick={() => setAdminTab('apps')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${adminTab === 'apps' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                                        Apps {applications.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{applications.length}</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {/* INFO TAB REMOVED - Logic moved to public area */}

                                {/* TAB: SOPs */}
                                {adminTab === 'sops' && (
                                    <div>
                                        {/* ... existing SOPs code ... */}
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

                                {/* TAB: ROLES */}
                                {adminTab === 'members' && (
                                    /* ... existing members management code ... */
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
                                    /* ... existing apps code ... */
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

                {/* PAYMENT PRE-APPROVAL MODAL */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>

                            <div className="p-8 text-center bg-indigo-50 border-b border-indigo-100">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200">
                                    <CreditCard size={32} className="text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Paid Tribe Application</h3>
                                <p className="text-slate-600 text-sm">
                                    This is a premium tribe with a membership fee.
                                </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-white border-2 border-indigo-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">Subscription Fee</div>
                                        <div className="text-xs text-slate-500 uppercase font-bold">{tribe?.subscriptionFrequency || 'Monthly'}</div>
                                    </div>
                                    <div className="text-2xl font-black text-indigo-600">
                                        ${tribe?.subscriptionPrice}
                                    </div>
                                </div>

                                <div className="flex gap-3 bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
                                    <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                        You are applying to join. <strong>You will not be charged yet.</strong> If your application is approved by the tribe admin, you will be asked to set up payment to complete your membership.
                                    </p>
                                </div>

                                <button
                                    onClick={submitApplication}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={20} />
                                    Confirm & Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SOP SIGNATURE MODAL ... (existing) */}
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

                {/* EDIT TRIBE MODAL ... (existing) */}
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

                <SubscriptionLockedModal isOpen={showLockModal} onClose={() => router.push('/dashboard')} />

            </div>
        </div>
    );
}
