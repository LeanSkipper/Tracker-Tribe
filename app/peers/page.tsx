'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { X, Heart, Star, Info, Users, Target, TrendingUp, UserPlus, Filter, Search, ArrowRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Peer {
    id: string;
    name: string;
    bio: string | null;
    email?: string;
    avatarUrl: string | null;
    level: number;
    skills: string | null;
    totalReliability?: number;
    professionalRole?: string;
    industry?: string;
    country?: string;
    city?: string;
}

interface RankedPeer extends Peer {
    rankingScore: number;
    grit: number;
    experience: number;
    reputationScore: number;
}

export default function PeerMatchingPage() {
    const router = useRouter();
    const [peers, setPeers] = useState<Peer[]>([]);
    const [friends, setFriends] = useState<Peer[]>([]);
    const [topRanked, setTopRanked] = useState<RankedPeer[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');
    const [location, setLocation] = useState('');

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'browse' | 'friends'>('browse'); // 'browse' (Discovery) or 'friends' (My Connections)

    // Connect state (mock/local for now)
    const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchPeers();
    }, [search, role, industry, location]);

    const fetchPeers = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (role) params.append('role', role);
            if (industry) params.append('industry', industry);
            if (location) params.append('location', location);

            const res = await fetch(`/api/peers?${params.toString()}`);
            const data = await res.json();

            if (data.peers) setPeers(data.peers);
            if (data.friends) setFriends(data.friends); // Assuming API returns friends too, or we can fetch separately
            if (data.topRanked) setTopRanked(data.topRanked);

        } catch (error) {
            console.error('Failed to fetch peers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (peerId: string) => {
        setConnectedPeers(prev => new Set(prev).add(peerId));
        // In a real app, this would send a POST to /api/connect or /api/match
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Loading peers...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-2">
                            <Users className="text-indigo-600" /> Community
                        </h1>
                        <p className="text-slate-500">Find your tribe and compete for glory</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => setViewMode('browse')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'browse' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            Browse Peers
                        </button>
                        <button
                            onClick={() => setViewMode('friends')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'friends' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            My Friends
                        </button>
                    </div>
                </div>

                {viewMode === 'browse' ? (
                    <>
                        {/* Leaderboard Section */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Trophy className="text-yellow-500" /> Top 5 Leaderboard
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {topRanked.map((params, index) => (
                                    <div key={params.id} onClick={() => router.push(`/profile/${params.id}`)} className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex flex-col items-center relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                                            #{index + 1}
                                        </div>
                                        <div className="w-16 h-16 rounded-full border-2 border-indigo-100 overflow-hidden mb-3 relative z-10">
                                            {params.avatarUrl ? (
                                                <img src={params.avatarUrl} alt={params.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
                                                    {params.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm text-center truncate w-full mb-1">{params.name}</h3>
                                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
                                            {params.rankingScore?.toLocaleString()} pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Filter size={18} className="text-indigo-600" /> Filter Peers
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search name or bio..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-300"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Role (e.g. Founder)"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Industry (e.g. Tech)"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Location (Country/City)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-300"
                                />
                            </div>
                        </div>

                        {/* Peers Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {peers.map((peer) => (
                                !connectedPeers.has(peer.id) && (
                                    <div key={peer.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all flex flex-col h-full group">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div onClick={() => router.push(`/profile/${peer.id}`)} className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent group-hover:border-indigo-100">
                                                {peer.avatarUrl ? (
                                                    <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                                        {peer.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 onClick={() => router.push(`/profile/${peer.id}`)} className="font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer">{peer.name}</h3>
                                                {peer.professionalRole && (
                                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide truncate mt-0.5">
                                                        {peer.professionalRole}
                                                    </p>
                                                )}
                                                {peer.industry && (
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                        {peer.industry}
                                                    </p>
                                                )}
                                                {peer.country && (
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">
                                                        {peer.city ? `${peer.city}, ` : ''}{peer.country}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {peer.bio && (
                                            <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                                                {peer.bio}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                                Lvl {peer.level}
                                            </div>
                                            <button
                                                onClick={() => handleConnect(peer.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm shadow-indigo-200"
                                            >
                                                <UserPlus size={14} /> Connect
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {peers.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">No peers found matching your filters.</p>
                                <button onClick={() => { setSearch(''); setRole(''); setIndustry(''); setLocation(''); }} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // Friends List (Reuse simple grid or keep placeholder)
                    <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100 text-center">
                        <Users size={64} className="mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">My Friends</h3>
                        <p className="text-slate-600 mb-6">Your connected peers will appear here.</p>
                        <button
                            onClick={() => setViewMode('browse')}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                        >
                            Find Peers
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
