'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Badge = {
    id: string;
    name: string;
    iconName: string;
};

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
    role: 'ADMIN' | 'MODERATOR' | 'PLAYER';
    badges?: Badge[];
};

type MemberChairProps = {
    member?: Member;
    position: { x: number; y: number };
    index: number;
    onInvite?: () => void;
};

export default function MemberChair({ member, position, index, onInvite }: MemberChairProps) {
    const isEmpty = !member;

    // Role-based border colors
    const borderColor = member?.role === 'ADMIN' ? '#FFD700' :
        member?.role === 'MODERATOR' ? '#C0C0C0' :
            '#3B82F6';

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {isEmpty ? (
                // Empty seat
                <button
                    onClick={onInvite}
                    className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center group cursor-pointer"
                    title="Invite Member"
                >
                    <svg className="w-8 h-8 text-gray-300 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            ) : (
                // Member seat
                <div className="relative group">
                    <div
                        className="w-20 h-20 rounded-full overflow-hidden shadow-lg transition-transform group-hover:scale-110"
                        style={{ border: `3px solid ${borderColor}` }}
                    >
                        {member.avatarUrl ? (
                            <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-2xl font-black text-white">
                                    {member.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Badges overlay */}
                    {member.badges && member.badges.length > 0 && (
                        <div className="absolute -top-1 -right-1 flex gap-0.5">
                            {member.badges.slice(0, 3).map((badge, idx) => (
                                <div
                                    key={badge.id}
                                    className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-white"
                                    title={badge.name}
                                    style={{ zIndex: 10 - idx }}
                                >
                                    <span className="text-xs">{badge.iconName}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Name tooltip */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {member.name}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
