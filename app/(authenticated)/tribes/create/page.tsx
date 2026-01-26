'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import TribeCreationForm from '@/components/TribeCreationForm';
import SubscriptionLockedModal from '@/components/SubscriptionLockedModal';

export default function CreateTribePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isRestricted, setIsRestricted] = useState(false);
    const [canMonetize, setCanMonetize] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const user = await res.json();

                    // Allow creation access (handled by component or backend if really strict)
                    // But here we check mainly for monetization capability
                    if (user.userProfile === 'CREATOR') {
                        setCanMonetize(true);
                    }

                    // If we want to restrict creation itself to PAID users only (uncomment if needed)
                    if (user.userProfile === 'STARTER') {
                        setIsRestricted(true);
                    }
                }
            } catch (err) {
                console.error("Auth check failed", err);
            } finally {
                setLoading(false);
            }
        };
        checkAccess();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isRestricted) {
        return (
            <div className="min-h-screen bg-indigo-50 p-8">
                <SubscriptionLockedModal isOpen={true} onClose={() => router.push('/tribes')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-600 hover:text-indigo-600 font-bold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <TribeCreationForm
                        isModal={false}
                        canMonetize={canMonetize}
                        onSuccess={() => router.push('/tribes')}
                        onClose={() => router.back()}
                    />
                </div>
            </div>
        </div>
    );
}
