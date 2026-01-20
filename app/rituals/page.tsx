'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import PitStopModal from '@/components/PitStop/PitStopModal';
import VaultFeed from '@/components/PitStop/VaultFeed';

export default function RitualsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [seed, setSeed] = useState(0); // To force refresh feed

    const handleComplete = () => {
        setSeed(s => s + 1); // Refresh vault feed
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-1">My Vault</h1>
                        <p className="text-slate-500 font-medium">Your pool of memories and lessons.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary px-6 py-3 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2 font-bold"
                    >
                        <Play size={18} fill="currentColor" />
                        START PIT STOP
                    </button>
                </header>

                {/* Vault Feed */}
                <VaultFeed key={seed} />

                {/* Modal */}
                <PitStopModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
