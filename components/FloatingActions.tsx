'use client';

import { useState } from 'react';
import { MessageSquare, Plus, BookOpen, Bot } from 'lucide-react';
import { useViewMode } from '@/contexts/ViewModeContext';
import Link from 'next/link';
import FeedbackModal from './FeedbackModal';
import Coach from './Coach';

import { usePathname } from 'next/navigation';

export default function FloatingActions() {
    const { } = useViewMode();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);

    // Hide FAB on Obeya page (it has its own specialized FAB)
    if (pathname?.startsWith('/obeya')) return null;

    return (
        <>
            <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">

                {/* Expandable Menu Items */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

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
                    {/* Note: This might need to trigger the specific modal in Obeya if we are there, 
                        or redirect to Obeya with a query param. For now, let's redirect to Obeya. */}
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
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`pointer-events-auto w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 z-50
                        ${isOpen ? 'bg-red-500 rotate-45' : 'bg-gradient-to-r from-[var(--primary)] to-blue-600'}`}
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Modals */}
            {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
            {/* Note: Coach component usually is integrated in the page or sidebar. 
                We might need a modal wrapper for it if it's not designed to be modal. 
                Assuming Coach is the Chat interface. */}
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
