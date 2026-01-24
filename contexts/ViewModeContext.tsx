'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ViewMode = 'beginner' | 'advanced';

interface ViewModeContextType {
    mode: ViewMode;
    toggleMode: () => void;
    setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ViewMode>('beginner');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('lapis_view_mode') as ViewMode;
        if (savedMode) {
            setMode(savedMode);
        }
        setMounted(true);
    }, []);

    const toggleMode = () => {
        const newMode = mode === 'beginner' ? 'advanced' : 'beginner';
        setMode(newMode);
        localStorage.setItem('lapis_view_mode', newMode);
    };

    const handleSetMode = (newMode: ViewMode) => {
        setMode(newMode);
        localStorage.setItem('lapis_view_mode', newMode);
    };

    // Avoid hydration mismatch by rendering nothing or a loader until mounted
    // OR render children with default but effective change happens after mount.
    // Given the requirement for "beginner by default for first time", default state matches.

    return (
        <ViewModeContext.Provider value={{ mode, toggleMode, setMode: handleSetMode }}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode() {
    const context = useContext(ViewModeContext);
    if (context === undefined) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
}
