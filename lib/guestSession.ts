/**
 * Guest Session Management
 * Handles anonymous user sessions with localStorage persistence
 */

export interface GuestSession {
    guestId: string;
    createdAt: string;
    lastAccess: string;
    demoDataViewed: boolean;
    featuresExplored: string[];
}

const GUEST_SESSION_KEY = 'lapis_guest_session';

/**
 * Generate a unique guest ID
 */
export function generateGuestId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create guest session
 */
export function getGuestSession(): GuestSession {
    if (typeof window === 'undefined') {
        // Server-side: return temporary session
        return {
            guestId: generateGuestId(),
            createdAt: new Date().toISOString(),
            lastAccess: new Date().toISOString(),
            demoDataViewed: false,
            featuresExplored: [],
        };
    }

    const stored = localStorage.getItem(GUEST_SESSION_KEY);

    if (stored) {
        try {
            const session: GuestSession = JSON.parse(stored);
            // Update last access
            session.lastAccess = new Date().toISOString();
            localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
            return session;
        } catch (error) {
            console.error('Failed to parse guest session:', error);
        }
    }

    // Create new guest session
    const newSession: GuestSession = {
        guestId: generateGuestId(),
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        demoDataViewed: false,
        featuresExplored: [],
    };

    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
    return newSession;
}

/**
 * Update guest session
 */
export function updateGuestSession(updates: Partial<GuestSession>): void {
    if (typeof window === 'undefined') return;

    const session = getGuestSession();
    const updated = { ...session, ...updates, lastAccess: new Date().toISOString() };
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
}

/**
 * Track feature exploration
 */
export function trackFeatureExplored(feature: string): void {
    if (typeof window === 'undefined') return;

    const session = getGuestSession();
    if (!session.featuresExplored.includes(feature)) {
        session.featuresExplored.push(feature);
        updateGuestSession(session);
    }
}

/**
 * Clear guest session (on signup)
 */
export function clearGuestSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_SESSION_KEY);
}

/**
 * Check if user is a guest
 */
export function isGuestUser(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(GUEST_SESSION_KEY) !== null;
}

/**
 * Get demo goals data for guest users
 */
export function getDemoGoalsData() {
    return [
        {
            id: 'demo-1',
            category: 'Business/Career',
            title: 'Launch My SaaS Product',
            isShared: false,
            rows: [
                {
                    id: 'demo-okr-1',
                    type: 'OKR',
                    label: 'Monthly Recurring Revenue',
                    unit: '$',
                    startValue: 0,
                    targetValue: 10000,
                    startYear: 2026,
                    startMonth: 0,
                    deadlineYear: 2026,
                    deadlineMonth: 11,
                    monthlyData: Array.from({ length: 12 }, (_, i) => ({
                        monthId: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                        year: 2026,
                        target: Math.round((10000 / 12) * (i + 1)),
                        actual: i < 3 ? Math.round((10000 / 12) * (i + 0.8)) : null,
                        comment: null,
                    })),
                },
                {
                    id: 'demo-kpi-1',
                    type: 'KPI',
                    label: 'Active Users',
                    unit: '',
                    startValue: 0,
                    targetValue: 500,
                    startYear: 2026,
                    startMonth: 0,
                    deadlineYear: 2026,
                    deadlineMonth: 11,
                    monthlyData: Array.from({ length: 12 }, (_, i) => ({
                        monthId: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                        year: 2026,
                        target: Math.round((500 / 12) * (i + 1)),
                        actual: i < 3 ? Math.round((500 / 12) * (i + 0.7)) : null,
                        comment: null,
                    })),
                },
                {
                    id: 'demo-action-1',
                    label: 'Action Plan',
                    actions: [
                        { id: 'demo-a1', weekId: 'W1', year: 2026, title: 'Complete MVP development', status: 'DONE' },
                        { id: 'demo-a2', weekId: 'W2', year: 2026, title: 'Launch beta to 10 users', status: 'DONE' },
                        { id: 'demo-a3', weekId: 'W5', year: 2026, title: 'Implement payment system', status: 'TBD' },
                        { id: 'demo-a4', weekId: 'W8', year: 2026, title: 'Launch marketing campaign', status: 'TBD' },
                    ],
                },
            ],
        },
        {
            id: 'demo-2',
            category: 'Health',
            title: 'Run a Marathon',
            isShared: false,
            rows: [
                {
                    id: 'demo-okr-2',
                    type: 'OKR',
                    label: 'Weekly Running Distance (km)',
                    unit: 'km',
                    startValue: 5,
                    targetValue: 50,
                    startYear: 2026,
                    startMonth: 0,
                    deadlineYear: 2026,
                    deadlineMonth: 11,
                    monthlyData: Array.from({ length: 12 }, (_, i) => ({
                        monthId: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                        year: 2026,
                        target: Math.round(5 + ((50 - 5) / 12) * (i + 1)),
                        actual: i < 3 ? Math.round(5 + ((50 - 5) / 12) * (i + 0.9)) : null,
                        comment: null,
                    })),
                },
            ],
        },
    ];
}
