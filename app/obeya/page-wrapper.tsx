'use client';

import FeatureGate from '@/components/FeatureGate';
import ObeyaContent from './ObeyaContent';

/**
 * Obeya page wrapper with GPS access gate
 */
export default function ObeyaPage() {
    return (
        <FeatureGate feature="canAccessGPS">
            <ObeyaContent />
        </FeatureGate>
    );
}
