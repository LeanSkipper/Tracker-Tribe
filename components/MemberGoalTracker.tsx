'use client';

import React, { useEffect, useRef } from 'react';
import { Target, GripVertical } from 'lucide-react';

// Types (mirrored from Obeya logic)
type MonthlyData = { monthId: string; year: number; target: number | null; actual: number | null; comment?: string; };
type ActionCard = { id: string; weekId: string; year: number; title: string; status: 'TBD' | 'IN_PROGRESS' | 'DONE' | 'STUCK'; };
type MetricRow = { id: string; type: 'OKR' | 'KPI'; label: string; monthlyData: MonthlyData[]; targetValue: number; startValue: number; unit?: string; };
type ActionRow = { id: string; label: string; actions: ActionCard[]; };
type GoalCategory = { id: string; category: string; title: string; rows: (MetricRow | ActionRow)[]; };

type ViewMode = 'operational' | 'tactical' | 'strategic' | 'task' | 'team-work';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_WEEKS: Record<string, string[]> = MONTHS.reduce((acc, m, i) => {
    const startW = i * 4 + 1;
    acc[m] = [1, 2, 3, 4].map(n => `W${startW + n - 1}`);
    return acc;
}, {} as Record<string, string[]>);

type GoalAction = {
    id: string;
    weekDate: string | Date;
    description: string;
    status: string;
};

type GoalOKR = {
    id: string;
    type?: 'OKR' | 'KPI';
    metricName: string;
    targetValue: number;
    currentValue: number;
    unit?: string;
    monthlyData: string | MonthlyData[];
    actions?: GoalAction[];
};

type Goal = {
    id: string;
    category?: string;
    vision: string;
    okrs?: GoalOKR[];
    loading?: boolean;
};

type Member = {
    id: string;
    name: string;
    goals: Goal[];
};

type MemberGoalTrackerProps = {
    member: Member;
    viewMode: ViewMode;
    startYear?: number;
};

const MobileGoalCard = ({ goal }: { goal: GoalCategory }) => {
    const [expanded, setExpanded] = React.useState(false);

    // Calculate current week stuff
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeekNum = Math.floor(daysSinceStart / 7) + 1;
    const currentWeekId = `W${currentWeekNum}`;

    // Filter for current week's actions
    const currentActions = goal.rows
        .filter(r => !('type' in r)) // Action Rows only
        .flatMap(r => (r as ActionRow).actions)
        .filter(a => a.weekId === currentWeekId && a.year === currentYear);

    // Metrics summary
    const metrics = goal.rows.filter(r => 'type' in r) as MetricRow[];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 overflow-hidden">
            {/* Header / Vision */}
            <div
                className={`p-4 text-white font-bold text-sm relative overflow-hidden cursor-pointer
                ${goal.category === 'Health' ? 'bg-teal-500' :
                        goal.category === 'Wealth' ? 'bg-emerald-500' :
                            goal.category === 'Family' ? 'bg-indigo-500' :
                                goal.category === 'Business' ? 'bg-blue-600' : 'bg-slate-400'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider opacity-80">{goal.category}</span>
                        <span className="text-base leading-tight">{goal.title}</span>
                    </div>
                    {/* Simple chevron or indicator could go here */}
                    <div className="bg-white/20 p-1 rounded">
                        {expanded ? 'Hide' : 'View'}
                    </div>
                </div>
            </div>

            {/* Quick Actions (Current Week) - Always Visible or prominent */}
            {currentActions.length > 0 && (
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">This Week&apos;s Focus</h4>
                    <div className="flex flex-col gap-2">
                        {currentActions.map(a => (
                            <div key={a.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    ${a.status === 'DONE' ? 'bg-emerald-100 border-emerald-500' : 'border-slate-300'}`}>
                                    {a.status === 'DONE' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${a.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                        {a.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expanded Content: KPIs & OKRs */}
            {expanded && (
                <div className="p-4 flex flex-col gap-4 bg-white animate-in slide-in-from-top-2 duration-200">
                    {metrics.length > 0 ? (
                        metrics.map(metric => {
                            // Get latest data point? Or current month?
                            // Let's show "Latest" available data for simplicity or a mini sparkline later.
                            // For now, list them.
                            const isKPI = metric.type === 'KPI';
                            const currentMonth = MONTHS[new Date().getMonth()];
                            const data = metric.monthlyData.find(d => d.monthId === currentMonth && d.year === currentYear);

                            return (
                                <div key={metric.id} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        {isKPI && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                        <span className={`text-sm ${isKPI ? 'text-slate-600' : 'text-slate-800 font-bold'}`}>{metric.label}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="textxs font-bold text-slate-900">
                                            {data?.actual ?? '-'} <span className="text-slate-400 font-normal">/ {data?.target ?? metric.targetValue}</span>
                                        </span>
                                        {metric.unit && <span className="text-[10px] text-slate-400">{metric.unit}</span>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-slate-400 text-sm py-2">No metrics defined</div>
                    )}

                    {/* View Full Plan Button? */}
                    {/* <button className="w-full py-2 mt-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200">
                       View Full Plan & History
                   </button> */}
                </div>
            )}

            {!expanded && !currentActions.length && (
                <div className="p-4 text-center text-slate-400 text-xs italic">
                    Tap to view details
                </div>
            )}
        </div>
    );
};

export default function MemberGoalTracker({ member, viewMode, startYear = 2026 }: MemberGoalTrackerProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current week on mount
    useEffect(() => {
        if (scrollContainerRef.current && viewMode === 'team-work') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
            const currentWeek = Math.floor(daysSinceStart / 7) + 1;

            // Each week column is 40rem = 640px
            const weekWidth = 640;

            // Scroll to position current week in middle with 1 week on each side
            const scrollPosition = (currentWeek - 2) * weekWidth;

            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = Math.max(0, scrollPosition);
                }
            }, 100);
        }
    }, [viewMode]);

    // Process member goals into the structure expected by the renderer
    // (Similar to ObeyaPage logic)
    const goals: GoalCategory[] = (member.goals || []).map((g: Goal) => {
        const okrRows = (g.okrs || []).map((o: GoalOKR) => {
            let parsedMonthlyData: MonthlyData[] = [];
            try {
                if (typeof o.monthlyData === 'string') {
                    parsedMonthlyData = JSON.parse(o.monthlyData);
                } else if (Array.isArray(o.monthlyData)) {
                    parsedMonthlyData = o.monthlyData as MonthlyData[];
                }
            } catch (e) {
                console.warn('Failed to parse monthlyData for OKR:', o.id, e);
            }

            return {
                id: o.id,
                type: o.type || 'OKR',
                label: o.metricName,
                targetValue: o.targetValue,
                startValue: o.currentValue,
                unit: o.unit,
                monthlyData: parsedMonthlyData
            };
        });

        const allActions = (g.okrs || []).flatMap((o: GoalOKR) =>
            (o.actions || []).map((a: GoalAction) => {
                let weekNum = 0;
                let year = 2026;
                try {
                    const weekDate = new Date(a.weekDate);
                    // Check for invalid date
                    if (!isNaN(weekDate.getTime())) {
                        year = weekDate.getFullYear();
                        const startOfYear = new Date(year, 0, 1);
                        const daysSinceStart = Math.floor((weekDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
                        weekNum = Math.floor(daysSinceStart / 7) + 1;
                    }
                } catch {
                    console.warn('Invalid date for action:', a.id);
                }

                return {
                    id: a.id,
                    weekId: `W${weekNum}`,
                    year: year,
                    title: a.description,
                    status: (['TBD', 'IN_PROGRESS', 'DONE', 'STUCK'].includes(a.status) ? a.status : 'TBD') as ActionCard['status']
                };
            })
        );

        return {
            id: g.id,
            category: g.category || 'Business',
            title: g.vision,
            rows: [...okrRows, { id: 'act-' + g.id, label: 'Action Plan', actions: allActions }]
        };
    });

    if (goals.length === 0) {
        return (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
                <Target className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No goals visible for {member.name.split(' ')[0]}</p>
            </div>
        );
    }

    return (
        <div className="flex-1" ref={scrollContainerRef}>
            {/* Mobile View (Cards) */}
            <div className="md:hidden p-4 pb-24">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Target className="text-indigo-600" /> My Tracker
                </h2>
                {goals.map(goal => (
                    <MobileGoalCard key={goal.id} goal={goal} />
                ))}
                {goals.length === 0 && (
                    <div className="text-center py-12 text-slate-400">No goals found.</div>
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:inline-block min-w-full overflow-x-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">

                    {/* Header Row (Months/Weeks) */}
                    <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 flex">
                        <div className="sticky left-0 w-[300px] shrink-0 bg-slate-50 border-r border-slate-200 z-30 p-4 font-bold text-slate-400 text-xs flex items-end">
                            STRATEGIC CONTEXT
                        </div>
                        {(viewMode === 'strategic' ?
                            Array.from({ length: 36 }, (_, i) => {
                                const yearOffset = Math.floor(i / 12);
                                const monthIndex = i % 12;
                                return { month: MONTHS[monthIndex], year: startYear + yearOffset, key: `${startYear + yearOffset}-${MONTHS[monthIndex]}` };
                            })
                            :
                            MONTHS.map(m => ({ month: m, year: startYear, key: `${startYear}-${m}` }))
                        ).map(({ month: m, year: y, key }) => (
                            <div key={key} className={`${viewMode === 'team-work' ? 'w-[40rem]' : (viewMode === 'operational' || viewMode === 'task') ? 'w-[20rem]' : viewMode === 'strategic' ? 'w-[5rem]' : 'w-[16rem]'} shrink-0 border-r border-slate-200 transition-all duration-300`}>
                                <div className="bg-slate-100/50 text-center py-1 font-bold text-slate-700 text-sm border-b border-slate-200 flex flex-col">
                                    <span>{m}</span>
                                    {viewMode === 'strategic' && <span className="text-[9px] text-slate-400 font-normal">{y}</span>}
                                </div>
                                {(viewMode === 'operational' || viewMode === 'task' || viewMode === 'team-work') ? (
                                    <div className="flex bg-slate-50">
                                        {MONTH_WEEKS[m].map(w => <div key={w} className="flex-1 text-center text-[9px] text-slate-400 py-1 border-r border-slate-100 last:border-0">{w}</div>)}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {/* Goals & Rows */}
                    {goals.map((goal) => (
                        <div key={goal.id} className="border-b-4 border-slate-50 last:border-0 relative">
                            <div className="flex border-b-4 border-slate-50 last:border-0 relative bg-white">
                                {/* 1. Left Sticky Column (Merged Vision + Labels) */}
                                <div className="sticky left-0 w-[300px] shrink-0 bg-white border-r border-slate-200 z-10 flex shadow-sm">
                                    {/* Merged Vision Bar */}
                                    <div className={`w-[2rem] flex flex-col items-center justify-center font-bold text-white text-[10px] text-center leading-tight relative overflow-hidden py-2
                                ${goal.category === 'Health' ? 'bg-teal-500' :
                                            goal.category === 'Wealth' ? 'bg-emerald-500' :
                                                goal.category === 'Family' ? 'bg-indigo-500' :
                                                    goal.category === 'Business' ? 'bg-blue-600' : 'bg-slate-400'}
                             `}>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                                        <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1 rounded bg-black/10 text-[8px] whitespace-normal w-full break-words mb-2 z-10">{goal.category.substring(0, 3)}</div>

                                        <div className="writing-vertical-rl text-orientation-mixed transform rotate-180 uppercase tracking-widest whitespace-normal break-words w-full flex items-center justify-center grow">
                                            {goal.title}
                                        </div>
                                    </div>

                                    {/* Labels Column */}
                                    <div className="flex-1 flex flex-col w-[calc(300px-2rem)]">
                                        {goal.rows.map((row, rIdx) => {
                                            const isOKR = 'type' in row;
                                            const isKPI = isOKR && (row as MetricRow).type === 'KPI';

                                            // Determine exact height
                                            let heightClass = 'h-[45px]';
                                            if (!isOKR && !isKPI) {
                                                const actionRow = row as ActionRow;
                                                const actionCounts = MONTHS.flatMap(m => MONTH_WEEKS[m].map(w =>
                                                    actionRow.actions.filter(a => a.weekId === w && a.year === startYear).length
                                                ));
                                                const maxTasks = Math.max(0, ...actionCounts);
                                                // Base height 96px, add 40px per task if more than 2
                                                const dynamicHeight = Math.max(96, maxTasks * 50 + 20);
                                                heightClass = `h-[${dynamicHeight}px]`;
                                            }

                                            if (viewMode === 'tactical' && !isOKR) return null;
                                            if (viewMode === 'strategic' && (isKPI || !isOKR)) return null;
                                            if (viewMode === 'task' && isOKR) return null;

                                            return (
                                                <div key={row.id} className={`${heightClass} w-full flex items-center border-b border-slate-50 last:border-0 group relative ${viewMode === 'team-work' && isOKR ? 'opacity-70' : ''}`}>
                                                    <div className="flex-1 p-3 flex flex-col justify-center border-r border-slate-100 overflow-hidden h-full">
                                                        <div className={`flex items-center gap-2 whitespace-normal break-words leading-tight ${rIdx === 0 ? 'text-xs text-slate-500 font-medium' : viewMode === 'team-work' ? 'text-xs text-slate-600 font-semibold' : 'text-sm text-slate-700 font-bold'} ${isOKR ? 'font-bold' : ''}`}>
                                                            {isKPI && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                                                            {row.label}
                                                        </div>
                                                    </div>

                                                    <div className="w-16 flex flex-col items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400 border-l border-slate-100 h-full">
                                                        <span>{isOKR ? (isKPI ? 'KPI' : 'OKR') : 'ACT'}</span>
                                                        {isOKR && (row as MetricRow).unit && <span className="text-[9px] text-slate-300">({(row as MetricRow).unit})</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. Data Columns (Right Side) */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {goal.rows.map((row) => {
                                        const isOKR = 'type' in row;
                                        const isKPI = isOKR && (row as MetricRow).type === 'KPI';

                                        // Sync Height
                                        let heightClass = 'h-[45px]';
                                        if (!isOKR && !isKPI) {
                                            const actionRow = row as ActionRow;
                                            const actionCounts = MONTHS.flatMap(m => MONTH_WEEKS[m].map(w =>
                                                actionRow.actions.filter(a => a.weekId === w && a.year === startYear).length
                                            ));
                                            const maxTasks = Math.max(0, ...actionCounts);
                                            const dynamicHeight = Math.max(96, maxTasks * 50 + 20);
                                            heightClass = `h-[${dynamicHeight}px]`;
                                        }

                                        if (viewMode === 'tactical' && !isOKR) return null;
                                        if (viewMode === 'strategic' && (isKPI || !isOKR)) return null;
                                        if (viewMode === 'task' && isOKR) return null;

                                        return (
                                            <div key={row.id} className={`flex ${heightClass} ${viewMode === 'team-work' && isOKR ? 'opacity-70' : ''}`}>
                                                {(viewMode === 'strategic' ?
                                                    Array.from({ length: 36 }, (_, i) => {
                                                        const yearOffset = Math.floor(i / 12);
                                                        const monthIndex = i % 12;
                                                        const m = MONTHS[monthIndex] || 'Err';
                                                        return { month: m, year: startYear + yearOffset, key: `${startYear + yearOffset}-${m}` };
                                                    })
                                                    :
                                                    MONTHS.map(m => ({ month: m, year: startYear, key: `${startYear}-${m}` }))
                                                ).map(({ month: m, year: y, key }) => (
                                                    <div key={key} className={`${viewMode === 'team-work' ? 'w-[40rem]' : (viewMode === 'operational' || viewMode === 'task') ? 'w-[20rem]' : viewMode === 'strategic' ? 'w-[5rem]' : 'w-[16rem]'} shrink-0 border-r border-slate-100 flex items-center justify-center p-1 transition-all`}>
                                                        {isOKR ? (
                                                            (() => {
                                                                const metricRow = row as MetricRow;
                                                                const data = (metricRow.monthlyData || []).find((d) => d.monthId === m && d.year === y);
                                                                const hasData = data && data.target !== null;
                                                                const hasResult = data && data.actual !== null && data.actual !== undefined;

                                                                if (!hasData) return <span className="text-slate-200 text-[10px]">-</span>;

                                                                const isSuccess = hasResult && (metricRow.targetValue >= metricRow.startValue
                                                                    ? (Number(data.actual) >= Number(data.target))
                                                                    : (Number(data.actual) <= Number(data.target)));

                                                                if (isKPI) {
                                                                    if (!hasResult) return <span className="text-slate-300 text-[10px]">-</span>;
                                                                    return <span className={`${viewMode === 'team-work' ? 'text-[10px]' : 'text-xs'} font-bold ${isSuccess ? 'text-emerald-600' : 'text-rose-500'}`}>{data.actual}</span>;
                                                                } else {
                                                                    if (!hasResult) return <div className="w-full h-full bg-slate-50/50 rounded flex items-center justify-center"><span className="text-slate-300 text-[10px]">-</span></div>;
                                                                    return (
                                                                        <div className={`w-full ${viewMode === 'team-work' ? 'h-6' : 'h-full'} rounded-md flex flex-col items-center justify-center shadow-sm ${isSuccess ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                                                                            <span className={`text-white font-black ${viewMode === 'team-work' ? 'text-xs' : 'text-sm'}`}>{data.actual}</span>
                                                                        </div>
                                                                    );
                                                                }
                                                            })()
                                                        ) : (
                                                            // Action Row
                                                            (viewMode === 'operational' || viewMode === 'task' || viewMode === 'team-work') ? (
                                                                <div className="flex w-full h-full gap-1">
                                                                    {MONTH_WEEKS[m].map(w => {
                                                                        const weekActions = (row as ActionRow).actions.filter(a => a.weekId === w && a.year === y);
                                                                        const tbd = weekActions.filter(a => a.status === 'TBD').length;
                                                                        const done = weekActions.filter(a => a.status === 'DONE').length;

                                                                        if (viewMode === 'team-work' || viewMode === 'task') {
                                                                            // Team Work & Pit Stop: Card view with drag handles
                                                                            // Group tasks: WIP (Not Done) vs Done
                                                                            const wipTasks = weekActions.filter(a => a.status !== 'DONE');
                                                                            const doneTasks = weekActions.filter(a => a.status === 'DONE');

                                                                            return (
                                                                                <div key={w} className="flex-1 border-r border-slate-100 last:border-0 p-2 flex flex-col gap-2 bg-slate-50/30 min-h-[80px]">
                                                                                    {/* WIP Label for Pit Stop */}
                                                                                    {viewMode === 'task' && weekActions.length > 0 && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">WIP</div>}

                                                                                    {wipTasks.map(a => (
                                                                                        <div key={a.id} draggable className={`p-2 rounded-lg border shadow-sm text-xs font-medium cursor-move hover:shadow-md transition-all ${a.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                                                                                            a.status === 'STUCK' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                                                                                'bg-white border-slate-200 text-slate-700'
                                                                                            }`}>
                                                                                            <div className="flex items-start gap-1">
                                                                                                <GripVertical size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                                                                <div className="flex-1 leading-tight">{a.title}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}

                                                                                    {/* Collapsed Done Tasks */}
                                                                                    {doneTasks.length > 0 && (
                                                                                        <div className="mt-2">
                                                                                            <details className="group">
                                                                                                <summary className="text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer list-none flex items-center gap-1 hover:text-slate-600">
                                                                                                    <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">{doneTasks.length}</span>
                                                                                                    <span>Done</span>
                                                                                                </summary>
                                                                                                <div className="flex flex-col gap-1 mt-1 pl-2 border-l-2 border-emerald-100/50">
                                                                                                    {doneTasks.map(a => (
                                                                                                        <div key={a.id} className="text-[10px] text-slate-400 line-through truncate px-1">
                                                                                                            {a.title}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </details>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div key={w} className="flex-1 border-r border-slate-50 last:border-0 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-help" title={weekActions.map(a => `- ${a.title}`).join('\n')}>
                                                                                {weekActions.length > 0 && (
                                                                                    <div className="flex flex-col gap-0.5 items-center">
                                                                                        {done > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />}
                                                                                        {tbd > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm" />}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                // Tactical/Strategic - No actions shown or simple summary
                                                                null
                                                            )
                                                        )}

                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

