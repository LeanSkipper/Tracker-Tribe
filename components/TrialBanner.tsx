'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { getTrialDaysRemaining, getGraceDaysRemaining } from '@/lib/permissions';
import { useState } from 'react';

/**
 * Banner component to show trial or grace period status
 */
export default function TrialBanner() {
    const permissions = usePermissions();
    const [dismissed, setDismissed] = useState(false);

    if (!permissions || dismissed) {
        return null;
    }

    const { isInTrial, isInGracePeriod, trialDaysRemaining, graceDaysRemaining, subscriptionStatus } = permissions;

    // Don't show banner if user has active subscription
    if (subscriptionStatus === 'ACTIVE') {
        return null;
    }

    // Show trial banner
    if (isInTrial && trialDaysRemaining !== undefined) {
        return (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⏰</span>
                        <div>
                            <p className="font-semibold">
                                Free Trial: {trialDaysRemaining} days remaining
                            </p>
                            <p className="text-sm text-blue-100">
                                Upgrade to continue accessing GPS features after your trial ends
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/onboarding/upgrade'}
                            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                        >
                            Upgrade Now
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="text-white hover:text-blue-100 transition-colors"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show grace period banner
    if (isInGracePeriod && graceDaysRemaining !== undefined) {
        return (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-semibold">
                                Grace Period: {graceDaysRemaining} days remaining
                            </p>
                            <p className="text-sm text-orange-100">
                                Your trial has ended. Subscribe now to avoid losing access (20% surcharge applies during grace period)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/onboarding/upgrade'}
                            className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all"
                        >
                            Subscribe Now
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="text-white hover:text-orange-100 transition-colors"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show expired banner
    if (subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'CANCELLED') {
        return (
            <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <p className="font-semibold">
                                Subscription {subscriptionStatus === 'EXPIRED' ? 'Expired' : 'Cancelled'}
                            </p>
                            <p className="text-sm text-red-100">
                                Reactivate your subscription to regain access to all features
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/onboarding/upgrade'}
                        className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all"
                    >
                        Reactivate
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
