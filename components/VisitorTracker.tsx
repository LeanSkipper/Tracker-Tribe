'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { logVisitor } from '@/app/actions/logVisitor';

function Tracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track TOFU visit
        const source = searchParams?.get('utm_source') || searchParams?.get('ref') || null;
        logVisitor('/', source);
    }, [searchParams]);

    return null;
}

export default function VisitorTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    );
}
