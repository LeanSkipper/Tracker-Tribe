'use client';

import Link from 'next/link';
import { Home, Bot, Map, Feather, Target, Users, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function Navbar() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return (
        <>
            <nav className="sticky bottom-0 md:top-0 w-full bg-white border-t md:border-b border-gray-200 z-50 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="hidden md:flex items-center gap-2 font-bold text-[var(--primary)] text-lg">
                        <Feather /> Tracker & Tribe LAPIS
                    </div>

                    <div className="flex w-full md:w-auto justify-around md:gap-8">

                        <Link href="/dashboard" className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2">
                            <Users size={20} />
                            <span>Mastermind</span>
                        </Link>
                        <Link href="/obeya" className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2">
                            <Target size={20} />
                            <span>GPS View</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2">
                            <User size={20} />
                            <span>Profile</span>
                        </Link>
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2"
                        >
                            <MessageSquare size={20} />
                            <span>Feedback</span>
                        </button>
                    </div>
                </div>
            </nav>

            {isFeedbackOpen && (
                <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
            )}
        </>
    );
}
