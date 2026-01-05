'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

export default function CreateTribePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [maxMembers, setMaxMembers] = useState(10);
    const [matchmakingCriteria, setMatchmakingCriteria] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/tribes/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    topic,
                    meetingTime,
                    maxMembers,
                    matchmakingCriteria
                })
            });

            if (res.ok) {
                const tribe = await res.json();
                router.push(`/tribes/${tribe.id}/session`);
            } else {
                alert('Failed to create tribe');
            }
        } catch (err) {
            console.error('Create tribe error:', err);
            alert('Failed to create tribe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-600 hover:text-indigo-600 font-bold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <Users className="text-indigo-600" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">Create New Tribe</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Tribe Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., LAPIS Angels, Seeds of Success"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Topic / Focus
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., SaaS Growth, Health & Wellness"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Table Meeting Time
                            </label>
                            <input
                                type="text"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                placeholder="e.g., Friday 10:00 AM"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">When does your tribe gather at the table?</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Max Members at Table
                            </label>
                            <input
                                type="number"
                                value={maxMembers}
                                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                                min={2}
                                max={10}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Maximum 10 seats around the table</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Matchmaking Criteria
                            </label>
                            <textarea
                                value={matchmakingCriteria}
                                onChange={(e) => setMatchmakingCriteria(e.target.value)}
                                placeholder="e.g., SaaS Focus, $5k+ MRR, Series A+"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Tribe'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
