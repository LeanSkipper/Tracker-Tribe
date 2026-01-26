'use client';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * Badge component to display user's subscription status
 */
export default function SubscriptionBadge() {
    const permissions = usePermissions();

    if (!permissions) {
        return null;
    }

    const { userProfile, subscriptionStatus, isInTrial, isInGracePeriod } = permissions;

    // Determine badge color and text based on profile and status
    const getBadgeStyle = () => {
        if (subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'CANCELLED') {
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                border: 'border-red-300',
                label: 'Expired',
            };
        }

        if (isInGracePeriod) {
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                border: 'border-orange-300',
                label: 'Grace Period',
            };
        }

        if (isInTrial) {
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-300',
                label: 'Trial',
            };
        }

        switch (userProfile) {
            case 'STARTER':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-300',
                    label: 'Starter',
                };
            case 'ENGAGED':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    border: 'border-blue-300',
                    label: 'Member',
                };
            case 'CREATOR':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-800',
                    border: 'border-purple-300',
                    label: 'Creator',
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    border: 'border-gray-300',
                    label: 'Unknown',
                };
        }
    };

    const style = getBadgeStyle();

    return (
        <button
            onClick={() => window.location.href = '/profile'}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105 cursor-pointer ${style.bg} ${style.text} ${style.border}`}
            title="Click to manage subscription"
        >
            <span className="text-lg">
                {userProfile === 'STARTER' && '🌱'}
                {userProfile === 'ENGAGED' && '💎'}
                {userProfile === 'CREATOR' && '👑'}
            </span>
            <span>{style.label}</span>
            {subscriptionStatus === 'ACTIVE' && <span className="text-xs">✓</span>}
        </button>
    );
}
