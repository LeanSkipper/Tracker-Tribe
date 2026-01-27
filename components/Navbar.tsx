'use client';

import Link from 'next/link';
import { Target, Users, LogIn, LogOut, ToggleLeft, ToggleRight, Layout, User } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import FeedbackModal from './FeedbackModal';
import { useViewMode } from '@/contexts/ViewModeContext';

export default function Navbar() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { data: session, status } = useSession();
    const { mode, toggleMode } = useViewMode();

    const isAuthenticated = status === 'authenticated';
    const isLoading = status === 'loading';

    return (
        <>
            <nav className="sticky bottom-0 md:top-0 w-full bg-white border-t md:border-b border-gray-200 z-50 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="hidden md:flex items-center gap-2 font-bold text-[var(--primary)] text-lg">
                        <Target /> TNT Platform
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

                        {/* Mobile Profile Button */}
                        {isAuthenticated && (
                            <Link href="/profile" className="flex md:hidden flex-col items-center gap-1 text-gray-600 hover:text-[var(--primary)] text-xs p-2">
                                <User size={20} />
                                <span className="truncate max-w-[60px]">{session?.user?.name?.split(' ')[0] || 'Profile'}</span>
                            </Link>
                        )}

                    </div>

                    {/* Authentication & Mode Toggle */}
                    <div className="hidden md:flex items-center gap-4">

                        {/* View Mode Toggle */}
                        {isAuthenticated && (
                            <button
                                onClick={toggleMode}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-semibold text-gray-600"
                                title={`Switch to ${mode === 'beginner' ? 'Advanced' : 'Beginner'} Mode`}
                            >
                                <Layout size={14} />
                                {mode === 'beginner' ? 'Beginner' : 'Advanced'}
                                {mode === 'beginner' ? <ToggleLeft size={20} className="text-gray-400" /> : <ToggleRight size={20} className="text-green-500" />}
                            </button>
                        )}

                        {isLoading ? (
                            <div className="text-xs text-gray-500">Loading...</div>
                        ) : isAuthenticated ? (
                            <>
                                <Link href="/profile" className="text-sm text-gray-700 hover:underline font-medium">
                                    {session?.user?.name || session?.user?.email}
                                </Link>

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
