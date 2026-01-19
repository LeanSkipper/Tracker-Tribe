import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type Tribe = {
    id: string;
    name: string;
    topic?: string | null;
    meetingTime?: string | null;
    meetingFrequency?: string | null;
    maxMembers: number;
    memberCount?: number;
    members?: any[];
    averageGrit: number;
    matchmakingCriteria?: string | null;
    minGrit: number;
    minLevel: number;
    minExperience: number;
    minReputation: number;
};

type UserStats = {
    grit: number;
    level: number;
    currentXP: number;
    reputationScore: number;
};

type EnhancedTribeCardProps = {
    tribe: Tribe;
    isMember: boolean;
    userStats: UserStats | null;
    index: number;
};

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

export default function EnhancedTribeCard({ tribe, isMember, userStats, index }: EnhancedTribeCardProps) {
    const router = useRouter();
    const memberCount = tribe.memberCount || (tribe.members ? tribe.members.length : 0);

    return (
        <motion.div
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
                            {memberCount}/{tribe.maxMembers}
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
}
