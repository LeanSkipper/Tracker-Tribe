'use client';

import React, { useEffect, useRef } from 'react';
import { Target, GripVertical } from 'lucide-react';

// Types (mirrored from Obeya logic)
type MonthlyData = { monthId: string; year: number; target: number | null; actual: number | null; comment?: string; };
type ActionCard = { id: string; weekId: string; year: number; title: string; status: 'TBD' | 'IN_PROGRESS' | 'DONE' | 'STUCK'; };
type MetricRow = { id: string; type: 'OKR' | 'KPI'; label: string; monthlyData: MonthlyData[]; targetValue: number; startValue: number; };
type ActionRow = { id: string; label: string; actions: ActionCard[]; };
type GoalCategory = { id: string; category: string; title: string; rows: (MetricRow | ActionRow)[]; };

type ViewMode = 'operational' | 'tactical' | 'strategic' | 'task' | 'team-work';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_WEEKS: Record<string, string[]> = MONTHS.reduce((acc, m, i) => {
    const startW = i * 4 + 1;
    acc[m] = [1, 2, 3, 4].map(n => `W${startW + n - 1}`);
    return acc;
}, {} as Record<string, string[]>);

type Goal = {
    id: string;
    category?: string;
    vision: string;
    okrs?: any[]; // Keeping any for OKR internal structure for now to avoid deep nesting complexity in this cleanup
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
    const goals: GoalCategory[] = (member.goals || []).map((g: any) => {
        const okrRows = (g.okrs || []).map((o: any) => {
            let parsedMonthlyData = [];
            try {
                if (typeof o.monthlyData === 'string') {
                    parsedMonthlyData = JSON.parse(o.monthlyData);
                } else if (Array.isArray(o.monthlyData)) {
                    parsedMonthlyData = o.monthlyData;
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
                monthlyData: parsedMonthlyData
            };
        });

        const allActions = (g.okrs || []).flatMap((o: any) =>
            (o.actions || []).map((a: any) => {
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
                } catch (e) {
                    console.warn('Invalid date for action:', a.id);
                }

                return {
                    id: a.id,
                    weekId: `W${weekNum}`,
                    year: year,
                    title: a.description,
                    status: a.status === 'DONE' ? 'DONE' : 'TBD'
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
        <div className="flex-1 overflow-x-auto" ref={scrollContainerRef}>
            <div className="inline-block min-w-full">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

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
                    {goals.map((goal, gIdx) => (
                        <div key={goal.id} className="border-b-4 border-slate-50 last:border-0 relative">
                            {goal.rows.map((row, rIdx) => {
                                const isOKR = 'type' in row;
                                const isKPI = isOKR && (row as MetricRow).type === 'KPI'; // Although type on row is enough

                                // View Mode Logic
                                if (viewMode === 'tactical' && !isOKR) return null; // Hide actions in Planning
                                if (viewMode === 'strategic' && (isKPI || !isOKR)) return null; // Hide KPIs and Actions in Strategy
                                if (viewMode === 'task' && isOKR) return null; // Hide OKRs/KPIs in FUP

                                return (
                                    <div key={row.id} className={`flex ${isKPI ? 'min-h-[24px]' : viewMode === 'team-work' ? 'min-h-[32px]' : 'min-h-[60px]'} ${viewMode === 'team-work' && isOKR ? 'opacity-70' : ''}`}>
                                        {/* Sidebar Label */}
                                        <div className="sticky left-0 w-[300px] shrink-0 bg-white border-r border-slate-200 z-10 flex text-sm group">
                                            <div className={`w-6 flex-shrink-0 flex items-center justify-center
                                            ${goal.category === 'Health' ? 'bg-teal-500' :
                                                    goal.category === 'Wealth' ? 'bg-emerald-500' :
                                                        goal.category === 'Family' ? 'bg-indigo-500' :
                                                            goal.category === 'Business' ? 'bg-blue-600' : 'bg-slate-400'}
                                         `} />

                                            <div className="flex-1 p-3 flex flex-col justify-center border-r border-slate-100 overflow-hidden">
                                                {rIdx === 0 && <div className="font-bold text-slate-900 truncate mb-0.5">{goal.title}</div>}
                                                <div className={`flex items-center gap-2 truncate ${rIdx === 0 ? 'text-xs text-slate-500 font-medium' : viewMode === 'team-work' ? 'text-xs text-slate-600 font-semibold' : 'text-sm text-slate-700 font-bold'}`}>
                                                    {isKPI && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                                                    {row.label}
                                                </div>
                                            </div>

                                            <div className="w-16 flex items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400 border-l border-slate-100">
                                                {isOKR ? (isKPI ? 'KPI' : 'OKR') : 'ACT'}
                                            </div>
                                        </div>

                                        {/* Data Cells */}
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
                                                        const data = (metricRow.monthlyData || []).find((d: any) => d.monthId === m && d.year === y);
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

                                                                if (viewMode === 'team-work') {
                                                                    // Team Work: Card view with drag handles
                                                                    return (
                                                                        <div key={w} className="flex-1 border-r border-slate-100 last:border-0 p-2 flex flex-col gap-2 bg-slate-50/30 min-h-[80px]">
                                                                            {weekActions.map(a => (
                                                                                <div key={a.id} draggable className={`p-2 rounded-lg border shadow-sm text-xs font-medium cursor-move hover:shadow-md transition-all ${a.status === 'DONE' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                                                                    a.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                                                                                        a.status === 'STUCK' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                                                                            'bg-white border-slate-200 text-slate-700'
                                                                                    }`}>
                                                                                    <div className="flex items-start gap-1">
                                                                                        <GripVertical size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                                                        <div className="flex-1 leading-tight">{a.title}</div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
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
                    ))}
                </div>
            </div>
        </div>
        </div>
    );
}

