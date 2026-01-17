'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, ExternalLink } from 'lucide-react';

type Tribe = {
    id: string;
    name: string;
    topic?: string;
    meetingTime?: string;
    meetingFrequency?: string | null;
    meetingTimeHour?: number | null;
    meetingTimeMinute?: number | null;
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
            // Priority 1: Check structured frequency and time (if implemented properly in future)
            // For now, relies heavily on parsing `meetingTime` string as it's the primary display field
            // Example format: "Wednesday 4:00 PM"
            if (tribe.meetingTime) {
                const dayName = fullDays[dayIndex];
                return tribe.meetingTime.toLowerCase().includes(dayName.toLowerCase());
            }
            return false;
        });
    };

    const hasTribes = tribes.length > 0;

    if (!hasTribes) {
        return null; // Don't show if user has no tribes
    }

    return (
        <div className="w-full mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Users className="text-indigo-600" />
                My Tribes Schedule
            </h2>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                {/* Header Row */}
                <div className="grid grid-cols-7 bg-slate-800 text-white">
                    {days.map(day => (
                        <div key={day} className="py-3 text-center font-bold text-sm tracking-wider border-r border-slate-700 last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Content Row */}
                <div className="grid grid-cols-7 min-h-[160px] divide-x divide-slate-100 bg-slate-50">
                    {days.map((_, index) => {
                        const dayTribes = getDayTribes(index);
                        return (
                            <div key={index} className="p-2 flex flex-col gap-2">
                                {dayTribes.map(tribe => (
                                    <button
                                        key={tribe.id}
                                        onClick={() => router.push(`/tribes/${tribe.id}`)}
                                        className="w-full text-left bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 p-3 rounded-lg transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-indigo-900 text-xs md:text-sm line-clamp-2 leading-tight">
                                                {tribe.name}
                                            </h4>
                                        </div>

                                        {tribe.topic && (
                                            <p className="text-[10px] text-indigo-700 mt-1 line-clamp-1 font-medium">
                                                {tribe.topic}
                                            </p>
                                        )}

                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-800 font-bold bg-white/50 w-fit px-1.5 py-0.5 rounded">
                                            <ExternalLink size={10} />
                                            Enter Room
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
