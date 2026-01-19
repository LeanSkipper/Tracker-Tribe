'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TribeCreationForm from '@/components/TribeCreationForm';

type Tribe = {
    id: string;
    name: string;
    topic?: string;
    meetingTime?: string;
    maxMembers: number;
    memberCount: number;
    matchmakingCriteria?: string;
    // Extended fields for schedule
    // Extended fields
    minGrit: number;
    minLevel: number;
    minExperience: number;
    minReputation: number;
    averageGrit: number;
    meetingFrequency?: string | null;
    meetingTimeHour?: number | null;
    meetingTimeMinute?: number | null;
};

type UserStats = {
    grit: number;
    level: number;
    currentXP: number; // This maps to minExperience requirement? Or minExperience maps to 'experience' field? 
    // Schema says "minExperience" in Tribe, and User has "experience" (deprecated) and "currentXP".
    // I should probably check "level" mainly. But if "minExperience" is used, I'll map it to currentXP for now or level*1000 + currentXP.
    // Let's assume minExperience refers to XP.
    reputationScore: number;
};

export default function BrowseTribesPage() {
    const router = useRouter();
    const [allTribes, setAllTribes] = useState<Tribe[]>([]);
    const [myTribes, setMyTribes] = useState<Tribe[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

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

    const filteredTribes = allTribes.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.topic?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to render stat match
    const StatMatch = ({ label, required, userValue, unit = '' }: { label: string, required: number, userValue: number, unit?: string }) => {
        const isMatch = userValue >= required;
        // If required is 0, arguably everyone matches, or we don't show it?
        // User asked to "put in evidence the user stats related to required stats".
        // If required is 0, let's show it as "Open" or gray.
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Browse Tribes</h1>
                        <p className="text-slate-600">Find and join mastermind tables that match your goals</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        Create Table
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tribes by name or topic..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Tribes Grid */}
                {filteredTribes.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100 text-center">
                        <Users size={64} className="mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Tribes Found</h3>
                        <p className="text-slate-600 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Be the first to create a tribe!'}
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                        >
                            Create Tribe
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTribes.map((tribe, index) => {
                            const isMember = myTribes.some(mt => mt.id === tribe.id);

                            return (
                                <motion.div
                                    key={tribe.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`
                                        rounded-3xl p-6 shadow-lg border transition-all flex flex-col h-full
                                        ${isMember
                                            ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100 hover:shadow-emerald-200 hover:border-emerald-300'
                                            : 'bg-white border-slate-100 hover:shadow-xl hover:border-indigo-200'
                                        }
                                    `}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 pr-2">
                                                <h3 className={`text-xl font-black mb-1 leading-tight ${isMember ? 'text-emerald-900' : 'text-slate-900'}`}>{tribe.name}</h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {tribe.topic && (
                                                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isMember ? 'bg-emerald-200 text-emerald-800' : 'bg-indigo-100 text-indigo-700'}`}>
                                                            {tribe.topic}
                                                        </span>
                                                    )}
                                                    {tribe.meetingFrequency && (
                                                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
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
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                <span className="text-xs text-slate-400 font-bold uppercase block">Members</span>
                                                <div className="flex items-center gap-1 text-slate-700 font-bold">
                                                    <Users size={14} />
                                                    {tribe.memberCount}/{tribe.maxMembers}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                <span className="text-xs text-slate-400 font-bold uppercase block">Avg Grit</span>
                                                <div className="flex items-center gap-1 text-slate-700 font-bold">
                                                    <span>🔥</span>
                                                    {tribe.averageGrit}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requirements Match Block */}
                                        {userStats && (
                                            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Entry Requirements</span>
                                                    {isMember && <span className="text-xs text-emerald-600 font-bold">Joined</span>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                                    <StatMatch label="Level" required={tribe.minLevel} userValue={userStats.level} />
                                                    <StatMatch label="Grit" required={tribe.minGrit} userValue={userStats.grit} unit="%" />
                                                    <StatMatch label="Rep" required={tribe.minReputation} userValue={userStats.reputationScore} />
                                                    {/* Using currentXP for Experience comparison roughly */}
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
        </div>
    );
}
