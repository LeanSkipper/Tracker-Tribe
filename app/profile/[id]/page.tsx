'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Award, Zap, Star, Shield, TrendingUp, Briefcase, MapPin, Brain, Globe, Users, ArrowLeft } from 'lucide-react';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchPublicProfile(params.id as string);
        }
    }, [params.id]);

    const fetchPublicProfile = async (userId: string) => {
        try {
            const res = await fetch(`/api/profile/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-indigo-600 font-bold animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">User not found</h2>
                    <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold hover:underline">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const skills = profile.skills ? JSON.parse(profile.skills) : {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                    <div className="relative pt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-black text-4xl">
                                    {profile.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-black text-slate-900">{profile.name}</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <Award size={16} className="text-indigo-500" />
                                Level {profile.level} Mastermind
                            </p>
                            {profile.bio && (
                                <p className="text-slate-600 mt-2 max-w-xl">{profile.bio}</p>
                            )}
                        </div>
                        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Score</div>
                            <div className="text-3xl font-black text-indigo-600">{profile.rankingScore?.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Stats & Identity */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" /> Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="text-blue-600" size={20} />
                                        <span className="font-bold text-slate-700">Level</span>
                                    </div>
                                    <div className="text-2xl font-black text-blue-700">{profile.level}</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="text-purple-600" size={20} />
                                        <span className="font-bold text-slate-700">Grit</span>
                                    </div>
                                    <div className="text-2xl font-black text-purple-700">{profile.grit}%</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="text-green-600" size={20} />
                                        <span className="font-bold text-slate-700">XP</span>
                                    </div>
                                    <div className="text-2xl font-black text-green-700">{profile.experience || 0}</div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="text-yellow-600" size={20} />
                                        <span className="font-bold text-slate-700">Reputation</span>
                                    </div>
                                    <div className="text-2xl font-black text-yellow-700">{profile.reputationScore?.toFixed(1)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Identity & Professional */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <User className="text-indigo-600" /> Identity
                            </h2>

                            <div className="space-y-6">
                                {/* Bio/Context */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    {profile.country && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Globe size={18} className="text-slate-400" />
                                            <span>{profile.city ? `${profile.city}, ` : ''}{profile.country}</span>
                                        </div>
                                    )}
                                    {profile.professionalRole && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Briefcase size={18} className="text-slate-400" />
                                            <span className="capitalize">{profile.professionalRole} {profile.industry ? `in ${profile.industry}` : ''}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Styles */}
                                <div className="border-t border-slate-100 pt-4">
                                    <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Execution Style</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.actionSpeed && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{profile.actionSpeed} Paced</span>}
                                        {profile.planningStyle && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{profile.planningStyle} Planner</span>}
                                        {profile.followThroughLevel && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{profile.followThroughLevel} Follow-through</span>}
                                    </div>
                                </div>

                                {/* Skills */}
                                {Object.keys(skills).length > 0 && (
                                    <div className="border-t border-slate-100 pt-4">
                                        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Top Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(skills).map(([skill, val]) => (
                                                <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tribes */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Users className="text-indigo-600" /> Tribes
                            </h2>
                            {profile.memberships && profile.memberships.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.memberships.map((m: any) => (
                                        <div key={m.tribe.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                                            <h3 className="font-bold text-slate-800 mb-1">{m.tribe.name}</h3>
                                            {m.tribe.description && (
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{m.tribe.description}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    {m.tribe.members.map((tm: any, i: number) => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                            {tm.user.avatarUrl && <img src={tm.user.avatarUrl} className="w-full h-full object-cover" />}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                                    {Math.round(m.tribe.reliabilityRate)}% Rel
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">Not in any tribes yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
