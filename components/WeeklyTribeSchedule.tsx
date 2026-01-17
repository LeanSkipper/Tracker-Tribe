'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, ExternalLink, Clock } from 'lucide-react';

type Tribe = {
    id: string;
    name: string;
    topic?: string;
    meetingTime?: string;
    meetingDay?: string | null;
    meetingFrequency?: string | null;
    meetingTimeHour?: number | null;
    meetingTimeMinute?: number | null;
    maxMembers: number;
    memberCount: number;
    reliabilityRate?: number;
};

interface WeeklyTribeScheduleProps {
    tribes: Tribe[];
}

export default function WeeklyTribeSchedule({ tribes }: WeeklyTribeScheduleProps) {
    const router = useRouter();

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const getDayTribes = (dayIndex: number) => {
        return tribes.filter(tribe => {
            const dayName = fullDays[dayIndex];

            // Priority 1: Check explicit meetingDay field
            if (tribe.meetingDay) {
                return tribe.meetingDay.toLowerCase() === dayName.toLowerCase();
            }

            // Priority 2: Fallback to parsing meetingTime string
            // Example format: "Wednesday 4:00 PM"
            if (tribe.meetingTime) {
                return tribe.meetingTime.toLowerCase().includes(dayName.toLowerCase());
            }
            return false;
        });
    };

    const hasTribes = tribes.length > 0;

    const getCardStyle = (index: number) => {
        const styles = [
            'bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-900',
            'bg-orange-100 border-orange-200 hover:border-orange-300 text-orange-900',
            'bg-purple-100 border-purple-200 hover:border-purple-300 text-purple-900',
            'bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-900',
            'bg-rose-100 border-rose-200 hover:border-rose-300 text-rose-900',
        ];
        return styles[index % styles.length];
    };

    if (!hasTribes) {
        return (
            <div className="w-full mb-12 hidden md:block">
                <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    My Tribes
                </h2>
                <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center">
                    <p className="text-slate-500 font-medium">You haven&apos;t joined any tribes yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
                My Tribes
            </h2>

            <div className="rounded-2xl shadow-xl overflow-hidden border border-slate-200 bg-white">
                {/* Header Row */}
                <div className="grid grid-cols-7 bg-slate-800 text-white">
                    {days.map(day => (
                        <div key={day} className="py-4 text-center font-black text-sm tracking-wider border-r border-slate-700 last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Content Row */}
                <div className="grid grid-cols-7 min-h-[200px] divide-x divide-slate-100 bg-slate-50/50">
                    {days.map((_, index) => {
                        const dayTribes = getDayTribes(index);
                        return (
                            <div key={index} className="p-2 flex flex-col gap-2 relative group-cell">
                                {/* Empty state placeholder for visual grid structure */}
                                {dayTribes.length === 0 && (
                                    <div className="w-full h-full min-h-[100px]" />
                                )}

                                {dayTribes.map((tribe, tribeIdx) => (
                                    <button
                                        key={tribe.id}
                                        onClick={() => router.push(`/tribes/${tribe.id}`)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] relative group ${getCardStyle(tribeIdx)}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm leading-tight line-clamp-2">
                                                {tribe.name}
                                            </h4>
                                            {tribe.id && (
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/30 rounded-full p-1">
                                                    <ExternalLink size={12} />
                                                </div>
                                            )}
                                        </div>

                                        {tribe.topic && (
                                            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-2 line-clamp-1">
                                                {tribe.topic}
                                            </p>
                                        )}

                                        <div className="space-y-1.5 mt-auto">
                                            {tribe.meetingTime && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
                                                    <Clock size={12} />
                                                    <span className="truncate">{tribe.meetingTime}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 font-medium opacity-90">
                                                    <Users size={12} />
                                                    <span>{tribe.memberCount}/{tribe.maxMembers}</span>
                                                </div>
                                                {tribe.maxMembers - tribe.memberCount > 0 && (
                                                    <span className="text-[10px] font-bold bg-white/40 px-1.5 py-0.5 rounded-full">
                                                        {tribe.maxMembers - tribe.memberCount} spots
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
