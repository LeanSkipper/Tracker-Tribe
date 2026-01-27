'use client';

import { useState } from 'react';
import { MessageSquare, Plus, BookOpen, Bot, User, Users, Search, Clock } from 'lucide-react';
import { useViewMode } from '@/contexts/ViewModeContext';
import Link from 'next/link';
import FeedbackModal from './FeedbackModal';
import Coach from './Coach';
import { motion, useDragControls } from 'framer-motion';
import { usePitStopStatus } from '@/hooks/usePitStopStatus';

import { usePathname } from 'next/navigation';

export default function FloatingActions() {
    const { } = useViewMode();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);
    const dragControls = useDragControls();

    const { status: pitStopStatus, daysSince: pitStopDaysSince } = usePitStopStatus();
    const pitStopDaysLeft = Math.max(0, 7 - pitStopDaysSince);
    const isPitStopDue = pitStopStatus === 'overdue' || pitStopStatus === 'warning';

    return (
        <>
            <motion.div
                drag
                dragMomentum={false}
                dragControls={dragControls}
                dragListener={false}
                className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none"
                style={{ touchAction: 'none' }}
            >

                {/* Expandable Menu Items */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

                    {/* Pit Stop (Primary on Obeya) */}
                    <Link
                        href="/obeya?action=pit-stop"
                        className={`flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-lg transition-colors ${isPitStopDue ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <span className="text-sm font-bold">Pit Stop {isPitStopDue ? '(DUE)' : `(${pitStopDaysLeft}d)`}</span>
                        <Clock size={20} />
                    </Link>

                    {/* New Tribe */}
                    <Link
                        href="/dashboard?action=new-tribe"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    >
                        <span className="text-sm font-bold">New Tribe</span>
                        <Plus size={20} />
                    </Link>

                    {/* Browse Peers */}
                    <Link
                        href="/peers"
                        className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-amber-700 transition-colors"
                    >
                        <span className="text-sm font-bold">Browse Peers</span>
                        <Users size={20} />
                    </Link>

                    {/* Find Tribes */}
                    <Link
                        href="/tribes"
                        onClick={(e) => {
                            if (pathname === '/tribes') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setIsOpen(false);
                            }
                        }}
                        className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors"
                    >
                        <span className="text-sm font-bold">Find Tribes</span>
                        <Search size={20} />
                    </Link>

                    {/* Profile */}
                    <Link
                        href="/profile"
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                    >
                        <span className="text-sm font-bold">Profile</span>
                        <User size={20} />
                    </Link>

                    {/* Coach */}
                    <button
                        onClick={() => { setIsCoachOpen(true); setIsOpen(false); }}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                    >
                        <span className="text-sm font-bold">Coach</span>
                        <Bot size={20} />
                    </button>

                    {/* Vault */}
                    <Link
                        href="/rituals"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    >
                        <span className="text-sm font-bold">Vault</span>
                        <BookOpen size={20} />
                    </Link>

                    {/* Add Goal */}
                    <Link
                        href="/obeya?action=new-goal"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        <span className="text-sm font-bold">Add Goal</span>
                        <Plus size={20} />
                    </Link>

                    {/* Feedback */}
                    <button
                        onClick={() => { setIsFeedbackOpen(true); setIsOpen(false); }}
                        className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                    >
                        <span className="text-sm font-bold">Feedback</span>
                        <MessageSquare size={20} />
                    </button>
                </div>

                {/* Main FAB Toggle */}
                <motion.button
                    onPointerDown={(e) => dragControls.start(e)}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative pointer-events-auto w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 z-50
                        ${isOpen ? 'bg-red-500 rotate-45' : 'bg-gradient-to-r from-[var(--primary)] to-blue-600'}`}
                >
                    <Plus size={28} />
                    {!isOpen && isPitStopDue && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </motion.button>
            </motion.div>

            {/* Modals */}
            {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
            {isCoachOpen && (
                <Coach
                    goals={[]}
                    isOpen={true}
                    onOpenChange={(open) => {
                        if (!open) setIsCoachOpen(false);
                    }}
                />
            )}
        </>
    );
}
