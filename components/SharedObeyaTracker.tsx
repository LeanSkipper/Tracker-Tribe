'use client';

import React, { useState } from 'react';
import { ChevronRight, Users, Globe, Layers, User, Plus } from 'lucide-react';

// Helper functions (same as before)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_WEEKS: Record<string, string[]> = MONTHS.reduce((acc, m, i) => {
    const startW = i * 4 + 1;
    acc[m] = [1, 2, 3, 4].map(n => `W${startW + n - 1}`);
    return acc;
}, {} as Record<string, string[]>);

const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const firstSunday = new Date(firstDayOfYear);
    const dayOfWeek = firstDayOfYear.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    firstSunday.setDate(firstDayOfYear.getDate() + daysUntilSunday);
    const diffTime = date.getTime() - firstSunday.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
};

const getWeekDayRange = (year: number, weekNum: number): string => {
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOfWeek = firstDayOfYear.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const firstSunday = new Date(year, 0, 1 + daysUntilSunday);
    const daysFromFirstSunday = (weekNum - 1) * 7;
    const weekStart = new Date(firstSunday.getTime() + daysFromFirstSunday * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const formatDay = (date: Date) => `${date.getDate()}`;
    return `${formatDay(weekStart)}-${formatDay(weekEnd)}`;
};

type MonthlyData = { monthId: string; year: number; target: number | null; actual: number | null; comment?: string; };
type ActionCard = { id: string; weekId: string; year: number; title: string; status: 'TBD' | 'IN_PROGRESS' | 'DONE' | 'STUCK'; };
type MetricRow = {
    id: string;
    type: 'OKR' | 'KPI';
    label: string;
    unit?: string;
    startValue: number;
    targetValue: number;
    monthlyData: MonthlyData[];
};
type ActionRow = { id: string; label: string; actions: ActionCard[]; };
type GoalData = {
    id: string;
    userId: string;
    userName: string;
    category: string;
    title: string;
    visibility?: 'PRIVATE' | 'TRIBE' | 'PUBLIC';
    rows: (MetricRow | ActionRow)[];
};

interface SharedObeyaTrackerProps {
    goals: GoalData[];
    currentUserId?: string;
    currentYear?: number;
    readOnly?: boolean;
}

type GroupBy = 'none' | 'member' | 'area';

export default function SharedObeyaTracker({
    goals: initialGoals,
    currentUserId,
    currentYear = new Date().getFullYear(),
    readOnly = false
}: SharedObeyaTrackerProps) {
    // Local state for optimistic updates
    const [goals, setGoals] = useState<GoalData[]>(initialGoals);
    const [collapsedOKRs, setCollapsedOKRs] = useState<Set<string>>(new Set());
    const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ id: string; value: string } | null>(null);
    const [groupBy, setGroupBy] = useState<GroupBy>('none');
    const [draggedTask, setDraggedTask] = useState<{ id: string; goalId: string; sourceWeek: string } | null>(null);

    // Sync props to state if they change
    React.useEffect(() => {
        setGoals(initialGoals);
    }, [initialGoals]);

    // Mobile check: Collapse all on mount if screen is narrow
    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            const allGoalIds = initialGoals.map(g => g.id);
            setCollapsedGoals(new Set(allGoalIds));
        }
    }, []);

    const handleSaveGoal = async (updatedGoal: GoalData) => {
        try {
            await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedGoal)
            });
        } catch (err) {
            console.error("Failed to save goal:", err);
            // Optionally revert state here
        }
    };

    const handleCommitMetric = (goalId: string, rowId: string, monthId: string, type: 'target' | 'actual', value: string) => {
        const numValue = value === '' ? null : parseFloat(value);
        if (value !== '' && isNaN(numValue as number)) return; // Invalid input

        let updatedGoalToSave: GoalData | undefined;

        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;

            const updatedRows = g.rows.map(r => {
                if (r.id !== rowId || !('monthlyData' in r)) return r;

                // Find or create monthly data
                const existingDataIndex = r.monthlyData.findIndex(d => d.monthId === monthId && d.year === currentYear);
                const newMonthlyData = [...r.monthlyData];

                if (existingDataIndex >= 0) {
                    newMonthlyData[existingDataIndex] = {
                        ...newMonthlyData[existingDataIndex],
                        [type]: numValue
                    };
                } else {
                    newMonthlyData.push({
                        monthId,
                        year: currentYear,
                        target: type === 'target' ? numValue : null,
                        actual: type === 'actual' ? numValue : null,
                    });
                }

                return { ...r, monthlyData: newMonthlyData };
            });

            const updatedG = { ...g, rows: updatedRows };
            if (g.id === goalId) updatedGoalToSave = updatedG;
            return updatedG;
        }));

        if (updatedGoalToSave) handleSaveGoal(updatedGoalToSave);
        setEditingCell(null);
    };

    const handleUpdateActionStatus = (goalId: string, actionId: string) => {
        if (readOnly) return;

        let updatedGoalToSave: GoalData | undefined;

        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;

            const updatedRows = g.rows.map(r => {
                if ('type' in r) return r; // Skip metric rows

                const actionRow = r as ActionRow;
                const updatedActions = actionRow.actions.map(a => {
                    if (a.id !== actionId) return a;
                    // Toggle status
                    const newStatus: ActionCard['status'] = a.status === 'DONE' ? 'TBD' : 'DONE';
                    return { ...a, status: newStatus };
                });

                return { ...r, actions: updatedActions };
            });

            const updatedG = { ...g, rows: updatedRows };
            updatedGoalToSave = updatedG;
            return updatedG;
        }));

        if (updatedGoalToSave) handleSaveGoal(updatedGoalToSave);
    };

    const handleAddAction = (goalId: string, rowId: string) => {
        if (readOnly) return;
        const title = window.prompt("Enter task title:");
        if (!title) return;

        const currentWeekId = `W${getWeekNumber(new Date())}`;
        let updatedGoalToSave: GoalData | undefined;

        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;

            const updatedRows = g.rows.map(r => {
                if (r.id !== rowId) return r;
                if ('type' in r) return r;

                const actionRow = r as ActionRow;
                const newAction: ActionCard = {
                    id: Math.random().toString(36).substr(2, 9), // Temp ID
                    weekId: currentWeekId,
                    year: currentYear,
                    title,
                    status: 'TBD'
                };

                return { ...r, actions: [...actionRow.actions, newAction] };
            });

            const updatedG = { ...g, rows: updatedRows };
            updatedGoalToSave = updatedG;
            return updatedG;
        }));

        if (updatedGoalToSave) handleSaveGoal(updatedGoalToSave);
    };

    const handleMoveAction = (goalId: string, actionId: string, targetWeekId: string) => {
        if (readOnly) return;
        let updatedGoalToSave: GoalData | undefined;

        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;

            const updatedRows = g.rows.map(r => {
                if ('type' in r) return r;
                const actionRow = r as ActionRow;
                const updatedActions = actionRow.actions.map(a =>
                    a.id === actionId ? { ...a, weekId: targetWeekId } : a
                );
                return { ...r, actions: updatedActions };
            });

            const updatedG = { ...g, rows: updatedRows };
            updatedGoalToSave = updatedG;
            return updatedG;
        }));

        if (updatedGoalToSave) handleSaveGoal(updatedGoalToSave);
    };

    const toggleOKR = (okrId: string) => {
        setCollapsedOKRs(prev => {
            const next = new Set(prev);
            if (next.has(okrId)) next.delete(okrId);
            else next.add(okrId);
            return next;
        });
    };

    const toggleGoal = (goalId: string) => {
        setCollapsedGoals(prev => {
            const next = new Set(prev);
            if (next.has(goalId)) next.delete(goalId);
            else next.add(goalId);
            return next;
        });
    };

    const toggleExpandAll = () => {
        if (collapsedOKRs.size === 0) {
            const allOKRIds = goals.flatMap(g =>
                g.rows.filter(r => 'type' in r && (r as MetricRow).type === 'OKR').map(r => r.id)
            );
            setCollapsedOKRs(new Set(allOKRIds));
        } else {
            setCollapsedOKRs(new Set());
        }
    };

    // Helper to group goals
    const getGroupedGoals = () => {
        if (groupBy === 'none') return { 'All Goals': goals };

        return goals.reduce((acc, goal) => {
            const key = groupBy === 'member' ? goal.userName : goal.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(goal);
            return acc;
        }, {} as Record<string, GoalData[]>);
    };

    // Current date calculations for highlighting
    const now = new Date();
    const currentWeekNum = getWeekNumber(now);
    const currentWeekId = `W${currentWeekNum}`;
    const isCurrentYearDisplayed = currentYear === now.getFullYear();
    const groupedGoals = getGroupedGoals();

    return (
        <div className="w-full flex-col flex h-full">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Shared Goals</h3>

                    {/* View Controls */}
                    <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-md p-1 shadow-sm">
                        <span className="text-gray-400 text-xs font-semibold px-2">Group by:</span>
                        <button
                            onClick={() => setGroupBy('none')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${groupBy === 'none' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            None
                        </button>
                        <button
                            onClick={() => setGroupBy('member')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${groupBy === 'member' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <User size={12} /> Member
                        </button>
                        <button
                            onClick={() => setGroupBy('area')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${groupBy === 'area' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Layers size={12} /> Area
                        </button>
                    </div>
                </div>

                <button
                    onClick={toggleExpandAll}
                    className="px-3 py-2 rounded-md text-xs font-bold bg-white shadow-sm text-gray-600 hover:text-blue-600 border border-gray-200 transition-colors flex items-center gap-1"
                >
                    {collapsedOKRs.size === 0 ? 'Collapse All' : 'Expand All'}
                </button>
            </div>

            {/* Main Scrollable Grid Container */}
            <div className="flex-1 overflow-x-auto overflow-y-visible border border-gray-200 rounded-lg bg-white shadow-sm relative">

                {/* 1. Sticky Header Row (Months & Weeks) */}
                <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex min-w-max">
                    {/* Top Left Corner (Sticky) */}
                    <div className="sticky left-0 w-[150px] md:w-[400px] bg-white border-r border-gray-200 z-40 shrink-0 p-4 font-bold text-gray-400 text-xs flex items-end">
                        STRATEGIC CONTEXT
                    </div>

                    {/* Month/Week Columns */}
                    {MONTHS.map(m => (
                        <div key={`${currentYear}-${m}`} className="w-[16rem] shrink-0 border-r border-gray-200">
                            {/* Month Header */}
                            <div className="bg-gray-50 text-center py-1 font-bold text-gray-700 text-sm border-b border-gray-100">
                                {m}
                            </div>

                            {/* Days Range Row */}
                            <div className="flex border-b border-gray-100">
                                {MONTH_WEEKS[m].map(w => {
                                    const isCurrentWeek = isCurrentYearDisplayed && w === currentWeekId;
                                    return (
                                        <div
                                            key={`${w}-days`}
                                            className={`flex-1 text-center text-[9px] py-0.5 border-r border-gray-50 font-medium transition-colors ${isCurrentWeek ? 'bg-blue-100 text-blue-700' : 'text-gray-400'
                                                }`}
                                        >
                                            {getWeekDayRange(currentYear, parseInt(w.replace('W', '')))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Week Number Row */}
                            <div className="flex">
                                {MONTH_WEEKS[m].map(w => {
                                    const isCurrentWeek = isCurrentYearDisplayed && w === currentWeekId;
                                    return (
                                        <div
                                            key={w}
                                            className={`flex-1 text-center text-[10px] py-1 border-r border-gray-50 transition-colors ${isCurrentWeek ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-400'
                                                }`}
                                        >
                                            {w}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Goals List (Grouped) */}
                <div className="min-w-max">
                    {Object.entries(groupedGoals).map(([groupName, groupGoals]) => (
                        <React.Fragment key={groupName}>
                            {/* Group Header - Only if grouping is active */}
                            {groupBy !== 'none' && (
                                <div className="w-full bg-gray-50/50 border-b border-gray-200 sticky left-0">
                                    <div className="sticky left-0 w-[150px] md:w-[400px] px-4 py-2 font-bold text-gray-600 bg-gray-50 border-r border-gray-200 z-20 flex items-center gap-2 overflow-hidden">
                                        {groupBy === 'member' ? <User size={14} /> : <Layers size={14} />}
                                        <span className="truncate">{groupName}</span>
                                        <span className="text-xs font-normal text-gray-400 ml-2 whitespace-nowrap">({groupGoals.length})</span>
                                    </div>
                                </div>
                            )}

                            {groupGoals.map((goal) => {
                                const categoryBgColor = goal.category === 'Health' ? 'bg-teal-600' :
                                    goal.category === 'Wealth' ? 'bg-emerald-600' :
                                        goal.category === 'Family' ? 'bg-indigo-500' :
                                            goal.category === 'Leisure' ? 'bg-pink-500' :
                                                goal.category === 'Business/Career' ? 'bg-blue-700' : 'bg-gray-500';

                                const isOwner = currentUserId === goal.userId;
                                const canEdit = !readOnly && isOwner;

                                return (
                                    <div key={goal.id} className="bg-white border-b-2 border-gray-100">
                                        {/* Revised Vision Band */}
                                        <div className={`w-full min-h-[52px] ${categoryBgColor} flex items-stretch`}>
                                            <div className={`sticky left-0 z-20 w-[150px] md:w-[400px] px-3 py-2 flex items-center justify-between ${categoryBgColor}`}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <button
                                                        onClick={() => toggleGoal(goal.id)}
                                                        className="text-white/80 hover:text-white transition-colors shrink-0"
                                                        title={collapsedGoals.has(goal.id) ? "Expand goal" : "Collapse goal"}
                                                    >
                                                        <ChevronRight className={`transition-transform ${!collapsedGoals.has(goal.id) ? 'rotate-90' : ''}`} size={20} />
                                                    </button>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold text-xs uppercase tracking-wide shrink-0 opacity-80">{goal.category}</span>
                                                        <span className="text-white font-bold text-sm md:text-lg leading-tight whitespace-normal break-words">{goal.title}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 self-start mt-1">
                                                    {canEdit && <span className="text-xs text-white/60 hidden md:inline">(Edit)</span>}
                                                    {goal.visibility === 'TRIBE' && <Users size={14} className="text-white/80" />}
                                                    {goal.visibility === 'PUBLIC' && <Globe size={14} className="text-white/80" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Goal Rows */}
                                        <div className="flex flex-col">
                                            {goal.rows.map((row) => {
                                                // Visibility Logic
                                                const isOKR = 'type' in row;
                                                const isKPI = isOKR && (row as MetricRow).type === 'KPI';
                                                const isActionRow = !isOKR && !isKPI;

                                                // Hide OKRs/KPIs if goal collapsed
                                                // MODIFICATION: Keep Action Rows visible even if goal is collapsed
                                                if (collapsedGoals.has(goal.id) && (isOKR || isKPI)) return null;

                                                // Hide KPIs if parent OKR collapsed
                                                if (isKPI) {
                                                    const currentKPIIndex = goal.rows.indexOf(row);
                                                    let parentOKR = null;
                                                    for (let i = currentKPIIndex - 1; i >= 0; i--) {
                                                        const r = goal.rows[i];
                                                        if ('type' in r && (r as MetricRow).type === 'OKR') {
                                                            parentOKR = r;
                                                            break;
                                                        }
                                                    }
                                                    if (parentOKR && collapsedOKRs.has(parentOKR.id)) {
                                                        return null;
                                                    }
                                                }

                                                // Row Height Logic
                                                let heightClass = 'h-[45px]';
                                                if (isActionRow) {
                                                    const actionRow = row as ActionRow;
                                                    const actionCounts = MONTHS.flatMap(m => MONTH_WEEKS[m].map(w =>
                                                        actionRow.actions.filter(a => a.weekId === w && a.year === currentYear).length
                                                    ));
                                                    const maxTasks = Math.max(0, ...actionCounts);
                                                    const dynamicHeight = Math.max(80, maxTasks * 24 + 20);
                                                    heightClass = `h-[${dynamicHeight}px]`;
                                                }

                                                return (
                                                    <div key={row.id} className={`flex ${heightClass} border-b border-gray-50 last:border-0 group`}>
                                                        {/* Left Sticky Label Column */}
                                                        <div className="sticky left-0 w-[150px] md:w-[400px] shrink-0 bg-white border-r border-gray-200 z-10 p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                                                            {isOKR && !isKPI && (
                                                                <button
                                                                    onClick={() => toggleOKR(row.id)}
                                                                    className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                                                                >
                                                                    <ChevronRight className={`transition-transform ${!collapsedOKRs.has(row.id) ? 'rotate-90' : ''}`} size={16} />
                                                                </button>
                                                            )}

                                                            <div className={`flex-1 text-xs whitespace-normal break-words leading-tight ${isKPI ? 'pl-6 text-gray-500 italic' : 'font-bold text-gray-700'} ${isActionRow ? 'pl-6 text-gray-500 font-bold' : ''}`}>
                                                                {isKPI && <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full mr-2" />}
                                                                {row.label}
                                                            </div>
                                                            {/* Add Task Button for Goal Owners */}
                                                            {isActionRow && canEdit && (
                                                                <button
                                                                    onClick={() => handleAddAction(goal.id, row.id)}
                                                                    className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                    title="Add Task to Current Week"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            )}

                                                            <div className="text-[10px] font-bold text-gray-300 bg-gray-50 px-1 rounded ml-2">
                                                                {isOKR ? (isKPI ? 'KPI' : 'OKR') : 'Act'}
                                                            </div>
                                                        </div>

                                                        {/* Data Columns */}
                                                        {MONTHS.map(m => {
                                                            const key = `${currentYear}-${m}`;

                                                            return (
                                                                <div key={key} className="w-[16rem] shrink-0 border-r border-gray-200 flex items-center justify-center p-1 relative">
                                                                    {isOKR ? (
                                                                        // Metric Cell
                                                                        (() => {
                                                                            const metricRow = row as MetricRow;
                                                                            const monthlyData = metricRow.monthlyData || [];
                                                                            const data = monthlyData.find(d => d.monthId === m && d.year === currentYear) || { monthId: m, year: currentYear, target: null, actual: null };

                                                                            const targetCellId = `${goal.id}-${row.id}-${m}-target`;
                                                                            const actualCellId = `${goal.id}-${row.id}-${m}-actual`;
                                                                            const currentTargetVal = editingCell?.id === targetCellId ? editingCell.value : (data.target !== null ? data.target : '');
                                                                            const currentActualVal = editingCell?.id === actualCellId ? editingCell.value : (data.actual !== null ? data.actual : '');

                                                                            const hasResult = data.actual !== null;
                                                                            const isSuccess = hasResult && (metricRow.targetValue >= metricRow.startValue ? (data.actual! >= data.target!) : (data.actual! <= data.target!));

                                                                            const cardClass = isKPI
                                                                                ? "bg-white border border-dashed border-gray-100"
                                                                                : (hasResult ? (isSuccess ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-50');

                                                                            const textClass = isKPI
                                                                                ? (hasResult ? (isSuccess ? "text-green-600" : "text-red-500") : "text-gray-300")
                                                                                : (hasResult ? "text-white" : "text-gray-300");

                                                                            return (
                                                                                <div className={`w-full h-3/4 rounded-md flex items-center justify-center ${cardClass} relative group/cell`}>
                                                                                    <span className={`${textClass} font-bold text-lg`}>{data.actual ?? '-'}</span>
                                                                                    <span className="absolute bottom-1 right-2 text-[8px] text-gray-400 opacity-70">/ {data.target}</span>
                                                                                    {data.comment && <div className="absolute top-1 right-1 text-[8px]">💬</div>}

                                                                                    {/* Edit Overlay */}
                                                                                    {canEdit && (
                                                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 backdrop-blur-sm bg-gray-50/90 transition-opacity z-10 rounded-md border border-gray-200 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                                                            <div className="flex flex-col gap-1 w-full p-1">
                                                                                                <div className="flex items-center gap-1 justify-center">
                                                                                                    {/* Target Input */}
                                                                                                    <input
                                                                                                        className="w-1/2 p-0.5 text-center text-[10px] bg-white border border-gray-200 rounded outline-none focus:ring-1 focus:text-blue-600 focus:ring-blue-500 text-gray-400"
                                                                                                        value={currentTargetVal}
                                                                                                        onChange={(e) => setEditingCell({ id: targetCellId, value: e.target.value })}
                                                                                                        onFocus={() => setEditingCell({ id: targetCellId, value: data.target?.toString() || '' })}
                                                                                                        onBlur={(e) => handleCommitMetric(goal.id, row.id, m, 'target', e.target.value)}
                                                                                                        placeholder="T"
                                                                                                        title="Target"
                                                                                                    />
                                                                                                    {/* Actual Input */}
                                                                                                    <input
                                                                                                        className="w-1/2 p-0.5 text-center font-bold text-xs bg-white border border-blue-200 rounded outline-none focus:ring-1 focus:text-blue-600 focus:ring-blue-500 text-gray-900"
                                                                                                        value={currentActualVal}
                                                                                                        onChange={(e) => setEditingCell({ id: actualCellId, value: e.target.value })}
                                                                                                        onFocus={() => setEditingCell({ id: actualCellId, value: data.actual?.toString() || '' })}
                                                                                                        onBlur={(e) => handleCommitMetric(goal.id, row.id, m, 'actual', e.target.value)}
                                                                                                        placeholder="A"
                                                                                                        title="Actual"
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })()
                                                                    ) : (
                                                                        // Action Row Cell
                                                                        <div className="flex w-full h-full gap-0.5">
                                                                            {MONTH_WEEKS[m].map(w => {
                                                                                const actionRow = row as ActionRow;
                                                                                const weekActions = actionRow.actions.filter(a => a.weekId === w && a.year === currentYear);

                                                                                return (
                                                                                    <div
                                                                                        key={w}
                                                                                        className="flex-1 border-r border-gray-50 last:border-0 bg-gray-50/20 p-1 flex flex-col gap-1 items-center justify-start overflow-hidden transition-colors"
                                                                                        onDragOver={(e) => {
                                                                                            e.preventDefault();
                                                                                            if (canEdit && draggedTask && draggedTask.goalId === goal.id && draggedTask.sourceWeek !== w) {
                                                                                                e.currentTarget.classList.add('bg-blue-100');
                                                                                            }
                                                                                        }}
                                                                                        onDragLeave={(e) => e.currentTarget.classList.remove('bg-blue-100')}
                                                                                        onDrop={(e) => {
                                                                                            e.preventDefault();
                                                                                            e.currentTarget.classList.remove('bg-blue-100');
                                                                                            if (canEdit && draggedTask && draggedTask.goalId === goal.id && draggedTask.sourceWeek !== w) {
                                                                                                handleMoveAction(goal.id, draggedTask.id, w);
                                                                                                setDraggedTask(null);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {weekActions.map(action => (
                                                                                            <div
                                                                                                key={action.id}
                                                                                                className={`w-full p-1 rounded text-[8px] leading-tight truncate text-left transition-all ${action.status === 'DONE'
                                                                                                    ? 'bg-green-100 text-green-700 line-through opacity-70 hover:opacity-100'
                                                                                                    : 'bg-white border border-gray-200 shadow-sm text-gray-700 hover:border-blue-300'
                                                                                                    } ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                                                                                                draggable={canEdit}
                                                                                                onDragStart={(e) => {
                                                                                                    if (canEdit) {
                                                                                                        setDraggedTask({ id: action.id, goalId: goal.id, sourceWeek: w });
                                                                                                        e.dataTransfer.effectAllowed = 'move';
                                                                                                    }
                                                                                                }}
                                                                                                title={action.title}
                                                                                                onClick={() => canEdit && handleUpdateActionStatus(goal.id, action.id)}
                                                                                            >
                                                                                                {action.title}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {goals.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <Users size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">No shared goals found</p>
                            <p className="text-sm mt-2">Members can share goals from their Obeya.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
