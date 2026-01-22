'use client';

import React, { useState } from 'react';
import { ChevronRight, Edit2, Users, Globe, Circle, TrendingUp, MessageSquare } from 'lucide-react';

// Helper functions
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

export default function SharedObeyaTracker({
    goals,
    currentUserId,
    currentYear = new Date().getFullYear(),
    readOnly = false
}: SharedObeyaTrackerProps) {
    const [collapsedOKRs, setCollapsedOKRs] = useState<Set<string>>(new Set());
    const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set());

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
                g.rows.filter(r => 'type' in r && r.type === 'OKR').map(r => r.id)
            );
            setCollapsedOKRs(new Set(allOKRIds));
        } else {
            setCollapsedOKRs(new Set());
        }
    };

    const currentWeekNum = getWeekNumber(new Date());

    return (
        <div className=\"w-full\">
    {/* Header with Expand/Collapse All */ }
    <div className=\"flex justify-between items-center mb-4\">
        < h3 className =\"text-xl font-bold text-gray-900\">Shared Goals</h3>
            < button
    onClick = { toggleExpandAll }
    className =\"px-3 py-2 rounded-md text-xs font-bold bg-white shadow-sm text-gray-600 hover:text-blue-600 border border-gray-200 transition-colors flex items-center gap-1\"
        >
        { collapsedOKRs.size === 0 ? 'Collapse All' : 'Expand All' }
                </button >
            </div >

        {/* Goals */ }
        < div className =\"space-y-4\">
    {
        goals.map(goal => {
            const categoryBgColor = goal.category === 'Health' ? 'bg-teal-600' :
                goal.category === 'Wealth' ? 'bg-emerald-600' :
                    goal.category === 'Family' ? 'bg-indigo-500' :
                        goal.category === 'Leisure' ? 'bg-pink-500' :
                            goal.category === 'Business/Career' ? 'bg-blue-700' : 'bg-gray-500';

            const isOwner = currentUserId === goal.userId;
            const canEdit = !readOnly && isOwner;

            return (
                <div key={goal.id} className=\"bg-white border border-gray-200 rounded-lg overflow-hidden\">
            {/* Vision Band */ }
                            <div className={`w-full p-3 flex items-center justify-between ${categoryBgColor}`}>
                                <div className=\"flex items-center gap-3\">
                                    <button
                                        onClick={() => toggleGoal(goal.id)}
                                        className=\"text-white/80 hover:text-white transition-colors\"
                                        title={collapsedGoals.has(goal.id) ? \"Expand goal\" : \"Collapse goal\"}
                                    >
                                        <ChevronRight className={`transition-transform ${!collapsedGoals.has(goal.id) ? 'rotate-90' : ''}`} size={20} />
                                    </button>
                                    <span className=\"text-white font-bold text-xs uppercase tracking-wide\">{goal.category}</span>
                < span className =\"text-white font-bold text-lg\">{goal.title}</span>
                    < span className =\"text-white/70 text-sm\">by {goal.userName}</span>
                                </div >
                <div className=\"flex items-center gap-2\">
            {
                goal.visibility === 'TRIBE' && <Users size={14} className=\"text-white/80\" />}
                {
                    goal.visibility === 'PUBLIC' && <Globe size={14} className=\"text-white/80\" />}
                    {
                        canEdit && <span className=\"text-xs text-white/60\">(You can edit)</span>}
                                </div >
                            </div >

                            {/* Goal Content */ }
                        {
                            !collapsedGoals.has(goal.id) && (
                                <div className=\"p-4\">
                            {/* OKRs and KPIs */ }
                            {
                                goal.rows.filter(r => 'type' in r).map((row, idx) => {
                                    const metricRow = row as MetricRow;
                                    const isOKR = metricRow.type === 'OKR';
                                    const isCollapsed = collapsedOKRs.has(metricRow.id);

                                    // Find parent OKR for KPIs
                                    let parentOKR = null;
                                    if (!isOKR) {
                                        const currentIndex = goal.rows.indexOf(row);
                                        for (let i = currentIndex - 1; i >= 0; i--) {
                                            const r = goal.rows[i];
                                            if ('type' in r && r.type === 'OKR') {
                                                parentOKR = r;
                                                break;
                                            }
                                        }
                                        if (parentOKR && collapsedOKRs.has(parentOKR.id)) {
                                            return null;
                                        }
                                    }

                                    return (
                                        <div key={metricRow.id} className=\"mb-2\">
                                    {
                                        isOKR && (
                                            <div className=\"flex items-center gap-2 py-2 border-b border-gray-100\">
                                                < button
                                        onClick = {() => toggleOKR(metricRow.id)
                                    }
                                    className =\"text-gray-400 hover:text-blue-600\"
                                        >
                                        <ChevronRight className={`transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} size={16} />
                                                        </button >
                                        <span className=\"font-bold text-gray-700 text-sm\">OKR #{idx + 1}</span>
                                            < span className =\"text-sm text-gray-600\">{metricRow.label}</span>
                                                    </div >
                                                )
                            }
                            {
                                !isOKR && (
                                    <div className=\"pl-8 py-1\">
                                        < span className =\"text-xs text-gray-500 italic\">• {metricRow.label}</span>
                                                    </div >
                                                )
    }
                                            </div >
                                        );
})}

{/* Action Plan */ }
{
    goal.rows.filter(r => !('type' in r)).map(row => {
        const actionRow = row as ActionRow;
        return (
            <div key={actionRow.id} className=\"mt-4 pt-4 border-t border-gray-200\">
                < div className =\"font-bold text-sm text-gray-700 mb-2\">{actionRow.label}</div>
                    < div className =\"space-y-1\">
        {
            actionRow.actions.slice(0, 5).map(action => (
                <div key={action.id} className=\"text-xs text-gray-600 flex items-center gap-2\">
            < span className = {`w-2 h-2 rounded-full ${action.status === 'DONE' ? 'bg-green-500' : 'bg-gray-300'}`} />
        { action.title }
                                                        </div >
                                                    ))
}
{
    actionRow.actions.length > 5 && (
        <div className=\"text-xs text-gray-400\">+{actionRow.actions.length - 5} more</div>
                                                    )
}
                                                </div >
                                            </div >
                                        );
                                    })}
                                </div >
                            )}
                        </div >
                    );
                })}
            </div >

{
    goals.length === 0 && (
        <div className=\"text-center py-12 text-gray-400\">
        <Users size = { 48 } className =\"mx-auto mb-4 opacity-50\" />
        <p className =\"font-bold\">No shared goals yet</p>
        <p className =\"text-sm\">Members can share their goals by setting visibility to \"Share with Tribe\" in their Obeya</p>
                </div>
            )}
        </div >
    );
}
