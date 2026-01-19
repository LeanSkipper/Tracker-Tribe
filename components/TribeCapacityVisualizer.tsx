import React from 'react';
import { Users, Plus } from 'lucide-react';

interface TribeCapacityVisualizerProps {
    members: { id: string; name: string; avatarUrl?: string }[];
    maxMembers: number;
}

export default function TribeCapacityVisualizer({ members, maxMembers }: TribeCapacityVisualizerProps) {
    const filledSlots = members.length;
    const emptySlots = Math.max(0, maxMembers - filledSlots);
    const slots = [];

    // Fill slots with members
    for (let i = 0; i < filledSlots; i++) {
        slots.push({ type: 'member', data: members[i] });
    }

    // Fill remaining with empty
    for (let i = 0; i < emptySlots; i++) {
        slots.push({ type: 'empty' });
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={16} />
                Tribe Capacity ({filledSlots}/{maxMembers})
            </h3>

            <div className="flex flex-wrap gap-3">
                {slots.map((slot, idx) => (
                    <div
                        key={idx}
                        className={`
                            w-12 h-12 rounded-full flex items-center justify-center transition-all
                            ${slot.type === 'member'
                                ? 'bg-indigo-100 border-2 border-indigo-200'
                                : 'bg-slate-50 border-2 border-dashed border-slate-300'
                            }
                        `}
                        title={slot.type === 'member' ? slot.data?.name : 'Open Spot'}
                    >
                        {slot.type === 'member' ? (
                            slot.data?.avatarUrl ? (
                                <img
                                    src={slot.data.avatarUrl}
                                    alt={slot.data.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-indigo-600 font-bold text-sm">
                                    {slot.data?.name.charAt(0)}
                                </span>
                            )
                        ) : (
                            <div className="text-slate-300">
                                <Plus size={20} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {emptySlots > 0 && (
                <p className="mt-4 text-xs text-slate-400 font-medium">
                    {emptySlots} spot{emptySlots !== 1 ? 's' : ''} available. Invite peers to join!
                </p>
            )}
        </div>
    );
}
