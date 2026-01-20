'use client';

import Link from 'next/link';
import { Feather, Target, Users, MessageSquare, User, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import FeedbackModal from './FeedbackModal';

export default function Navbar() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { data: session, status } = useSession();

    const isAuthenticated = status === 'authenticated';
    const isLoading = status === 'loading';

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
                            <span>Tribes</span>
                        </Link>
                        <Link href="/obeya" className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2">
                            <Target size={20} />
                            <span>Tracker</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2">
                            <User size={20} />
                            <span>Profile</span>
                        </Link>
                        <Link href="/rituals" className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2">
                            <Feather size={20} />
                            <span>Vault</span>
                        </Link>
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="flex flex-col md:flex-row items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs md:text-sm p-2"
                        >
                            <MessageSquare size={20} />
                            <span>Feedback</span>
                        </button>
                    </div>

                    {/* Authentication Status */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoading ? (
                            <div className="text-xs text-gray-500">Loading...</div>
                        ) : isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-700">
                                    {session?.user?.name || session?.user?.email}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                <LogIn size={16} />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {isFeedbackOpen && (
                <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
            )}
        </>
    );
}
