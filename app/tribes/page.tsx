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
    meetingFrequency?: string | null;
    meetingTimeHour?: number | null;
    meetingTimeMinute?: number | null;
};

export default function BrowseTribesPage() {
    const router = useRouter();
    const [allTribes, setAllTribes] = useState<Tribe[]>([]);
    const [myTribes, setMyTribes] = useState<Tribe[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allRes, myRes] = await Promise.all([
                fetch('/api/tribes'),
                fetch('/api/tribes/my')
            ]);

            if (allRes.ok) {
                const data = await allRes.json();
                setAllTribes(data);
            }

            if (myRes.ok) {
                const myData = await myRes.json();
                setMyTribes(myData);
            }
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
                                                {tribe.topic && (
                                                    <p className={`text-sm font-bold ${isMember ? 'text-emerald-700' : 'text-indigo-600'}`}>{tribe.topic}</p>
                                                )}
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMember ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {isMember ? <CheckCircle size={20} /> : <Users size={20} />}
                                            </div>
                                        </div>

                                        {tribe.meetingTime && (
                                            <div className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                                                <span>📅</span> {tribe.meetingTime}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                            <Users size={16} />
                                            <span className="font-bold">
                                                {tribe.memberCount}/{tribe.maxMembers} Members
                                            </span>
                                            {!isMember && tribe.maxMembers - tribe.memberCount > 0 && (
                                                <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded-full">
                                                    {tribe.maxMembers - tribe.memberCount} spots left
                                                </span>
                                            )}
                                        </div>

                                        {tribe.matchmakingCriteria && (
                                            <div className={`rounded-xl p-3 mb-4 ${isMember ? 'bg-white/60' : 'bg-slate-50'}`}>
                                                <p className="text-xs text-slate-600 line-clamp-2">{tribe.matchmakingCriteria}</p>
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
