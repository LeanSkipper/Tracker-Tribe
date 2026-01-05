'use client';

import React from 'react';
import MemberChair from './MemberChair';

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

type RoundTableProps = {
    members: Member[];
    maxSeats?: number;
    onInvite?: () => void;
};

export default function RoundTable({ members, maxSeats = 10, onInvite }: RoundTableProps) {
    const containerSize = 600;
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    const radius = 220; // Distance from center to seats

    // Calculate positions for all seats (filled and empty)
    const seats = Array.from({ length: maxSeats }, (_, index) => {
        const angle = (360 / maxSeats) * index - 90; // Start from top
        const angleRad = (angle * Math.PI) / 180;

        return {
            x: centerX + radius * Math.cos(angleRad),
            y: centerY + radius * Math.sin(angleRad),
            member: members[index]
        };
    });

    return (
        <div className="relative flex items-center justify-center">
            <svg
                width={containerSize}
                height={containerSize}
                className="absolute"
                style={{ zIndex: 0 }}
            >
                {/* Table surface */}
                <defs>
                    <radialGradient id="woodGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#8B4513" />
                        <stop offset="50%" stopColor="#A0522D" />
                        <stop offset="100%" stopColor="#654321" />
                    </radialGradient>
                </defs>

                <circle
                    cx={centerX}
                    cy={centerY}
                    r={180}
                    fill="url(#woodGradient)"
                    stroke="#654321"
                    strokeWidth="8"
                    filter="drop-shadow(0 10px 20px rgba(0,0,0,0.3))"
                />

                {/* Table shine effect */}
                <ellipse
                    cx={centerX}
                    cy={centerY - 40}
                    rx={140}
                    ry={60}
                    fill="rgba(255,255,255,0.1)"
                />
            </svg>

            {/* Member seats */}
            <div className="relative" style={{ width: containerSize, height: containerSize, zIndex: 10 }}>
                {seats.map((seat, index) => (
                    <MemberChair
                        key={index}
                        member={seat.member}
                        position={{ x: seat.x, y: seat.y }}
                        index={index}
                        onInvite={onInvite}
                    />
                ))}
            </div>
        </div>
    );
}
