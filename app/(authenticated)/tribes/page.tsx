'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Search, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TribeCreationForm from '@/components/TribeCreationForm';
import SubscriptionLockedModal from '@/components/SubscriptionLockedModal';

type Tribe = {
    id: string;
    // ... existing fields
    name: string;
    topic?: string;
    meetingTime?: string;
    maxMembers: number;
    memberCount: number;
    matchmakingCriteria?: string;
    // Extended fields
    minGrit: number;
    minLevel: number;
    minExperience: number;
    minReputation: number;
    averageGrit: number;
    averageRankingScore?: number;
    totalRankingScore?: number;
    meetingFrequency?: string | null;
    meetingTimeHour?: number | null;
    meetingTimeMinute?: number | null;
};

type UserStats = {
    grit: number;
    level: number;
    currentXP: number;
    reputationScore: number;
    // Subscription info
    subscriptionStatus?: string;
    userProfile?: string; // 'STARTER' | 'CREATOR' (Creator)
};

export default function BrowseTribesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrowseTribesContent />
        </Suspense>
    );
}

function BrowseTribesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [allTribes, setAllTribes] = useState<Tribe[]>([]);
    const [myTribes, setMyTribes] = useState<Tribe[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allRes, myRes, profileRes] = await Promise.all([
                fetch('/api/tribes'),
                fetch('/api/tribes/my'),
                fetch('/api/profile')
            ]);

            if (allRes.ok) setAllTribes(await allRes.json());
            if (myRes.ok) setMyTribes(await myRes.json());
            if (profileRes.ok) setUserStats(await profileRes.json());

        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (userStats && searchParams.get('action') === 'new-tribe') {
            handleCreateClick();
            // Clean up the URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('action');
            window.history.replaceState(null, '', `/tribes?${newParams.toString()}`);
        }
    }, [searchParams, userStats]);

    const [filterQualified, setFilterQualified] = useState(false);
    const [filterOpenSpots, setFilterOpenSpots] = useState(false);
    const [isMobileFabOpen, setIsMobileFabOpen] = useState(false);

    const handleCreateClick = () => {
        // Check if user is a creator
        if (userStats?.userProfile === 'CREATOR') {
            setShowCreateModal(true);
        } else {
            setShowUpgradeModal(true);
        }
    };

    // ... existing helpers ...
    const isQualified = (tribe: Tribe) => {
        if (!userStats) return true;
        return (
            (userStats.level >= tribe.minLevel) &&
            (userStats.grit >= tribe.minGrit) &&
            (userStats.reputationScore >= tribe.minReputation)
        );
    };

    const hasOpenSpots = (tribe: Tribe) => {
        return tribe.maxMembers > tribe.memberCount;
    };

    const filteredTribes = allTribes.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.topic?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesQualified = !filterQualified || isQualified(t);
        const matchesOpenSpots = !filterOpenSpots || hasOpenSpots(t);

        return matchesSearch && matchesQualified && matchesOpenSpots;
    });

    // Get top 5 tribes by total ranking score
    const topTribes = [...allTribes]
        .filter(t => t.totalRankingScore && t.totalRankingScore > 0)
        .sort((a, b) => (b.totalRankingScore || 0) - (a.totalRankingScore || 0))
        .slice(0, 5);

    // Helper to render stat match
    const StatMatch = ({ label, required, userValue, unit = '' }: { label: string, required: number, userValue: number, unit?: string }) => {
        const isMatch = userValue >= required;
        if (required === 0) return null;

        return (
            <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase font-bold">{label}</span>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                        {userValue}{unit} / {required}{unit}
                    </span>
                    {isMatch ? <CheckCircle size={14} className="text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-red-400" />}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-indigo-600 font-bold">Loading tribes...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8 pb-32 md:pb-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Browse Tribes</h1>
                        <p className="text-slate-600 text-sm md:text-base">Find and join mastermind tables that match your goals</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="!hidden lg:!flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        Create Table
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="mb-6 md:mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
                        />
                    </div>
                    {/* Filters - Scrollable on mobile if needed or just stacked */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button
                            onClick={() => setFilterQualified(!filterQualified)}
                            className={`px-4 py-3 md:py-4 rounded-xl font-bold text-sm transition-all border-2 flex-shrink-0 flex items-center gap-2 ${filterQualified
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <CheckCircle size={16} />
                            Only Qualified
                        </button>
                        <button
                            onClick={() => setFilterOpenSpots(!filterOpenSpots)}
                            className={`px-4 py-3 md:py-4 rounded-xl font-bold text-sm transition-all border-2 flex-shrink-0 flex items-center gap-2 ${filterOpenSpots
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <Users size={16} />
                            Open Spots
                        </button>
                    </div>
                </div>

                {/* Top Tribes Leaderboard - Omitted for brevity in edit, assuming it stays same if not touched */}
                {topTribes.length > 0 && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-lg border-2 border-yellow-200 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-4xl">🏆</span>
                            <h2 className="text-3xl font-black text-slate-900">Top Tribes</h2>
                        </div>
                        <div className="space-y-3">
                            {topTribes.map((tribe, index) => (
                                <motion.div
                                    key={tribe.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => router.push(`/tribes/${tribe.id}`)}
                                    className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-yellow-400"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            index === 1 ? 'bg-slate-300 text-slate-700' :
                                                index === 2 ? 'bg-orange-300 text-orange-900' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-black text-slate-900 truncate">{tribe.name}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-sm text-slate-600 flex items-center gap-1">
                                                    <Users size={14} />
                                                    {tribe.memberCount} members
                                                </span>
                                                <span className="text-sm text-slate-600 flex items-center gap-1">
                                                    <span className="text-yellow-500">★</span>
                                                    Avg: {tribe.averageRankingScore?.toLocaleString() || '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 font-bold uppercase">Total Score</div>
                                            <div className="text-2xl font-black text-yellow-600">
                                                {tribe.totalRankingScore?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tribes Grid */}
                {filteredTribes.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-slate-100 text-center">
                        <Users size={64} className="mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Tribes Found</h3>
                        <p className="text-slate-600 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Be the first to create a tribe!'}
                        </p>
                        <button
                            onClick={handleCreateClick}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                        >
                            Create Tribe
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredTribes.map((tribe, index) => {
                            const isMember = myTribes.some(mt => mt.id === tribe.id);

                            return (
                                <motion.div
                                    key={tribe.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`
                                        rounded-3xl p-5 md:p-6 shadow-lg border transition-all flex flex-col h-full
                                        ${isMember
                                            ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100'
                                            : 'bg-white border-slate-100'
                                        }
                                    `}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 pr-2">
                                                <h3 className={`text-lg md:text-xl font-black mb-1 leading-tight ${isMember ? 'text-emerald-900' : 'text-slate-900'}`}>{tribe.name}</h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {tribe.topic && (
                                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isMember ? 'bg-emerald-200 text-emerald-800' : 'bg-indigo-100 text-indigo-700'}`}>
                                                            {tribe.topic}
                                                        </span>
                                                    )}
                                                    {tribe.meetingFrequency && (
                                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                            {tribe.meetingFrequency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMember ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {isMember ? <CheckCircle size={20} /> : <Users size={20} />}
                                            </div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Members</span>
                                                <div className="flex items-center gap-1 text-slate-700 font-bold text-sm">
                                                    <Users size={14} />
                                                    {tribe.memberCount}/{tribe.maxMembers}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Score</span>
                                                <div className="flex items-center gap-1 text-slate-700 font-bold text-sm">
                                                    <span className="text-yellow-500">★</span>
                                                    {tribe.averageRankingScore ? tribe.averageRankingScore.toLocaleString() : '—'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requirements Match Block */}
                                        {userStats && (
                                            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Entry Requirements</span>
                                                    {isMember && <span className="text-[10px] text-emerald-600 font-bold">Joined</span>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                                    <StatMatch label="Level" required={tribe.minLevel} userValue={userStats.level} />
                                                    <StatMatch label="Grit" required={tribe.minGrit} userValue={userStats.grit} unit="%" />
                                                    <StatMatch label="Rep" required={tribe.minReputation} userValue={userStats.reputationScore} />
                                                    <StatMatch label="XP" required={tribe.minExperience} userValue={userStats.currentXP} />
                                                </div>
                                            </div>
                                        )}

                                        {tribe.meetingTime && (
                                            <div className="text-xs text-slate-500 mb-4 flex items-center gap-1 ml-1">
                                                <span>📅</span> {tribe.meetingTime}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => router.push(`/tribes/${tribe.id}`)}
                                        className={`
                                            w-full py-3 font-bold rounded-xl transition-colors mt-auto border-2
                                            ${isMember
                                                ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                            }
                                        `}
                                    >
                                        {isMember ? 'Enter Tribe' : 'View Details'}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>



            {/* Create Tribe Modal */}
            {showCreateModal && (
                <TribeCreationForm
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchData();
                    }}
                />
            )}

            <SubscriptionLockedModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

            {/* Safe Area Spacer for Bottom Nav if present */}
            <div className="h-12 md:hidden"></div>
        </div>
    );
}
