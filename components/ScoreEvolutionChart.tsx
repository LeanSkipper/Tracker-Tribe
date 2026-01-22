'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ScoreEvolutionChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                <p>Not enough data for chart yet. Stay active!</p>
            </div>
        );
    }

    // Only show last 30 data points if too many
    const chartData = data.slice(-30);

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
