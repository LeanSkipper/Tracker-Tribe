'use client';

import { ReactNode } from 'react';
import { usePermissions, UserPermissions } from '@/hooks/usePermissions';

interface FeatureGateProps {
    feature: keyof Pick<UserPermissions, 'canAccessGPS' | 'canJoinTribes' | 'canCreateTribes' | 'canViewPeerGPS' | 'canMonetizeTribe'>;
    children: ReactNode;
    fallback?: ReactNode;
    showUpgrade?: boolean;
}

/**
 * Component to gate features based on user permissions
 * Shows children if user has permission, otherwise shows fallback or upgrade prompt
 */
export default function FeatureGate({
    feature,
    children,
    fallback,
    showUpgrade = true
}: FeatureGateProps) {
    const permissions = usePermissions();

    // Show loading state
    if (!permissions) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Check if user has permission
    const hasPermission = permissions[feature];

    if (hasPermission) {
        return <>{children}</>;
    }

    // Show fallback if provided
    if (fallback) {
        return <>{fallback}</>;
    }

    // Show upgrade prompt by default
    if (showUpgrade) {
        return <DefaultUpgradePrompt feature={feature} permissions={permissions} />;
    }

    // Don't show anything
    return null;
}

/**
 * Default upgrade prompt component
 */
function DefaultUpgradePrompt({
    feature,
    permissions
}: {
    feature: string;
    permissions: UserPermissions;
}) {
    const featureNames: Record<string, string> = {
        canAccessGPS: 'GPS Tracking',
        canJoinTribes: 'Join Tribes',
        canCreateTribes: 'Create Tribes',
        canViewPeerGPS: 'View Peer GPS',
        canMonetizeTribe: 'Monetize Tribes',
    };

    const featureName = featureNames[feature] || 'This Feature';

    const getRequiredPlan = () => {
        if (feature === 'canCreateTribes' || feature === 'canMonetizeTribe') {
            return 'HARD ($19/month)';
        }
        if (feature === 'canJoinTribes' || feature === 'canViewPeerGPS') {
            return 'ENGAGED ($9/month)';
        }
        return 'Active Subscription';
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Upgrade to Access {featureName}
                    </h2>
                    <p className="text-lg text-gray-600">
                        This feature requires a {getRequiredPlan()} subscription
                    </p>
                </div>

                {permissions.isInTrial && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Trial Status:</strong> You have {permissions.trialDaysRemaining} days remaining in your trial.
                            Upgrade now to unlock all features!
                        </p>
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-gray-900">What you'll get:</h3>
                    <ul className="space-y-2">
                        {feature === 'canAccessGPS' && (
                            <>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Full GPS tracking for goals and OKRs</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Unlimited action plans</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Progress analytics and insights</span>
                                </li>
                            </>
                        )}
                        {feature === 'canJoinTribes' && (
                            <>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Join unlimited tribes</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Participate in mastermind sessions</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Access to peer accountability</span>
                                </li>
                            </>
                        )}
                        {feature === 'canCreateTribes' && (
                            <>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Create and manage your own tribes</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Set custom pricing and monetize</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Earn 70% revenue from subscriptions</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Access to creator dashboard</span>
                                </li>
                            </>
                        )}
                        {feature === 'canViewPeerGPS' && (
                            <>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>View matched peers' GPS data</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Share your progress with accountability partners</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Discover peers with similar goals</span>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/onboarding/upgrade'}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        Upgrade Now
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
