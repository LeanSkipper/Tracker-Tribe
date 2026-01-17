'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableCard from '@/components/TableCard';
import { Users, Network, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import TribeCreationForm from '@/components/TribeCreationForm';

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
};

type Tribe = {
    id: string;
    name: string;
    reliabilityRate: number;
    maxMembers: number;
    members: Member[];
};

export default function DashboardPage() {
    const router = useRouter();
    const [tribes, setTribes] = useState<Tribe[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const data = await res.json();
                setTribes(data.tribes || []);
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-indigo-600 font-bold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-5xl font-black text-slate-900">Mastermind</h1>

                    <div className="flex items-center gap-8">
                        {/* New Tribe */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-all shadow-sm">
                                <Plus size={28} className="text-slate-600 group-hover:text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">New Tribe</span>
                        </button>

                        {/* Browse Tribes */}
                        <button
                            onClick={() => router.push('/tribes')}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-all shadow-sm">
                                <Network size={28} className="text-slate-600 group-hover:text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">Browse Tribes</span>
                        </button>

                        {/* Browse Peers */}
                        <button
                            onClick={() => router.push('/peers/coming-soon')}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-all shadow-sm">
                                <Users size={28} className="text-slate-600 group-hover:text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">Browse Peers</span>
                        </button>
                    </div>
                </div>

                {/* My Tribe Section */}
                {tribes.length > 0 && (
                    <div className="mb-12">
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Users className="text-indigo-600" />
                                My Tribe
                            </h2>

                            <div className="flex items-center gap-6 flex-wrap">
                                {tribes.flatMap(t => t.members).slice(0, 8).map((member, idx) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200">
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-xl">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{member.name.split(' ')[0]}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* My Tables (Meeting Places) */}
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">My Tables</h2>
                    <p className="text-slate-600 mb-6">Your tribe meeting places</p>

                    {tribes.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100 text-center">
                            <Users size={64} className="mx-auto mb-4 text-slate-300" />
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Tribes Yet</h3>
                            <p className="text-slate-600 mb-6">Create your first mastermind tribe or browse existing ones to join</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                                >
                                    Create Tribe
                                </button>
                                <button
                                    onClick={() => router.push('/tribes')}
                                    className="px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50"
                                >
                                    Browse Tribes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tribes.map((tribe, index) => (
                                <TableCard
                                    key={tribe.id}
                                    id={tribe.id}
                                    name={tribe.name}
                                    reliabilityRate={tribe.reliabilityRate}
                                    members={tribe.members}
                                    maxSeats={tribe.maxMembers}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Tribe Modal */}
            {showCreateModal && (
                <TribeCreationForm
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchDashboardData();
                    }}
                />
            )}
        </div>
    );
}
