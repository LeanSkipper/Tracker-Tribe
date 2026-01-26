'use client';

import { useEffect, useState } from 'react';

/**
 * User permissions interface
 */
export interface UserPermissions {
    canAccessGPS: boolean;
    canJoinTribes: boolean;
    canCreateTribes: boolean;
    canViewPeerGPS: boolean;
    canMonetizeTribe: boolean;
    userProfile: 'STARTER' | 'ENGAGED' | 'CREATOR';
    subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_FAILED';
    reputationScore: number;
    trialDaysRemaining?: number;
    graceDaysRemaining?: number;
    isInGracePeriod: boolean;
    isInTrial: boolean;
}

/**
 * Hook to get current user permissions
 * This will fetch permissions from the API and cache them
 */
export function usePermissions(): UserPermissions | null {
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            try {
                const response = await fetch('/api/user/permissions');

                if (!response.ok) {
                    console.error('Failed to fetch permissions:', response.status);
                    setPermissions(null);
                    return;
                }

                const data = await response.json();
                setPermissions(data);
            } catch (error) {
                console.error('Failed to fetch permissions:', error);
                setPermissions(null);
            } finally {
                setLoading(false);
            }
        }

        fetchPermissions();
    }, []);

    if (loading) {
        return null;
    }

    return permissions;
}

/**
 * Hook to check if user has a specific permission
 */
export function useHasPermission(permission: keyof Pick<UserPermissions, 'canAccessGPS' | 'canJoinTribes' | 'canCreateTribes' | 'canViewPeerGPS' | 'canMonetizeTribe'>): boolean {
    const permissions = usePermissions();

    if (!permissions) {
        return false;
    }

    return permissions[permission];
}
