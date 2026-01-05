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
    userProfile: 'SOFT' | 'ENGAGED' | 'HARD';
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
                // TODO: Replace with actual API call to get user permissions
                // For now, return default permissions for testing
                const mockPermissions: UserPermissions = {
                    canAccessGPS: true,
                    canJoinTribes: false,
                    canCreateTribes: false,
                    canViewPeerGPS: false,
                    canMonetizeTribe: false,
                    userProfile: 'SOFT',
                    subscriptionStatus: 'TRIAL',
                    reputationScore: 0,
                    trialDaysRemaining: 90,
                    isInGracePeriod: false,
                    isInTrial: true,
                };

                setPermissions(mockPermissions);
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
