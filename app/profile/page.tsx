"use client";

import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Target, Settings, ShieldCheck, Zap, Star, Trophy, Calendar, TrendingUp, Award, X, Info } from 'lucide-react';

// Calculate rank based on XP level and GRIT
const calculateRank = (experience: number, grit: number) => {
    // Determine XP Level first
    let level = 'Starter';
    if (experience >= 5000) level = 'Legend';
    else if (experience >= 1500) level = 'Master';
    else if (experience >= 500) level = 'Achiever';
    else if (experience >= 200) level = 'Explorer';
    else if (experience >= 100) level = 'Starter';
    else level = 'Scout'; // Below 100 XP

    // Determine Rank based on Level and GRIT
    if (level === 'Scout' || experience < 100) {
        return { name: 'Scout', icon: '🔰', color: 'gray' };
    } else if (level === 'Starter' || level === 'Explorer') {
        if (grit >= 50) {
            return { name: 'Ranger', icon: '🎯', color: 'green' };
        }
        return { name: 'Scout', icon: '🔰', color: 'gray' };
    } else if (level === 'Achiever') {
        if (grit >= 70) {
            return { name: 'Captain', icon: '⚔️', color: 'purple' };
        } else if (grit >= 60) {
            return { name: 'Guardian', icon: '🛡️', color: 'blue' };
        } else if (grit >= 50) {
            return { name: 'Ranger', icon: '🎯', color: 'green' };
        }
        return { name: 'Scout', icon: '🔰', color: 'gray' };
    } else if (level === 'Master' || level === 'Legend') {
        if (grit >= 80) {
            return { name: 'Commander', icon: '👑', color: 'gold' };
        } else if (grit >= 70) {
            return { name: 'Captain', icon: '⚔️', color: 'purple' };
        } else if (grit >= 60) {
            return { name: 'Guardian', icon: '🛡️', color: 'blue' };
        } else if (grit >= 50) {
            return { name: 'Ranger', icon: '🎯', color: 'green' };
        }
        return { name: 'Scout', icon: '🔰', color: 'gray' };
    }

    return { name: 'Scout', icon: '🔰', color: 'gray' };
};

// Get XP Level name
const getXPLevel = (experience: number) => {
    if (experience >= 5000) return 'Legend';
    if (experience >= 1500) return 'Master';
    if (experience >= 500) return 'Achiever';
    if (experience >= 200) return 'Explorer';
    if (experience >= 100) return 'Starter';
    return 'Scout';
};

// Info Modal Component
const InfoModal = ({ title, content, onClose }: { title: string; content: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-gradient-to-br from-[#1a1c24] to-[#0a0a0c] border border-white/20 rounded-3xl max-w-2xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} className="text-white/50" />
                </button>
            </div>
            <div className="text-white/80">
                {content}
            </div>
        </div>
    </div>
);

// Main Stat Card (Top 4)
const MainStatCard = ({ icon, label, value, sublabel, onClick, color }: any) => (
    <button
        onClick={onClick}
        className={`bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 p-6 rounded-3xl hover:border-${color}-500/50 hover:shadow-lg hover:shadow-${color}-500/20 transition-all cursor-pointer group text-center`}
    >
        <div className="flex flex-col items-center gap-2">
            {icon}
            <div className="text-xs font-black uppercase tracking-wider text-white/50">{label}</div>
            <div className="text-4xl font-black text-white">{value}</div>
            <div className="text-xs text-white/60">{sublabel}</div>
            <Info size={14} className={`text-white/30 group-hover:text-${color}-400 transition-colors mt-2`} />
        </div>
    </button>
);

export default function ProfilePage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/debug/seed')
            .then(() => fetch('/api/tribes'))
            .then(res => res.json())
            .then(data => {
                // Add null checks to prevent undefined errors
                const tiago = data?.[0]?.members?.find((m: any) => m.name === 'Tiago') || {
                    name: "Tiago",
                    email: "tiago@example.com",
                    level: 5,
                    experience: 1250,
                    totalReliability: 92,
                    grit: 65,
                    sessionsAttended: 8,
                    taskCompletionRate: 0.85,
                    mastermindAttendanceRate: 0.90,
                    tribeRitualsAttendanceRate: 0.75,
                };
                setUserData(tiago);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load user data:", err);
                // Set default data on error
                setUserData({
                    name: "Tiago",
                    email: "tiago@example.com",
                    level: 5,
                    experience: 1250,
                    totalReliability: 92,
                    grit: 65,
                    sessionsAttended: 8,
                    taskCompletionRate: 0.85,
                    mastermindAttendanceRate: 0.90,
                    tribeRitualsAttendanceRate: 0.75,
                });
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
            <div className="text-blue-500 animate-pulse text-xl font-black uppercase tracking-widest">Loading Profile...</div>
        </div>
    );

    const rank = calculateRank(userData.experience, userData.grit);
    const xpLevel = getXPLevel(userData.experience);
    const reliability = userData.totalReliability || 0;

    // Calculate GRIT as average of three rates
    const calculatedGrit = Math.round(
        ((userData.mastermindAttendanceRate || 0) * 100 +
            (userData.taskCompletionRate || 0) * 100 +
            (userData.tribeRitualsAttendanceRate || 0) * 100) / 3
    );

    // Modal Content
    const getModalContent = (type: string) => {
        switch (type) {
            case 'xp':
                return (
                    <div className="space-y-6">
                        <p className="text-lg">Experience (XP) determines your level and unlocks rank progression.</p>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-bold text-white mb-4">How to Earn XP:</h4>
                            <ul className="space-y-2 text-sm">
                                <li>• <strong>Complete Goals:</strong> 100 XP per goal</li>
                                <li>• <strong>Hit Weekly Targets:</strong> 20 XP per week</li>
                                <li>• <strong>Attend Sessions:</strong> 15 XP per session</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-white">Level Progression:</h4>
                            {[
                                { level: 'Scout', xp: '0-99', color: 'from-gray-500 to-gray-600', required: 0 },
                                { level: 'Starter', xp: '100-199', color: 'from-green-500 to-green-600', required: 100 },
                                { level: 'Explorer', xp: '200-499', color: 'from-blue-500 to-blue-600', required: 200 },
                                { level: 'Achiever', xp: '500-1499', color: 'from-purple-500 to-purple-600', required: 500 },
                                { level: 'Master', xp: '1500-4999', color: 'from-orange-500 to-red-500', required: 1500 },
                                { level: 'Legend', xp: '5000+', color: 'from-yellow-500 to-orange-500', required: 5000 },
                            ].map((lvl) => (
                                <div
                                    key={lvl.level}
                                    className={`flex items-center gap-4 p-3 rounded-xl ${xpLevel === lvl.level ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-white/5 border border-white/10'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${lvl.color} flex items-center justify-center font-black text-white text-xs`}>
                                        {lvl.level.slice(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold">{lvl.level}</div>
                                        <div className="text-xs text-white/50">{lvl.xp} XP</div>
                                    </div>
                                    {xpLevel === lvl.level && (
                                        <div className="text-xs bg-blue-500 px-2 py-1 rounded-full font-bold">YOU ARE HERE</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'grit':
                return (
                    <div className="space-y-6">
                        <p className="text-lg">GRIT measures your consistency and commitment across all activities.</p>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-bold text-white mb-4">How It's Calculated (Average):</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span>• <strong>Mastermind Attendance Rate:</strong></span>
                                    <span className="text-blue-400">{Math.round((userData.mastermindAttendanceRate || 0) * 100)}%</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• <strong>Task Completion Rate:</strong></span>
                                    <span className="text-green-400">{Math.round((userData.taskCompletionRate || 0) * 100)}%</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• <strong>Tribe Rituals Attendance Rate:</strong></span>
                                    <span className="text-purple-400">{Math.round((userData.tribeRitualsAttendanceRate || 0) * 100)}%</span>
                                </li>
                                <li className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                                    <span><strong>Average GRIT:</strong></span>
                                    <span className="text-yellow-400 font-black">{calculatedGrit}%</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-white">Your GRIT Level:</h4>
                            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 transition-all duration-500"
                                    style={{ width: `${calculatedGrit}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-yellow-400 shadow-lg"
                                    style={{ left: `${calculatedGrit}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'rank':
                return (
                    <div className="space-y-6">
                        <p className="text-lg">Your rank is determined by your XP Level and GRIT score.</p>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-bold text-white mb-4">Rank Progression:</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-2xl">🔰</span>
                                    <div>
                                        <strong>Scout:</strong> Entrance level (below 100 XP)
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <strong>Ranger:</strong> Explorer level with GRIT &gt; 50%
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-2xl">🛡️</span>
                                    <div>
                                        <strong>Guardian:</strong> Achiever+ with GRIT &gt; 60%
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-2xl">⚔️</span>
                                    <div>
                                        <strong>Captain:</strong> Achiever+ with GRIT &gt; 70%
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-2xl">👑</span>
                                    <div>
                                        <strong>Commander:</strong> Master/Legend with GRIT &gt; 80%
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border-2 border-blue-500/30">
                            <div className="text-center">
                                <div className="text-6xl mb-3">{rank.icon}</div>
                                <div className="text-2xl font-black text-white mb-2">{rank.name}</div>
                                <div className="text-sm text-white/60">Your Current Rank</div>
                            </div>
                        </div>
                    </div>
                );

            case 'reliability':
                return (
                    <div className="space-y-6">
                        <p className="text-lg">Reliability measures how consistently you hit your targets.</p>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="font-bold text-white mb-4">How It's Calculated:</h4>
                            <p className="text-sm mb-4">Average of your weekly target achievement across all active goals.</p>
                            <ul className="space-y-2 text-sm">
                                <li>• <strong>100%:</strong> Perfect - hit all targets</li>
                                <li>• <strong>80-99%:</strong> Excellent - very reliable</li>
                                <li>• <strong>60-79%:</strong> Good - mostly on track</li>
                                <li>• <strong>Below 60%:</strong> Needs improvement</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-white">Your Reliability:</h4>
                            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                                <div
                                    className={`h-full transition-all duration-500 ${reliability >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                                        reliability >= 60 ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                                            'bg-gradient-to-r from-orange-600 to-red-500'
                                        }`}
                                    style={{ width: `${reliability}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-green-400 shadow-lg"
                                    style={{ left: `${reliability}%` }}
                                />
                            </div>
                            <p className="text-center text-sm">
                                <strong className="text-green-400">{reliability}%</strong> Reliability
                                {reliability >= 80 && " - Excellent! 🌟"}
                                {reliability >= 60 && reliability < 80 && " - Good progress 👍"}
                                {reliability < 60 && " - Keep pushing 💪"}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1a1c24] to-[#0a0a0c] border border-white/10 p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end relative z-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[24px] bg-gradient-to-tr from-blue-500 to-indigo-600 p-1">
                                <div className="w-full h-full rounded-[20px] bg-[#0a0a0c] flex items-center justify-center">
                                    <UserIcon size={64} className="text-white/80" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-lg p-1.5 shadow-lg border-2 border-[#1a1c24]">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black tracking-tight">{userData.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/50 text-sm">
                                <span className="flex items-center gap-1.5 font-bold"><Mail size={16} /> {userData.email}</span>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mt-4 inline-block">
                                <p className="text-sm text-yellow-400 font-bold">
                                    💡 Complete your bio and set goals to level up faster!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <Settings size={20} />
                            </button>
                            <button className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-xl shadow-blue-600/20 text-xs uppercase tracking-widest">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main 4 Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MainStatCard
                        icon={<Star className="text-purple-400" size={32} />}
                        label="Experience"
                        value={userData.experience}
                        sublabel={xpLevel}
                        onClick={() => setActiveModal('xp')}
                        color="purple"
                    />
                    <MainStatCard
                        icon={<Zap className="text-yellow-400" size={32} />}
                        label="GRIT"
                        value={`${calculatedGrit}%`}
                        sublabel="Consistency Score"
                        onClick={() => setActiveModal('grit')}
                        color="yellow"
                    />
                    <MainStatCard
                        icon={<Trophy className="text-orange-400" size={32} />}
                        label="Rank"
                        value={rank.icon}
                        sublabel={rank.name}
                        onClick={() => setActiveModal('rank')}
                        color="orange"
                    />
                    <MainStatCard
                        icon={<Target className="text-green-400" size={32} />}
                        label="Reliability"
                        value={`${reliability}%`}
                        sublabel="Target Hit Rate"
                        onClick={() => setActiveModal('reliability')}
                        color="green"
                    />
                </div>

                {/* Scoreboard / Track Record */}
                <div className="bg-white/5 rounded-[40px] border border-white/10 p-8">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <TrendingUp size={24} className="text-blue-400" />
                        Performance Scoreboard
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                            <Calendar size={24} className="mx-auto mb-2 text-blue-400" />
                            <div className="text-3xl font-black text-white">{userData.sessionsAttended || 0}</div>
                            <div className="text-xs text-white/50 mt-1">Sessions Attended</div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                            <Award size={24} className="mx-auto mb-2 text-purple-400" />
                            <div className="text-3xl font-black text-white">{Math.round((userData.taskCompletionRate || 0) * 100)}%</div>
                            <div className="text-xs text-white/50 mt-1">Task Completion</div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                            <Users size={24} className="mx-auto mb-2 text-green-400" />
                            <div className="text-3xl font-black text-white">{Math.round((userData.mastermindAttendanceRate || 0) * 100)}%</div>
                            <div className="text-xs text-white/50 mt-1">Mastermind Rate</div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                            <ShieldCheck size={24} className="mx-auto mb-2 text-yellow-400" />
                            <div className="text-3xl font-black text-white">{Math.round((userData.tribeRitualsAttendanceRate || 0) * 100)}%</div>
                            <div className="text-xs text-white/50 mt-1">Rituals Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Modals */}
            {activeModal && (
                <InfoModal
                    title={
                        activeModal === 'xp' ? 'Experience & Levels' :
                            activeModal === 'grit' ? 'GRIT Score' :
                                activeModal === 'rank' ? 'Rank System' :
                                    activeModal === 'reliability' ? 'Reliability Score' : ''
                    }
                    content={getModalContent(activeModal)}
                    onClose={() => setActiveModal(null)}
                />
            )}
        </div>
    );
}

// Missing import
import { Users } from 'lucide-react';
