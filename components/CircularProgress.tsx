'use client';

import React from 'react';

type CircularProgressProps = {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
};

export default function CircularProgress({ value, size = 120, strokeWidth = 8 }: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    // Color based on value
    const getColor = () => {
        if (value >= 76) return '#10B981'; // Green
        if (value >= 51) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{Math.round(value)}%</span>
            </div>
        </div>
    );
}
