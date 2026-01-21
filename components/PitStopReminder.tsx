'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PitStopReminderProps {
    onOpenPitStop: () => void;
}

export default function PitStopReminder({ onOpenPitStop }: PitStopReminderProps) {
    const [lastPitStopDate, setLastPitStopDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'safe' | 'warning' | 'overdue'>('safe');
    const [daysSince, setDaysSince] = useState(0);

    useEffect(() => {
        fetch('/api/pit-stop')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Assuming data is sorted desc by date
                    const lastDate = new Date(data[0].date);
                    setLastPitStopDate(lastDate);

                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysSince(diffDays);

                    if (diffDays >= 7) {
                        setStatus('overdue');
                    } else if (diffDays === 6) {
                        setStatus('warning');
                    } else {
                        setStatus('safe');
                    }
                } else {
                    // No pit stops ever
                    setStatus('overdue');
                    setDaysSince(999); // Force overdue
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch pit stops', err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    if (status === 'safe') {
        const daysLeft = 7 - daysSince;
        return (
            <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">On Track</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Next Pit Stop in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'warning') {
        return (
            <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-pulse-slow">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <Clock size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-amber-800 uppercase tracking-wide">Due Tomorrow!</div>
                        <div className="text-[10px] text-amber-700 font-medium">Complete your Pit Stop to keep your streak.</div>
                    </div>
                </div>
                <button
                    onClick={onOpenPitStop}
                    className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-amber-600 transition-colors flex items-center gap-1"
                >
                    Do it <ArrowRight size={12} />
                </button>
            </div>
        );
    }

    // Overdue
    return (
        <div className="mb-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl p-3 shadow-md animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="bg-rose-100 p-2 rounded-full text-rose-600 mt-1">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-rose-800 uppercase tracking-wide flex items-center gap-1">
                            Overdue <span className="bg-rose-200 text-rose-800 px-1 rounded text-[9px]">-5 XP Penalty Active</span>
                        </div>
                        <div className="text-[10px] text-rose-700 font-medium mt-0.5 max-w-[200px]">
                            It's been {daysSince} days. Do your Pit Stop now to stop the XP bleed!
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={onOpenPitStop}
                className="mt-3 w-full bg-rose-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
            >
                <AlertOctagon size={14} /> Complete Pit Stop Now
            </button>
        </div>
    );
}
