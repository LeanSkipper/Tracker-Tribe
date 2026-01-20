'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Star, Info, Users, Target, TrendingUp, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Peer {
    id: string;
    name: string;
    bio: string;
    email?: string;
    avatarUrl: string;
    level: number;
    skills: string | null;
    totalReliability?: number;
    goalCount?: number;
    isFriend?: boolean;
    matchScore?: number;
}

export default function PeerMatchingPage() {
    const router = useRouter();
    const [peers, setPeers] = useState<Peer[]>([]);
    const [friends, setFriends] = useState<Peer[]>([]);

    interface RankedPeer extends Peer {
        rankingScore: number;
        grit: number;
        experience: number;
        reputationScore: number;
    }

    const [topRanked, setTopRanked] = useState<RankedPeer[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPeerIndex, setCurrentPeerIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'match' | 'browse'>('browse');

    useEffect(() => {
        fetchPeers();
    }, []);

    const fetchPeers = async () => {
        try {
            const res = await fetch('/api/peers');
            const data = await res.json();
            if (data.peers) {
                setPeers(data.peers);
            }
            if (data.friends) {
                setFriends(data.friends);
            }
            if (data.topRanked) {
                setTopRanked(data.topRanked);
            }
        } catch (error) {
            console.error('Failed to fetch peers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMatch = async (action: 'LIKE' | 'PASS') => {
        if (peers.length === 0) return;

        const targetUserId = peers[currentPeerIndex].id;

        // Optimistic UI update
        const nextIndex = currentPeerIndex + 1;
        setCurrentPeerIndex(nextIndex);

        try {
            await fetch('/api/peers/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUserId,
                    action
                })
            });
            if (action === 'LIKE') {
                fetchPeers(); // Refresh to update friends list
            }
        } catch (error) {
            console.error('Error posting match', error);
        }
    };

    const handleViewGPS = (peerId: string) => {
        router.push(`/peers/${peerId}/gps`);
    };

    const currentPeer = peers[currentPeerIndex];

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-400 font-bold uppercase tracking-widest">Loading peers...</div>;

    // Browse Mode
    if (viewMode === 'browse') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-black text-slate-900 mb-3 flex items-center gap-3">
                            <Users className="text-indigo-600" size={48} />
                            Browse Peers
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Connect with like-minded individuals and view their GPS goals
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setViewMode('browse')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200"
                        >
                            My Friends ({friends.length})
                        </button>
                        <button
                            onClick={() => setViewMode('match')}
                            className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold hover:bg-indigo-50"
                        >
                            Discover New Peers
                        </button>
                    </div>

                    {/* Leaderboard Section */}
                    {topRanked.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-yellow-500" /> Top 5 Leaderboard
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
                                        {/* Stats hidden in circle, shown in profile */}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Friends Grid */}
                    {friends.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-100 text-center">
                            <Users size={64} className="mx-auto mb-4 text-slate-300" />
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Friends Yet</h3>
                            <p className="text-slate-600 mb-6">
                                Discover and connect with peers to see their GPS views
                            </p>
                            <button
                                onClick={() => setViewMode('match')}
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                            >
                                Discover Peers
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {friends.map((peer, index) => (
                                <motion.div
                                    key={peer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
                                >
                                    {/* Avatar & Info */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200 shrink-0">
                                            {peer.avatarUrl ? (
                                                <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-2xl">
                                                    {peer.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 text-lg truncate">{peer.name}</h3>
                                            <p className="text-sm text-slate-500">Level {peer.level}</p>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {peer.bio && (
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{peer.bio}</p>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Level</div>
                                            <div className="font-bold text-slate-900">{peer.level}</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Goals</div>
                                            <div className="font-bold text-slate-900">{peer.goalCount || 0}</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-slate-500 mb-1">Reliability</div>
                                            <div className="font-bold text-slate-900">{Math.round(peer.totalReliability || 0)}%</div>
                                        </div>
                                    </div>

                                    {/* View GPS Button */}
                                    <button
                                        onClick={() => handleViewGPS(peer.id)}
                                        className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Target size={16} />
                                        View GPS
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Match Mode (Tinder-style)
    if (!currentPeer) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
                <div className="bg-slate-800 p-6 rounded-full shadow-lg">
                    <Star className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">No more profiles</h2>
                <p className="text-slate-500 max-w-md font-medium">You've seen everyone for now. Check back later for new peers!</p>
                <button
                    onClick={() => setViewMode('browse')}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
                >
                    View My Friends
                </button>
            </div>
        );
    }

    const skills = currentPeer.skills ? JSON.parse(currentPeer.skills) : {};

    return (
        <div className="max-w-md mx-auto py-8 px-4 h-full flex flex-col justify-center font-sans">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                    Discover Peers
                </h1>
                <button
                    onClick={() => setViewMode('browse')}
                    className="px-3 py-1 border border-indigo-500/30 text-indigo-600 bg-indigo-50 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-100"
                >
                    View Friends
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPeer.id}
                    initial={{ opacity: 0, x: 50, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -50, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    <div className="w-full bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl relative h-[600px] flex flex-col border border-slate-800">
                        <div className="h-[300px] bg-gradient-to-b from-slate-700 to-slate-900 relative">
                            {currentPeer.avatarUrl ? (
                                <img src={currentPeer.avatarUrl} alt={currentPeer.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                                    <span className="text-6xl font-black opacity-30">{currentPeer.name?.[0]}</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent p-6 pt-12">
                                <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{currentPeer.name}</h2>
                                <p className="text-emerald-400 font-bold uppercase text-xs tracking-widest">Level {currentPeer.level} Strategist</p>
                            </div>
                        </div>

                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            <div>
                                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">ABOUT</h3>
                                <p className="text-slate-200 leading-relaxed text-sm font-medium">
                                    {currentPeer.bio || "No bio available. A mysterious mastermind."}
                                </p>
                            </div>

                            {Object.keys(skills).length > 0 && (
                                <div>
                                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">TOP SKILLS</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(skills).map(([skill, level]) => (
                                            <span key={skill} className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="p-6 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-4">
                            <button
                                className="h-14 rounded-full border-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all font-bold text-lg flex items-center justify-center"
                                onClick={() => handleMatch('PASS')}
                            >
                                <X className="mr-2 h-6 w-6" /> Pass
                            </button>
                            <button
                                className="h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all font-bold text-lg border-0 flex items-center justify-center"
                                onClick={() => handleMatch('LIKE')}
                            >
                                <Heart className="mr-2 h-6 w-6 fill-current" /> Connect
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-xs font-medium flex items-center justify-center">
                    <Info className="inline w-3 h-3 mr-1 mb-0.5" />
                    You can only view detailed GPS of peers with equal or lower Level.
                </p>
                <button className="text-slate-400 text-sm mt-3 hover:text-emerald-500 font-bold underline decoration-slate-300/30 underline-offset-4" onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
