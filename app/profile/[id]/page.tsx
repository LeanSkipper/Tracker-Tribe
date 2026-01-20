'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Award, Zap, Star, Shield, TrendingUp, Briefcase, MapPin, Brain, Globe, Users, ArrowLeft, MessageSquarePlus, Check } from 'lucide-react';

const REPUTATION_CRITERIA = [
    { id: 'reliability', label: 'Reliability', desc: 'Measures follow-through on commitments and consistency.' },
    { id: 'activePresence', label: 'Active Presence', desc: 'Evaluates focus and engagement levels during sessions.' },
    { id: 'constructiveCandor', label: 'Constructive Candor', desc: 'Ability to provide sharp, honest, and helpful challenges.' },
    { id: 'generosity', label: 'Generosity', desc: 'Frequency of sharing valuable resources, contacts, or knowledge.' },
    { id: 'energyCatalyst', label: 'Energy Catalyst', desc: 'Positive motivational impact on the group’s drive.' },
    { id: 'responsiveness', label: 'Responsiveness', desc: 'Efficiency in communication outside of live sessions.' },
    { id: 'coachability', label: 'Coachability', desc: 'Openness to receiving feedback and integrating it.' },
    { id: 'knowledgeTransparency', label: 'Knowledge Transparency', desc: 'Proactivity in sharing lessons learned, including failures.' },
    { id: 'emotionalRegulation', label: 'Emotional Regulation', desc: 'Maintaining focus and constructive attitude under pressure.' },
    { id: 'preparation', label: 'Preparation', desc: 'Showing up with data updated and mentally ready.' }
];

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

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

    const handleScoreChange = (id: string, value: number) => {
        setReviewScores(prev => ({ ...prev, [id]: value }));
    };

    const submitReview = async () => {
        if (Object.keys(reviewScores).length !== 10) {
            alert("Please rate all 10 criteria.");
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reputation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: profile.id,
                    scores: reviewScores,
                    comment: reviewComment
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Feedback submitted! You earned 10 XP.`);
                setShowReviewModal(false);
                // Optimistically update reputation if API returns it
                if (data.newReputation) {
                    setProfile((prev: any) => ({ ...prev, reputationScore: data.newReputation }));
                }
            } else {
                const err = await res.json();
                alert(err.error || "Failed to submit review.");
            }
        } catch (error) {
            alert("Error submitting review.");
        } finally {
            setSubmittingReview(false);
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
                        <div className="flex flex-col gap-2 items-end">
                            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Score</div>
                                <div className="text-3xl font-black text-indigo-600">{profile.rankingScore?.toLocaleString()}</div>
                            </div>
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm"
                            >
                                <MessageSquarePlus size={16} /> Give Feedback (+10XP)
                            </button>
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
                                    <div className="text-2xl font-black text-yellow-700">{profile.reputationScore?.toFixed(1) || '0.0'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Reputation Breakdown (Visual) */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Shield className="text-yellow-600" /> Reputation Scorecard
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    {REPUTATION_CRITERIA.map(c => {
                                        const score = profile.reputationBreakdown?.[c.id] || 0;
                                        return (
                                            <div key={c.id} className="flex items-center gap-4">
                                                <div className="w-1/3">
                                                    <div className="font-bold text-slate-700 text-sm">{c.label}</div>
                                                </div>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                                                        style={{ width: `${score * 10}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-8 font-bold text-slate-500 text-sm text-right">
                                                    {score.toFixed(1)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <p className="text-xs text-slate-400 italic mt-4 text-center">Based on community reviews.</p>
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

                    {/* REVIEW MODAL */}
                    {showReviewModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                            <Shield className="text-indigo-600" /> Reputation Feedback
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1">Rate {profile.name} to help them grow. Earn 10 XP!</p>
                                    </div>
                                    <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                                    <div className="space-y-6">
                                        {REPUTATION_CRITERIA.map(c => (
                                            <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <label className="font-bold text-slate-800">{c.label}</label>
                                                        <p className="text-xs text-slate-500 text-pretty max-w-md">{c.desc}</p>
                                                    </div>
                                                    <div className="text-xl font-black text-indigo-600 w-8 text-right">
                                                        {reviewScores[c.id] || '-'}
                                                    </div>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    step="1"
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                    value={reviewScores[c.id] || 0}
                                                    onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value))}
                                                />
                                                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1 px-1">
                                                    <span>Poor</span>
                                                    <span>Excellent</span>
                                                </div>
                                            </div>
                                        ))}

                                        <div>
                                            <label className="font-bold text-slate-800 mb-2 block">Optional Comment</label>
                                            <textarea
                                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                                placeholder="Share your experience working with them..."
                                                rows={2}
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl flex justify-end">
                                    <button
                                        onClick={submitReview}
                                        disabled={submittingReview}
                                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submittingReview ? 'Submitting...' : <><Check size={18} /> Submit Review</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
