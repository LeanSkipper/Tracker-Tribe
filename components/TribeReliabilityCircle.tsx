'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- HATS SVG ICONS ---
// Visual model colors:
// Admin: Green (#22c55e)
// Moderator: Orange (#ea580c)
// Time Keeper: Black (#0f172a)
// Specific Role: Grey (#94a3b8)
// Special Guest: Purple (#7c3aed)

const HatIcon = ({ color, className }: { color: string, className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill={color} style={{ filter: 'drop-shadow(0px 4px 3px rgba(0,0,0,0.3))' }}>
        {/* Top Hat Style - Classic Cylinder */}
        <path d="M20 75 L80 75 L80 65 L70 65 L70 30 C70 15 62 5 50 5 C38 5 30 15 30 30 L30 65 L20 65 Z" />
        {/* Brim */}
        <path d="M15 75 L85 75 C88 75 90 77 90 80 C90 83 88 85 85 85 L15 85 C12 85 10 83 10 80 C10 77 12 75 15 75 Z" />
        {/* Band */}
        <rect x="30" y="60" width="40" height="8" fill="rgba(255,255,255,0.2)" />
    </svg>
);

const AdminHat = ({ className }: { className?: string }) => <HatIcon color="#22c55e" className={className} />; // Green
const ModeratorHat = ({ className }: { className?: string }) => <HatIcon color="#f97316" className={className} />; // Orange
const TimeKeeperHat = ({ className }: { className?: string }) => <HatIcon color="#0f172a" className={className} />; // Black
const SpecialGuestHat = ({ className }: { className?: string }) => <HatIcon color="#8b5cf6" className={className} />; // Purple
const CustomHat = ({ className }: { className?: string }) => <HatIcon color="#94a3b8" className={className} />; // Grey/Silver

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    customTitle?: string;
    reliability: number;
    badges: any[];
};

type TribeReliabilityCircleProps = {
    members: Member[];
    overallReliability: number;
};

export default function TribeReliabilityCircle({ members, overallReliability }: TribeReliabilityCircleProps) {

    const getHat = (role: string, customTitle?: string) => {
        // If it's a specific role (custom title set and role is likely PLAYER or CUSTOM), show Grey hat
        // Or if the user explicitly selected a role that maps to a specific hat

        // Logic: 
        // Admin -> Green
        // Moderator -> Orange
        // Time Keeper -> Black
        // Special Guest -> Purple
        // Player (default) -> No hat usually, unless customTitle is set, then Grey?
        // Let's assume if customTitle is present and role is PLAYER, use CustomHat (Grey).

        if (role === 'ADMIN') return <AdminHat className="w-20 h-20" />;
        if (role === 'MODERATOR') return <ModeratorHat className="w-18 h-18" />;
        if (role === 'TIME_KEEPER') return <TimeKeeperHat className="w-18 h-18" />;
        if (role === 'SPECIAL_GUEST') return <SpecialGuestHat className="w-20 h-20" />;

        if (customTitle && customTitle.trim().length > 0) return <CustomHat className="w-18 h-18" />;

        return null; // Regular Player with no specific role
    };

    const getRoleTitle = (role: string, customTitle?: string) => {
        if (customTitle && customTitle.trim().length > 0) return customTitle;
        if (role === 'PLAYER') return 'Player'; // Or empty?
        return role.replace('_', ' ');
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 mb-8 overflow-hidden relative min-h-[600px] flex items-center justify-center">

            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent opacity-50" />

            {/* CENTRAL BUBBLE: Tribe Reliability */}
            <div className="relative z-10 w-64 h-64 rounded-full bg-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.05)] border-4 border-white flex flex-col items-center justify-center text-center p-4">
                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-50 to-white opacity-80" />

                <div className="relative z-20">
                    <h2 className="text-3xl font-black text-slate-800 leading-none mb-1">Tribe</h2>
                    <h2 className="text-2xl font-black text-slate-800 leading-none mb-2 underline decoration-indigo-300 underline-offset-4">reliability</h2>

                    <div className="my-3">
                        <span className="text-5xl font-black text-indigo-600 drop-shadow-sm">{Math.round(overallReliability)}%</span>
                    </div>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">(members average %)</p>
                </div>
            </div>

            {/* MEMBERS ORBIT */}
            <div className="absolute inset-0 pointer-events-none">
                {members.map((member, index) => {
                    const total = members.length;
                    const angleStep = 360 / total;
                    const angleDeg = (angleStep * index) - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const radius = 38; // Percentage from center

                    const x = 50 + radius * Math.cos(angleRad);
                    const y = 50 + radius * Math.sin(angleRad);

                    return (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                            className="absolute flex flex-col items-center justify-center w-40 pointer-events-auto"
                            style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 20
                            }}
                        >
                            {/* HAT - Positioned on top of the bubble */}
                            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-40 filter drop-shadow-xl hover:scale-110 transition-transform cursor-help" title={getRoleTitle(member.role, member.customTitle)}>
                                {getHat(member.role, member.customTitle)}
                            </div>

                            {/* MEMBER BUBBLE */}
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-slate-200/80 backdrop-blur-md shadow-lg border-4 border-white flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl transition-all">

                                    {/* Member Name */}
                                    <div className="absolute top-5 w-full text-center px-1 z-20">
                                        <div className="text-sm font-bold text-slate-800 truncate">{member.name.split(' ')[0]}</div>
                                        {/* Optional stats or avatar background? For now keeping it clean as per "Bubble" model text based */}
                                    </div>

                                    {/* Reliability % */}
                                    <div className="mt-4 flex flex-col items-center z-20">
                                        <div className="text-[9px] font-bold text-slate-500 uppercase">Reliability</div>
                                        <div className={`text-2xl font-black ${member.reliability >= 80 ? 'text-green-600' :
                                            member.reliability >= 50 ? 'text-amber-600' : 'text-rose-500'
                                            }`}>
                                            {member.reliability}%
                                        </div>
                                    </div>

                                    {/* Background Avatar Fade (Optional aesthetics) */}
                                    {member.avatarUrl && (
                                        <img src={member.avatarUrl} className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:opacity-20 transition-opacity" alt="" />
                                    )}
                                </div>
                            </div>

                            {/* Role Label below bubble if needed, but hat implies it. 
                                Let's add specific role text if custom. 
                            */}
                            {(member.customTitle || member.role !== 'PLAYER') && (
                                <div className="mt-2 text-center bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 max-w-full truncate">
                                    {getRoleTitle(member.role, member.customTitle)}
                                </div>
                            )}

                        </motion.div>
                    );
                })}
            </div>

        </div>
    );
}
