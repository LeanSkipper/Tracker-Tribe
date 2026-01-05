'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from './CircularProgress';
import MiniTable from './MiniTable';
import { Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Member = {
    id: string;
    name: string;
    avatarUrl?: string;
};

type TableCardProps = {
    id: string;
    name: string;
    reliabilityRate: number;
    members: Member[];
    maxSeats: number;
    index: number;
};

export default function TableCard({ id, name, reliabilityRate, members, maxSeats, index }: TableCardProps) {
    const router = useRouter();
    const filledSeats = members.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group"
            onClick={() => router.push(`/tribes/${id}/session`)}
        >
            {/* Reliability indicator and mini table */}
            <div className="flex items-center justify-between mb-6">
                <CircularProgress value={reliabilityRate} size={100} strokeWidth={6} />
                <MiniTable members={members} maxSeats={maxSeats} />
            </div>

            {/* Table info */}
            <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} />
                    <span className="font-bold">
                        {filledSeats}/{maxSeats} Members
                    </span>
                </div>

                {maxSeats - filledSeats > 0 && (
                    <div className="text-xs text-slate-500">
                        {maxSeats - filledSeats} {maxSeats - filledSeats === 1 ? 'seat' : 'seats'} available
                    </div>
                )}
            </div>

            {/* Enter button */}
            <button className="mt-4 w-full py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                Enter Session
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );
}
