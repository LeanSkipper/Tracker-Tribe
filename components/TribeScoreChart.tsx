'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TribeScoreChart({ tribeId }: { tribeId: string }) {
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch(`/api/tribes/${tribeId}/history`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setData(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [tribeId]);

    if (loading) return <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />;

    if (data.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-xs">No tribe history yet</p>
            </div>
        );
    }

    return (
        <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="tribeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        hide
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                        itemStyle={{ color: '#818cf8' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [`${value.toLocaleString()}`, 'Total Score']}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#818cf8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#tribeGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
