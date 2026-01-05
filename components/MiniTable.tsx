'use client';

import React from 'react';

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
};

type MiniTableProps = {
    members: Member[];
    maxSeats: number;
};

export default function MiniTable({ members, maxSeats }: MiniTableProps) {
    const size = 80;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 28;

    // Calculate positions for seats
    const seats = Array.from({ length: maxSeats }, (_, index) => {
        const angle = (360 / maxSeats) * index - 90;
        const angleRad = (angle * Math.PI) / 180;

        return {
            x: centerX + radius * Math.cos(angleRad),
            y: centerY + radius * Math.sin(angleRad),
            member: members[index]
        };
    });

    return (
        <svg width={size} height={size} className="mx-auto">
            {/* Table circle */}
            <circle
                cx={centerX}
                cy={centerY}
                r={18}
                fill="#8B4513"
                stroke="#654321"
                strokeWidth="2"
            />

            {/* Member seats */}
            {seats.map((seat, index) => (
                <g key={index}>
                    {seat.member ? (
                        // Filled seat
                        <circle
                            cx={seat.x}
                            cy={seat.y}
                            r={5}
                            fill="#3B82F6"
                            stroke="#1E40AF"
                            strokeWidth="1"
                        />
                    ) : (
                        // Empty seat
                        <circle
                            cx={seat.x}
                            cy={seat.y}
                            r={4}
                            fill="none"
                            stroke="#D1D5DB"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    )}
                </g>
            ))}
        </svg>
    );
}
