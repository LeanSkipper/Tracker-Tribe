'use client';

import { useState, useEffect, useCallback } from 'react';

export type PitStopStatus = 'safe' | 'warning' | 'overdue';

export function usePitStopStatus() {
    const [lastPitStopDate, setLastPitStopDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<PitStopStatus>('safe');
    const [daysSince, setDaysSince] = useState(0);

    const fetchStatus = useCallback(() => {
        setLoading(true);
        fetch('/api/pit-stop')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Assuming data is sorted desc by date
                    const lastDate = new Date(data[0].date);
                    setLastPitStopDate(lastDate);

                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysSince(diffDays);

                    if (diffDays >= 7) {
                        setStatus('overdue');
                    } else if (diffDays === 6) {
                        setStatus('warning');
                    } else {
                        setStatus('safe');
                    }
                } else {
                    // No pit stops ever
                    setStatus('overdue');
                    setDaysSince(999); // Force overdue
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch pit stops', err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return { status, daysSince, loading, lastPitStopDate, refresh: fetchStatus };
}
