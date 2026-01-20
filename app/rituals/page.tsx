'use client';

import React, { useState } from 'react';
import VaultFeed from '@/components/PitStop/VaultFeed';

export default function RitualsPage() {
    const [seed, setSeed] = useState(0); // To force refresh feed

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-1">My Vault</h1>
                        <p className="text-slate-500 font-medium">Your pool of memories and lessons.</p>
                    </div>
                </header>

                {/* Vault Feed */}
                <VaultFeed key={seed} />
            </div>
        </div>
    );
}
