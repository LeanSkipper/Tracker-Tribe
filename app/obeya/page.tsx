'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Coach from '@/components/Coach';
import DemoDataBanner from '@/components/DemoDataBanner';
import { ChevronLeft, ChevronRight, Plus, Calendar, Layout, Award, Target, TrendingUp, Edit2, BarChart2, BookOpen, Clock, Archive, CheckCircle2, X, Users, Trash2, Circle } from 'lucide-react';
import InspirationModal from '@/components/InspirationModal';
import PitStopModal from '@/components/PitStop/PitStopModal';
import PitStopViewModal from '@/components/PitStop/PitStopViewModal';
import { GoalTemplate } from '@/lib/goalTemplates';
import KanbanBoard from '@/components/KanbanBoard';


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LIFE_AREAS = ['Health', 'Family', 'Wealth', 'Business/Career', 'Leisure', 'Social/Environment'];
const MONTH_WEEKS: Record<string, string[]> = MONTHS.reduce((acc, m, i) => {
    const startW = i * 4 + 1;
    acc[m] = [1, 2, 3, 4].map(n => `W${startW + n - 1}`);
    return acc;
}, {} as Record<string, string[]>);

type MonthlyData = { monthId: string; year: number; target: number | null; actual: number | null; comment?: string; };
type ActionCard = { id: string; weekId: string; year: number; title: string; status: 'TBD' | 'IN_PROGRESS' | 'DONE' | 'STUCK'; };
type MetricRow = {
    id: string;
    type: 'OKR' | 'KPI';
    label: string;
    unit: string;
    startValue: number;
    targetValue: number;
    startYear: number;
    startMonth: number;
    deadlineYear: number;
    deadlineMonth: number;
    monthlyData: MonthlyData[];
    sharedTribeIds?: string[]; // Granular sharing
};
type ActionRow = { id: string; label: string; actions: ActionCard[]; };
type GoalCategory = { id: string; category: string; title: string; isShared?: boolean; rows: (MetricRow | ActionRow)[]; };

const generateMonthlyTargets = (start: number, end: number, startYear: number, startMonth: number, endYear: number, endMonth: number) => {
    const data: MonthlyData[] = [];
    const totalMonths = ((endYear - startYear) * 12 + endMonth) - startMonth;
    const step = totalMonths > 0 ? (end - start) / totalMonths : 0;

    for (let y = 2025; y <= 2035; y++) {
        for (let m = 0; m < 12; m++) {
            const currentAbsMonth = (y - startYear) * 12 + (m - startMonth);
            const endAbsMonth = (endYear - startYear) * 12 + (endMonth - startMonth);
            let target: number | null = null;
            if (y < startYear || (y === startYear && m < startMonth)) target = null;
            else if (y === startYear && m === startMonth) target = start;
            else if (currentAbsMonth <= endAbsMonth) target = start + (step * currentAbsMonth);
            else target = end;

            data.push({
                monthId: MONTHS[m],
                year: y,
                target: target !== null ? parseFloat(target.toFixed(2)) : null,
                actual: null
            });
        }
    }
    return data;
};

// --- COMPONENTS ---

type Tribe = { id: string; name: string };

const TribeSelector = ({ selectedTribeIds, allTribes, onChange }: { selectedTribeIds: string[], allTribes: Tribe[], onChange: (ids: string[]) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-[9px] px-2 py-1 rounded-full border flex items-center gap-1 font-bold whitespace-nowrap transition-colors
                    ${selectedTribeIds.length > 0
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                    }`}
            >
                <Users size={10} />
                {selectedTribeIds.length === 0 ? 'Share...' :
                    selectedTribeIds.length === allTribes.length ? 'All Tribes' :
                        `${selectedTribeIds.length} Tribe${selectedTribeIds.length > 1 ? 's' : ''}`}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2 overflow-hidden">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-2">Share with...</div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {allTribes.map(tribe => {
                                const isSelected = selectedTribeIds.includes(tribe.id);
                                return (
                                    <button
                                        key={tribe.id}
                                        onClick={() => {
                                            if (isSelected) onChange(selectedTribeIds.filter(id => id !== tribe.id));
                                            else onChange([...selectedTribeIds, tribe.id]);
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between group
                                            ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <span className="truncate">{tribe.name}</span>
                                        {isSelected && <CheckCircle2 size={12} />}
                                    </button>
                                )
                            })}
                            {allTribes.length === 0 && <div className="text-xs text-gray-400 px-2 italic">You are not in any tribes</div>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const GoalModal = ({ goal, onClose, onSave, onDelete }: { goal?: GoalCategory, onClose: () => void, onSave: (g: GoalCategory) => void, onDelete: (id: string) => void }) => {
    const existingOKRs = (goal?.rows?.filter(r => 'type' in r && r.type === 'OKR') as MetricRow[]) || [];
    const existingKPIs = (goal?.rows?.filter(r => 'type' in r && r.type === 'KPI') as MetricRow[]) || [];

    const [vision, setVision] = useState(goal?.title || '');
    const [category, setCategory] = useState(goal?.category || LIFE_AREAS[0]);
    const [isShared, setIsShared] = useState(!!goal?.isShared);
    const [myTribes, setMyTribes] = useState<Tribe[]>([]);

    useEffect(() => {
        fetch('/api/tribes/mine')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMyTribes(data);
            })
            .catch(err => console.error("Failed to fetch my tribes", err));
    }, []);

    const [okrs, setOkrs] = useState<Omit<MetricRow, 'monthlyData'>[]>(() =>
        existingOKRs.length > 0
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ? existingOKRs.map(({ monthlyData, ...rest }) => rest)
            : [{
                id: 'okr-' + Date.now(),
                type: 'OKR',
                label: 'Main Metric',
                unit: '',
                startValue: 0,
                targetValue: 100,
                startYear: 2025,
                startMonth: new Date().getMonth(),
                deadlineYear: 2026,
                deadlineMonth: 11
            }]
    );

    const [kpis, setKpis] = useState<{ id: string; label: string; target: number }[]>(
        existingKPIs.length > 0 ? existingKPIs.map(k => ({ id: k.id, label: k.label, target: k.targetValue })) : []
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[var(--primary)]">{goal ? 'Edit Goal' : 'New Strategic Goal'}</h3>
                    {/* Share Toggle */}
                    <button
                        onClick={() => setIsShared(!isShared)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-1.5 border-2
                            ${isShared ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gray-50 text-gray-400 border-gray-100'}
                        `}
                    >
                        <Users size={12} />
                        {isShared ? 'Shared (Custom)' : 'Private Goal'}
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Area of Life</label>
                            <select className="w-full p-2 border rounded-lg text-sm" value={category} onChange={e => setCategory(e.target.value)}>{LIFE_AREAS.map(area => <option key={area} value={area}>{area}</option>)}</select></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Vision Title</label>
                            <input className="w-full p-2 border rounded-lg text-sm" value={vision} onChange={e => setVision(e.target.value)} placeholder="e.g., Ironman Hawaii" /></div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="block text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-2"><Target size={14} /> Strategic OKRs (Results)</label>
                            {okrs.length < 3 && <button onClick={() => setOkrs([...okrs, { ...okrs[0], id: 'okr-' + Date.now() + Math.random(), label: 'New OKR' }])} className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-full font-bold flex items-center gap-1"><Plus size={10} /> Add OKR</button>}
                        </div>

                        {okrs.map((okr, idx) => (
                            <div key={okr.id} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative group/okr">
                                {idx > 0 && <button onClick={() => setOkrs(okrs.filter((_, i) => i !== idx))} className="absolute right-2 top-2 p-1 text-blue-300 hover:text-red-500 opacity-0 group-hover/okr:opacity-100 transition-opacity"><X size={14} /></button>}
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <input className="w-full p-2 border rounded-lg bg-white font-bold text-gray-700 text-sm" value={okr.label} onChange={e => { const n = [...okrs]; n[idx].label = e.target.value; setOkrs(n) }} placeholder="OKR Metric Name" />
                                    {isShared && (
                                        <div className="pt-2">
                                            <TribeSelector
                                                allTribes={myTribes}
                                                selectedTribeIds={okr.sharedTribeIds || []}
                                                onChange={(ids) => {
                                                    const n = [...okrs];
                                                    n[idx].sharedTribeIds = ids;
                                                    setOkrs(n);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Start Val</label><input type="number" className="w-full p-2 border rounded-lg bg-white text-sm" value={okr.startValue} onChange={e => { const n = [...okrs]; n[idx].startValue = Number(e.target.value); setOkrs(n) }} /></div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Target Val</label><input type="number" className="w-full p-2 border rounded-lg bg-white text-sm" value={okr.targetValue} onChange={e => { const n = [...okrs]; n[idx].targetValue = Number(e.target.value); setOkrs(n) }} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-blue-100">
                                    <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Start Date</label><div className="flex gap-1"><select className="w-full p-1 border rounded bg-white text-[10px]" value={okr.startMonth} onChange={e => { const n = [...okrs]; n[idx].startMonth = Number(e.target.value); setOkrs(n) }}>{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select><input type="number" className="w-16 p-1 border rounded bg-white text-[10px]" value={okr.startYear} onChange={e => { const n = [...okrs]; n[idx].startYear = Number(e.target.value); setOkrs(n) }} /></div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Deadline</label><div className="flex gap-1"><select className="w-full p-1 border rounded bg-white text-[10px]" value={okr.deadlineMonth} onChange={e => { const n = [...okrs]; n[idx].deadlineMonth = Number(e.target.value); setOkrs(n) }}>{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select><input type="number" className="w-16 p-1 border rounded bg-white text-[10px]" value={okr.deadlineYear} onChange={e => { const n = [...okrs]; n[idx].deadlineYear = Number(e.target.value); setOkrs(n) }} /></div></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Shared System KPIs</label>
                            {kpis.length < 3 && <button onClick={() => setKpis([...kpis, { id: 'new-' + Date.now(), label: '', target: 10 }])} className="text-[10px] bg-white border border-gray-200 hover:bg-gray-100 px-2 py-1 rounded-full font-bold flex items-center gap-1"><Plus size={10} /> Add KPI</button>}
                        </div>
                        <div className="space-y-2">
                            {kpis.map((kpi, idx) => (
                                <div key={kpi.id} className="flex gap-2 items-center">
                                    <input className="flex-1 p-2 border rounded-lg text-xs bg-white" placeholder="KPI Name" value={kpi.label} onChange={e => { const n = [...kpis]; n[idx].label = e.target.value; setKpis(n) }} />
                                    <div className="w-24 relative"><input type="number" className="w-full p-2 pl-6 border rounded-lg text-xs bg-white" value={kpi.target} onChange={e => { const n = [...kpis]; n[idx].target = Number(e.target.value); setKpis(n) }} /><span className="absolute left-2 top-2 text-gray-400 text-[10px]">T:</span></div>
                                    <button onClick={() => setKpis(kpis.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => {
                            const okrRows = okrs.map(o => {
                                const ex = existingOKRs.find(e => e.id === o.id);
                                const targets = generateMonthlyTargets(o.startValue, o.targetValue, o.startYear, o.startMonth, o.deadlineYear, o.deadlineMonth);
                                return {
                                    ...o,
                                    monthlyData: targets.map(d => {
                                        const e = ex?.monthlyData?.find(x => x.monthId === d.monthId && x.year === d.year);
                                        return e ? { ...d, actual: e.actual } : d;
                                    })
                                } as MetricRow;
                            });

                            const kpiRows = kpis.map(k => {
                                const ex = existingKPIs.find(e => e.id === k.id);
                                const refOkr = okrs[0];
                                const t = generateMonthlyTargets(k.target, k.target, refOkr.startYear, refOkr.startMonth, refOkr.deadlineYear, refOkr.deadlineMonth);
                                return {
                                    id: k.id.startsWith('new-') ? 'kpi-' + Date.now() + Math.random() : k.id,
                                    type: 'KPI',
                                    label: k.label,
                                    unit: '',
                                    startValue: k.target,
                                    targetValue: k.target,
                                    startYear: refOkr.startYear,
                                    startMonth: refOkr.startMonth,
                                    deadlineYear: refOkr.deadlineYear,
                                    deadlineMonth: refOkr.deadlineMonth,
                                    monthlyData: t.map(d => {
                                        const e = ex?.monthlyData?.find(x => x.monthId === d.monthId && x.year === d.year);
                                        return e ? { ...d, actual: e.actual } : d;
                                    })
                                } as MetricRow;
                            });

                            const actionRow = (goal?.rows?.find(r => !('type' in r)) || { id: 'act-' + Date.now(), label: 'Action Plan', actions: [] }) as ActionRow;
                            onSave({ id: goal?.id || Date.now().toString(), category, title: vision, rows: [...okrRows, ...kpiRows, actionRow], isShared } as any);
                        }} className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-800 transition-colors">Save Goal Group</button>
                        {goal && goal.id !== 'NEW' && <button onClick={() => { if (window.confirm('Delete this goal group?')) onDelete(goal.id); }} className="px-4 py-3 bg-red-50 text-red-500 font-bold hover:bg-red-100 rounded-xl border border-red-100"><Trash2 size={18} /></button>}
                        <button onClick={onClose} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Kanban with Drag & Drop + Inline Editing
const WeekSummaryModal = ({ actions, week, onClose, onAdd, onUpdateStatus, onUpdateTitle }: {
    actions: ActionCard[],
    week: string,
    onClose: () => void,
    onAdd: (title: string) => void,
    onUpdateStatus: (cardId: string, newStatus: 'TBD' | 'DONE') => void,
    onUpdateTitle: (cardId: string, newTitle: string) => void
}) => {
    const [newTask, setNewTask] = useState('');
    const [draggedCard, setDraggedCard] = useState<string | null>(null);
    const [editingCard, setEditingCard] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleDragStart = (cardId: string) => setDraggedCard(cardId);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (newStatus: 'TBD' | 'DONE') => {
        if (draggedCard) {
            onUpdateStatus(draggedCard, newStatus);
            setDraggedCard(null);
        }
    };

    const startEdit = (card: ActionCard) => {
        setEditingCard(card.id);
        setEditValue(card.title);
    };

    const finishEdit = (cardId: string) => {
        if (editValue.trim()) onUpdateTitle(cardId, editValue.trim());
        setEditingCard(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2"><Layout size={24} /> Week {week} Actions</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden mb-4">
                    {(['TBD', 'DONE'] as const).map(status => (
                        <div
                            key={status}
                            className="bg-gray-50 p-4 rounded-xl flex flex-col gap-3 h-full overflow-y-auto border-2 border-transparent transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(status)}
                        >
                            <div className="font-bold text-sm text-gray-500 flex items-center gap-2">
                                {status === 'TBD' && <Circle size={14} className="text-gray-400" />}
                                {status === 'DONE' && <CheckCircle2 size={14} className="text-green-500" />}
                                {status}
                            </div>
                            {actions.filter(a => a.status === status).map(card => (
                                <div
                                    key={card.id}
                                    draggable
                                    onDragStart={() => handleDragStart(card.id)}
                                    onClick={() => !editingCard && startEdit(card)}
                                    className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm font-medium cursor-move hover:shadow-md transition-all ${draggedCard === card.id ? 'opacity-50' : ''}`}
                                >
                                    {editingCard === card.id ? (
                                        <input
                                            className="w-full outline-none border-b border-blue-500"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onBlur={() => finishEdit(card.id)}
                                            onKeyDown={e => e.key === 'Enter' && finishEdit(card.id)}
                                            autoFocus
                                        />
                                    ) : (
                                        card.title
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input className="flex-1 p-2 border rounded-xl" placeholder="New Task..." value={newTask} onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { onAdd(newTask); setNewTask(''); } }} />
                    <button onClick={() => { onAdd(newTask); setNewTask(''); }} className="bg-[var(--primary)] text-white px-4 rounded-xl font-bold">Add</button>
                </div>
            </div>
        </div>
    );
};

// Task Detail Modal for FUP view
const TaskDetailModal = ({ action, onClose }: { action: ActionCard, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[var(--primary)]">Task Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-500 uppercase">Task</label>
                        <p className="text-base text-gray-900 mt-1">{action.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase">Week</label>
                            <p className="text-base text-gray-900 mt-1">{action.weekId}</p>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase">Status</label>
                            <p className="text-base text-gray-900 mt-1">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${action.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {action.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GraphModal = ({ metric, onClose }: { metric: MetricRow, onClose: () => void }) => {
    const width = 600;
    const height = 300;
    const padding = 40;
    const data = metric.monthlyData.slice(0, 12).filter(d => d.target !== null);
    if (data.length < 2) return null;

    const maxVal = Math.max(...data.map(d => Math.max(d.target || 0, d.actual || 0))) * 1.1;
    const minVal = Math.min(...data.map(d => Math.min(d.target || 0, d.actual || 0))) * 0.9;
    const range = maxVal - minVal || 1;

    const getX = (i: number) => padding + (i * ((width - padding * 2) / (data.length - 1)));
    const getY = (val: number) => height - padding - ((val - minVal) / range) * (height - padding * 2);
    const targetPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.target!)}`).join(' ');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2"><BarChart2 /> {metric.label} Trend</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex justify-center">
                    <svg width={width} height={height} className="overflow-visible">
                        {[0, 0.25, 0.5, 0.75, 1].map(t => { const y = height - padding - (t * (height - padding * 2)); return <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4" /> })}
                        <path d={targetPath} fill="none" stroke="black" strokeWidth="2" strokeDasharray="4" opacity="0.5" />
                        <path d={data.filter(d => d.actual !== null).map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(data.indexOf(d))} ${getY(d.actual!)}`).join(' ')} fill="none" stroke="#9ca3af" strokeWidth="1" opacity="0.3" />
                        {data.map((d, i) => {
                            if (d.target === null) return null;
                            const isHigherBetter = metric.targetValue >= metric.startValue;
                            return (
                                <g key={i}>
                                    <text x={getX(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.monthId}</text>
                                    {d.actual !== null && (
                                        <circle cx={getX(i)} cy={getY(d.actual)} r="5" fill={(isHigherBetter && d.actual >= d.target!) || (!isHigherBetter && d.actual <= d.target!) ? "#22c55e" : "#ef4444"} stroke="white" strokeWidth="2" />
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
};

const CommentModal = ({ goalId, rowId, monthData, onClose, onSave }: {
    goalId: string,
    rowId: string,
    monthData: MonthlyData,
    onClose: () => void,
    onSave: (comment: string) => void
}) => {
    const [comment, setComment] = useState(monthData.comment || '');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
                        💬 {monthData.monthId} {monthData.year} Note
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {monthData.actual !== null && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Target:</span>
                                <span className="font-bold text-gray-900">{monthData.target}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-gray-600">Actual:</span>
                                <span className="font-bold text-blue-600">{monthData.actual}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Your Notes
                        </label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none resize-none"
                            rows={6}
                            placeholder="Add your thoughts, learnings, or context about this month's result..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                onSave(comment);
                                onClose();
                            }}
                            className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
                        >
                            Save Note
                        </button>
                        {comment && (
                            <button
                                onClick={() => {
                                    onSave('');
                                    onClose();
                                }}
                                className="px-4 py-3 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-xl border border-red-100"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

type ObeyaViewMode = 'operational' | 'tactical' | 'strategic' | 'task' | 'chart';

export default function ObeyaPage() {
    const [currentYear, setCurrentYear] = useState(2026);
    const [viewMode, setViewMode] = useState<ObeyaViewMode>('operational');
    const [isLoaded, setIsLoaded] = useState(false);
    const [goals, setGoals] = useState<GoalCategory[]>([]);
    const [draggedTask, setDraggedTask] = useState<{ goalId: string; actionId: string; sourceWeek: string } | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState<string>('');

    const [editingCell, setEditingCell] = useState<{ id: string, value: string } | null>(null);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await fetch('/api/goals');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setGoals(data.map((g: any) => {
                        // Map OKRs and KPIs
                        const okrRows = (g.okrs || []).map((o: any) => ({
                            id: o.id,
                            type: o.type || 'OKR',
                            label: o.metricName,
                            unit: '',
                            targetValue: o.targetValue,
                            startValue: o.currentValue,
                            startYear: o.startYear || 2026,
                            startMonth: o.startMonth || 0,
                            deadlineYear: o.deadlineYear || 2026,
                            deadlineMonth: o.deadlineMonth || 11,
                            // Use monthlyData from API if available, otherwise generate
                            monthlyData: o.monthlyData || generateMonthlyTargets(
                                o.currentValue,
                                o.targetValue,
                                o.startYear || 2025,
                                o.startMonth || 0,
                                o.deadlineYear || 2026,
                                o.deadlineMonth || 11
                            ),
                            sharedTribeIds: o.sharedTribes ? o.sharedTribes.map((t: any) => t.id) : []
                        }));

                        // Collect Actions from all OKRs into one ActionRow for the UI group
                        const allActions = (g.okrs || []).flatMap((o: any) =>
                            (o.actions || []).map((a: any) => {
                                // Convert weekDate back to weekId
                                const weekDate = new Date(a.weekDate);
                                const startOfYear = new Date(weekDate.getFullYear(), 0, 1);
                                const daysSinceStart = Math.floor((weekDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
                                const weekNum = Math.floor(daysSinceStart / 7) + 1;

                                return {
                                    id: a.id,
                                    weekId: `W${weekNum}`,
                                    year: weekDate.getFullYear(),
                                    title: a.description,
                                    status: a.status === 'DONE' ? 'DONE' : 'TBD'
                                };
                            })
                        );

                        const actionRow = {
                            id: 'act-' + g.id,
                            label: 'Action Plan',
                            actions: allActions
                        };

                        return {
                            id: g.id,
                            category: g.category || 'Business/Career',
                            title: g.vision,
                            isShared: g.visibility === 'TRIBE', // Map visibility to isShared
                            rows: [...okrRows, actionRow]
                        };
                    }));
                }
                setIsLoaded(true);
            } catch (err) {
                console.error("Fetch Goals Failed:", err);
                setIsLoaded(true);
            }
        };
        fetchGoals();
    }, []);

    const [editingGoal, setEditingGoal] = useState<GoalCategory | null>(null);
    const [activeWeekModal, setActiveWeekModal] = useState<{ week: string, goalId: string } | null>(null);
    const [activeGraphModal, setActiveGraphModal] = useState<MetricRow | null>(null);
    const [activeCommentModal, setActiveCommentModal] = useState<{ goalId: string, rowId: string, monthData: MonthlyData } | null>(null);
    const [activeTaskDetailModal, setActiveTaskDetailModal] = useState<{ goalId: string, action: ActionCard } | null>(null);
    const [isInspirationOpen, setIsInspirationOpen] = useState(false);

    // Pit Stop State
    const [isPitStopOpen, setIsPitStopOpen] = useState(false);
    const [viewingPitStop, setViewingPitStop] = useState<any>(null);
    const [pitStops, setPitStops] = useState<any[]>([]);

    useEffect(() => {
        const fetchPitStops = async () => {
            try {
                const res = await fetch('/api/pit-stop');
                if (res.ok) {
                    const data = await res.json();
                    setPitStops(data.pitStops || []);
                }
            } catch (err) {
                console.error("Failed to fetch pit stops", err);
            }
        };
        fetchPitStops();
    }, [isPitStopOpen]);

    const handleSaveGoal = async (updatedGoal: GoalCategory) => {
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedGoal)
            });

            if (!res.ok) {
                // Handle error response
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error("Save Goal Failed:", errorData);
                alert(`Failed to save goal: ${errorData.error || 'Server error'}. Please try again.`);
                return; // Keep modal open on error
            }

            const savedGoal = await res.json();

            // Refetch all goals to ensure we have the latest data
            const fetchRes = await fetch('/api/goals');
            const data = await fetchRes.json();
            if (Array.isArray(data)) {
                setGoals(data.map((g: any) => {
                    const okrRows = (g.okrs || []).map((o: any) => ({
                        id: o.id,
                        type: o.type || 'OKR',
                        label: o.metricName,
                        unit: '',
                        targetValue: o.targetValue,
                        startValue: o.currentValue,
                        startYear: o.startYear || 2026,
                        startMonth: o.startMonth || 0,
                        deadlineYear: o.deadlineYear || 2026,
                        deadlineMonth: o.deadlineMonth || 11,
                        monthlyData: o.monthlyData || generateMonthlyTargets(
                            o.currentValue, o.targetValue,
                            o.startYear || 2026, o.startMonth || 0,
                            o.deadlineYear || 2026, o.deadlineMonth || 11
                        ),
                        sharedTribeIds: o.sharedTribes ? o.sharedTribes.map((t: any) => t.id) : []
                    }));

                    const allActions = (g.okrs || []).flatMap((o: any) =>
                        (o.actions || []).map((a: any) => {
                            const weekDate = new Date(a.weekDate);
                            const startOfYear = new Date(weekDate.getFullYear(), 0, 1);
                            const daysSinceStart = Math.floor((weekDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
                            const weekNum = Math.floor(daysSinceStart / 7) + 1;
                            return {
                                id: a.id,
                                weekId: `W${weekNum}`,
                                year: weekDate.getFullYear(),
                                title: a.description,
                                status: a.status === 'DONE' ? 'DONE' : 'TBD'
                            };
                        })
                    );

                    return {
                        id: g.id,
                        category: g.category || 'Business/Career',
                        title: g.vision,
                        isShared: g.visibility === 'TRIBE',
                        rows: [...okrRows, { id: 'act-' + g.id, label: 'Action Plan', actions: allActions }]
                    };
                }));
            }

            // Only close modal on success
            setEditingGoal(null);
        } catch (err) {
            console.error("Save Goal Failed:", err);
            alert('Failed to save goal. Please check your connection and try again.');
            // Keep modal open on error
        }
    };

    const handleDeleteGoal = async (id: string) => {
        try {
            const res = await fetch(`/api/goals?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error("Delete Goal Failed:", error);
                alert(`Failed to delete goal: ${error.error || 'Server error'}`);
                return;
            }

            // Remove from local state on success
            setGoals(prev => prev.filter(g => g.id !== id));
            setEditingGoal(null);
        } catch (err) {
            console.error("Delete Goal Failed:", err);
            alert('Failed to delete goal. Please check your connection and try again.');
        }
    };

    const handleCommitMetric = async (goalId: string, rowId: string, monthId: string, field: 'actual' | 'target', value: string) => {
        const numValue = value === '' ? null : parseFloat(value);

        // Update local state immediately for responsiveness
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            return {
                ...g, rows: g.rows.map(r => {
                    if (r.id !== rowId || !('monthlyData' in r)) return r;
                    return {
                        ...r, monthlyData: r.monthlyData.map(d => {
                            if (d.monthId === monthId && d.year === currentYear) return { ...d, [field]: numValue };
                            return d;
                        })
                    };
                })
            };
        }));
        setEditingCell(null);

        // Save to backend
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            // Update the monthly data in the goal before saving
            const updatedGoal = {
                ...goal,
                rows: goal.rows.map(r => {
                    if (r.id !== rowId || !('monthlyData' in r)) return r;
                    return {
                        ...r, monthlyData: r.monthlyData.map(d => {
                            if (d.monthId === monthId && d.year === currentYear) return { ...d, [field]: numValue };
                            return d;
                        })
                    };
                })
            };

            try {
                await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedGoal)
                });
            } catch (err) {
                console.error("Save metric failed:", err);
            }
        }
    };

    const handleSaveComment = async (goalId: string, rowId: string, monthId: string, year: number, comment: string) => {
        // Update local state immediately
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            return {
                ...g, rows: g.rows.map(r => {
                    if (r.id !== rowId || !('monthlyData' in r)) return r;
                    return {
                        ...r, monthlyData: r.monthlyData.map(d => {
                            if (d.monthId === monthId && d.year === year) return { ...d, comment };
                            return d;
                        })
                    };
                })
            };
        }));

        // Save to backend
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            const updatedGoal = {
                ...goal,
                rows: goal.rows.map(r => {
                    if (r.id !== rowId || !('monthlyData' in r)) return r;
                    return {
                        ...r, monthlyData: r.monthlyData.map(d => {
                            if (d.monthId === monthId && d.year === year) return { ...d, comment };
                            return d;
                        })
                    };
                })
            };

            try {
                await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedGoal)
                });
            } catch (err) {
                console.error("Save comment failed:", err);
            }
        }
    };

    const handleAddAction = async (week: string, goalId: string, title: string) => {
        if (!title.trim()) return;

        // Update local state
        let updatedGoal: GoalCategory | null = null;
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const updated = {
                ...g, rows: g.rows.map(r => {
                    if ('type' in r) return r;
                    return { ...r, actions: [...r.actions, { id: Date.now().toString(), weekId: week, year: currentYear, title, status: 'TBD' } as ActionCard] };
                })
            };
            updatedGoal = updated;
            return updated;
        }));

        // Save to backend
        if (updatedGoal) {
            try {
                await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedGoal)
                });
            } catch (err) {
                console.error("Save action failed:", err);
            }
        }
    };

    const handleAddKanbanTask = async (goalId: string, title: string) => {
        if (!title.trim()) return;

        // Get current week
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(daysSinceStart / 7) + 1;
        const weekId = `W${currentWeek}`;

        await handleAddAction(weekId, goalId, title);
    };

    const handleUpdateActionStatus = async (goalId: string, cardId: string, newStatus: 'TBD' | 'DONE') => {
        setGoals(prev => {
            const next = prev.map(g => {
                if (g.id !== goalId) return g;
                return {
                    ...g, rows: g.rows.map(r => {
                        if ('type' in r) return r;
                        return { ...r, actions: r.actions.map(a => a.id === cardId ? { ...a, status: newStatus } : a) };
                    })
                };
            });
            // Auto-persist
            const updatedGoal = next.find(g => g.id === goalId);
            if (updatedGoal) handleSaveGoal(updatedGoal);
            return next;
        });
    };

    const handleUpdateActionTitle = async (goalId: string, cardId: string, newTitle: string) => {
        setGoals(prev => {
            const next = prev.map(g => {
                if (g.id !== goalId) return g;
                return {
                    ...g, rows: g.rows.map(r => {
                        if ('type' in r) return r;
                        return { ...r, actions: r.actions.map(a => a.id === cardId ? { ...a, title: newTitle } : a) };
                    })
                };
            });
            const updatedGoal = next.find(g => g.id === goalId);
            if (updatedGoal) handleSaveGoal(updatedGoal);
            return next;
        });
    };

    const handleSelectTemplate = (template: GoalTemplate) => {
        // Convert template to GoalCategory format
        const newGoal: GoalCategory = {
            id: 'NEW',
            category: template.area,
            title: template.title,
            isShared: false,
            rows: [
                // Main OKR
                {
                    id: 'okr-1',
                    type: 'OKR',
                    label: template.metric,
                    unit: '',
                    startValue: template.startValue,
                    targetValue: template.targetValue,
                    startYear: currentYear,
                    startMonth: 0,
                    deadlineYear: currentYear,
                    deadlineMonth: 11,
                    monthlyData: generateMonthlyTargets(
                        template.startValue,
                        template.targetValue,
                        currentYear,
                        0,
                        currentYear,
                        11
                    )
                },
                // KPIs
                ...template.kpis.map((kpi, idx) => ({
                    id: `kpi-${idx + 1}`,
                    type: 'KPI' as const,
                    label: kpi,
                    unit: '',
                    startValue: 0,
                    targetValue: 100,
                    startYear: currentYear,
                    startMonth: 0,
                    deadlineYear: currentYear,
                    deadlineMonth: 11,
                    monthlyData: generateMonthlyTargets(0, 100, currentYear, 0, currentYear, 11)
                })),
                // Action Plan
                {
                    id: 'act-new',
                    label: 'Action Plan',
                    actions: []
                }
            ]
        };

        setIsInspirationOpen(false);
        setEditingGoal(newGoal);
    };

    // Check if user is a guest (no session)
    // Use optional chaining to handle SSR where useSession might be undefined
    const { data: session } = useSession() ?? { data: null };
    const isGuest = !session;

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Demo Data Banner for Guest Users */}
            {isGuest && <DemoDataBanner />}

            {isInspirationOpen && (
                <InspirationModal
                    onClose={() => setIsInspirationOpen(false)}
                    onSelectGoal={handleSelectTemplate}
                    onCreateFromScratch={() => {
                        setIsInspirationOpen(false);
                        setEditingGoal({ id: 'NEW' } as any);
                    }}
                />
            )}
            {editingGoal && <GoalModal goal={editingGoal} onClose={() => setEditingGoal(null)} onSave={handleSaveGoal} onDelete={handleDeleteGoal} />}
            {activeGraphModal && <GraphModal metric={activeGraphModal} onClose={() => setActiveGraphModal(null)} />}
            {activeWeekModal && (
                <WeekSummaryModal
                    week={activeWeekModal.week}
                    actions={(goals.find(g => g.id === activeWeekModal.goalId)?.rows.find(r => !('type' in r)) as ActionRow)?.actions.filter(a => a.weekId === activeWeekModal.week && a.year === currentYear) || []}
                    onClose={() => setActiveWeekModal(null)}
                    onAdd={(t) => handleAddAction(activeWeekModal.week, activeWeekModal.goalId, t)}
                    onUpdateStatus={(cardId, newStatus) => handleUpdateActionStatus(activeWeekModal.goalId, cardId, newStatus)}
                    onUpdateTitle={(cardId, newTitle) => handleUpdateActionTitle(activeWeekModal.goalId, cardId, newTitle)}
                />
            )}

            <PitStopModal
                isOpen={isPitStopOpen}
                onClose={() => setIsPitStopOpen(false)}
                onComplete={() => {
                    // Refetch handled by dependency
                }}
            />
            <PitStopViewModal
                isOpen={!!viewingPitStop}
                onClose={() => setViewingPitStop(null)}
                entry={viewingPitStop}
            />

            {activeCommentModal && <CommentModal
                goalId={activeCommentModal.goalId}
                rowId={activeCommentModal.rowId}
                monthData={activeCommentModal.monthData}
                onClose={() => setActiveCommentModal(null)}
                onSave={(comment) => handleSaveComment(activeCommentModal.goalId, activeCommentModal.rowId, activeCommentModal.monthData.monthId, activeCommentModal.monthData.year, comment)}
            />}

            <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2"><Target /> Goals GPS</h1>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                        <button onClick={() => setCurrentYear(currentYear - 1)} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                        <span className="text-xl font-bold text-[var(--primary)] min-w-[5rem] text-center">{currentYear}</span>
                        <button onClick={() => setCurrentYear(currentYear + 1)} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                        <button onClick={() => setViewMode('task')} className={`px-3 py-2 rounded-md transition-all text-xs font-bold ${viewMode === 'task' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="FUP: Weekly review and kanban">FUP</button>
                        <button onClick={() => setViewMode('operational')} className={`px-3 py-2 rounded-md transition-all text-xs font-bold ${viewMode === 'operational' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Execution: Full weekly details">Execution</button>
                        <button onClick={() => setViewMode('tactical')} className={`px-3 py-2 rounded-md transition-all text-xs font-bold ${viewMode === 'tactical' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Planning: OKRs + KPIs">Planning</button>
                        <button onClick={() => setViewMode('strategic')} className={`px-3 py-2 rounded-md transition-all text-xs font-bold ${viewMode === 'strategic' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Strategy: High-level roadmap">Strategy</button>
                        <button onClick={() => setViewMode('chart')} className={`px-3 py-2 rounded-md transition-all text-xs font-bold ${viewMode === 'chart' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Chart: Visual analytics"><BarChart2 size={14} className="inline mr-1" />Chart</button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPitStopOpen(true)}
                        className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all hover:scale-105"
                    >
                        <Clock size={20} /> START PIT STOP
                    </button>
                    <button
                        onClick={() => setIsInspirationOpen(true)}
                        className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-800 transition-all hover:scale-105"
                    >
                        <Plus size={22} /> GOAL
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-auto">
                {/* Chart Mode - Comprehensive Analytics View */}
                {viewMode === 'chart' ? (
                    <div className="p-6 space-y-8">
                        {goals.map(goal => {
                            const metrics = goal.rows.filter(r => 'type' in r) as MetricRow[];
                            const actionRow = goal.rows.find(r => !('type' in r)) as ActionRow | undefined;

                            return (
                                <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{goal.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{goal.category}</p>
                                        </div>
                                        <button onClick={() => setEditingGoal(goal)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {metrics.map(metric => {
                                            const dataPoints = metric.monthlyData.filter(d => d.target !== null && d.year === currentYear);
                                            if (dataPoints.length < 2) return null;

                                            const width = 500;
                                            const height = 250;
                                            const padding = 50;

                                            const maxVal = Math.max(...dataPoints.map(d => Math.max(d.target || 0, d.actual || 0))) * 1.1;
                                            const minVal = Math.min(...dataPoints.map(d => Math.min(d.target || 0, d.actual || 0))) * 0.9;
                                            const range = maxVal - minVal || 1;

                                            const getX = (i: number) => padding + (i * ((width - padding * 2) / (dataPoints.length - 1)));
                                            const getY = (val: number) => height - padding - ((val - minVal) / range) * (height - padding * 2);

                                            const targetPath = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.target!)}`).join(' ');
                                            const actualPath = dataPoints.filter(d => d.actual !== null).map((d, i) => {
                                                const originalIndex = dataPoints.indexOf(d);
                                                return `${i === 0 ? 'M' : 'L'} ${getX(originalIndex)} ${getY(d.actual!)}`;
                                            }).join(' ');

                                            const isHigherBetter = metric.targetValue >= metric.startValue;

                                            return (
                                                <div key={metric.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                                {metric.type === 'OKR' ? <Target size={16} className="text-blue-600" /> : <TrendingUp size={16} className="text-green-600" />}
                                                                {metric.label}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">{metric.type}</p>
                                                        </div>
                                                    </div>

                                                    <svg width={width} height={height} className="w-full">
                                                        {/* Grid lines */}
                                                        {[0, 0.25, 0.5, 0.75, 1].map(t => {
                                                            const y = height - padding - (t * (height - padding * 2));
                                                            return <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4" />;
                                                        })}

                                                        {/* Target line */}
                                                        <path d={targetPath} fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />

                                                        {/* Actual line */}
                                                        {actualPath && <path d={actualPath} fill="none" stroke="#3b82f6" strokeWidth="3" />}

                                                        {/* Data points */}
                                                        {dataPoints.map((d, i) => {
                                                            const x = getX(i);
                                                            const hasActual = d.actual !== null;
                                                            const isOnTarget = hasActual && (
                                                                (isHigherBetter && d.actual! >= d.target!) ||
                                                                (!isHigherBetter && d.actual! <= d.target!)
                                                            );

                                                            return (
                                                                <g key={i}>
                                                                    {/* Month label */}
                                                                    <text x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.monthId}</text>

                                                                    {/* Target marker */}
                                                                    <circle cx={x} cy={getY(d.target!)} r="3" fill="#9ca3af" opacity="0.5" />

                                                                    {/* Actual value marker (clickable for comments) */}
                                                                    {hasActual && (
                                                                        <g>
                                                                            <circle
                                                                                cx={x}
                                                                                cy={getY(d.actual!)}
                                                                                r="6"
                                                                                fill={isOnTarget ? "#22c55e" : "#ef4444"}
                                                                                stroke="white"
                                                                                strokeWidth="2"
                                                                                className="cursor-pointer hover:r-8 transition-all"
                                                                                onClick={() => setActiveCommentModal({ goalId: goal.id, rowId: metric.id, monthData: d })}
                                                                            />
                                                                            {d.comment && (
                                                                                <text x={x} y={getY(d.actual!) - 15} textAnchor="middle" fontSize="16">💬</text>
                                                                            )}
                                                                        </g>
                                                                    )}

                                                                    {/* Week action markers */}
                                                                    {actionRow && (
                                                                        (() => {
                                                                            const monthIndex = MONTHS.indexOf(d.monthId);
                                                                            const monthWeeks = MONTH_WEEKS[d.monthId];
                                                                            const weekActions = actionRow.actions.filter(a => {
                                                                                const actionWeekNum = parseInt(a.weekId.replace('W', ''));
                                                                                const monthWeekNums = monthWeeks.map(w => parseInt(w.replace('W', '')));
                                                                                return a.year === d.year && monthWeekNums.includes(actionWeekNum);
                                                                            });

                                                                            if (weekActions.length === 0) return null;

                                                                            return (
                                                                                <foreignObject x={x - 10} y={padding - 25} width="20" height="20">
                                                                                    <div
                                                                                        className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform"
                                                                                        onClick={() => {
                                                                                            const firstWeek = monthWeeks[0];
                                                                                            setActiveWeekModal({ week: firstWeek, goalId: goal.id });
                                                                                        }}
                                                                                        title={`${weekActions.length} action(s) this month`}
                                                                                    >
                                                                                        {weekActions.length}
                                                                                    </div>
                                                                                </foreignObject>
                                                                            );
                                                                        })()
                                                                    )}
                                                                </g>
                                                            );
                                                        })}

                                                        {/* Y-axis labels */}
                                                        {[0, 0.25, 0.5, 0.75, 1].map(t => {
                                                            const y = height - padding - (t * (height - padding * 2));
                                                            const value = (minVal + (range * t)).toFixed(1);
                                                            return <text key={t} x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{value}</text>;
                                                        })}
                                                    </svg>

                                                    <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-3 border-t-2 border-dashed border-gray-400"></div>
                                                            <span>Target</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-3 h-0.5 bg-blue-500"></div>
                                                            <span>Actual</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                            <span>Actions</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {goals.length === 0 && (
                            <div className="text-center py-20">
                                <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No goals to display. Create your first goal to see charts!</p>
                            </div>
                        )}
                    </div>
                ) : viewMode === 'task' ? (
                    <KanbanBoard
                        goals={goals}
                        currentYear={currentYear}
                        onUpdateStatus={handleUpdateActionStatus}
                        onUpdateTitle={handleUpdateActionTitle}
                        onAddTask={handleAddKanbanTask}
                    />
                ) : (
                    <div className="inline-block min-w-full">
                        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm flex">
                            <div className="sticky left-0 w-[400px] bg-white border-r border-gray-200 z-30 shrink-0 p-4 font-bold text-gray-400 text-xs flex items-end">STRATEGIC CONTEXT</div>
                            {(viewMode === 'strategic' ?
                                Array.from({ length: 36 }, (_, i) => {
                                    const yearOffset = Math.floor(i / 12);
                                    const monthIndex = i % 12;
                                    return { month: MONTHS[monthIndex], year: currentYear + yearOffset, key: `${currentYear + yearOffset}-${MONTHS[monthIndex]}` };
                                })
                                :
                                MONTHS.map(m => ({ month: m, year: currentYear, key: `${currentYear}-${m}` }))
                            ).map(({ month: m, year: y, key }) => (
                                <div key={key} className={`${viewMode === 'operational' ? 'w-[45rem]' : viewMode === 'strategic' ? 'w-[5rem]' : 'w-[16rem]'} shrink-0 border-r border-gray-200 transition-all duration-300`}>
                                    <div className="bg-gray-50 text-center py-1 font-bold text-[var(--primary)] text-sm border-b border-gray-100 flex flex-col">
                                        <span>{m}</span>
                                        {viewMode === 'strategic' && <span className="text-[9px] text-gray-400 font-normal">{y}</span>}
                                    </div>
                                    {viewMode === 'operational' && <div className="flex">{MONTH_WEEKS[m].map(w => {
                                        const ps = pitStops.find(p => p.week === w && p.year === currentYear);
                                        return (
                                            <div key={w} className="flex-1 text-center text-[10px] text-gray-400 py-1 border-r border-gray-50 flex flex-col items-center gap-1">
                                                <span>{w}</span>
                                                {ps && (
                                                    <button
                                                        onClick={() => setViewingPitStop(ps)}
                                                        className="text-amber-500 hover:text-amber-600 transition-colors hover:scale-110"
                                                        title="View Pit Stop"
                                                    >
                                                        <Archive size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}</div>}
                                </div>
                            ))}
                        </div>

                        {[...goals]
                            .sort((a, b) => LIFE_AREAS.indexOf(a.category) - LIFE_AREAS.indexOf(b.category))
                            .map((goal, gIdx, allGoals) => {
                                const isFirstInCat = gIdx === 0 || allGoals[gIdx - 1].category !== goal.category;
                                const okrRowsCount = goal.rows.filter(r => 'type' in r && r.type === 'OKR').length;

                                return (
                                    <div key={goal.id} className="bg-white">
                                        {isFirstInCat && gIdx > 0 && <div className="h-4 bg-gray-100 border-t border-b border-gray-200" />}
                                        <div className="flex border-b-4 border-gray-50 last:border-0 relative bg-white">
                                            {/* 1. Left Sticky Column (Merged Vision + Labels) */}
                                            <div className="sticky left-0 w-[400px] shrink-0 bg-white border-r border-gray-200 z-10 flex shadow-sm">
                                                {/* Merged Vision Bar */}
                                                <div className={`w-[2.5rem] flex flex-col items-center justify-center font-bold text-white text-[10px] text-center leading-tight relative overflow-hidden py-2
                                                ${goal.category === 'Health' ? 'bg-teal-600' :
                                                        goal.category === 'Wealth' ? 'bg-emerald-600' :
                                                            goal.category === 'Family' ? 'bg-indigo-500' :
                                                                goal.category === 'Leisure' ? 'bg-pink-500' :
                                                                    goal.category === 'Business/Career' ? 'bg-blue-700' : 'bg-gray-500'}
                                             `}>
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1 rounded bg-black/10 text-[8px] whitespace-normal w-full break-words mb-2 z-10">{goal.category.substring(0, 3)}</div>

                                                    <div className="writing-vertical-rl text-orientation-mixed transform rotate-180 uppercase tracking-widest whitespace-normal break-words w-full flex items-center justify-center grow">
                                                        {goal.title}
                                                    </div>
                                                </div>

                                                {/* Labels Column */}
                                                <div className="flex-1 flex flex-col w-[calc(400px-2.5rem)]">
                                                    {goal.rows.map((row, rIdx) => {
                                                        const isOKR = 'type' in row;
                                                        const isKPI = isOKR && (row as MetricRow).type === 'KPI';

                                                        // Determine exact height
                                                        let heightClass = 'h-[45px]';
                                                        if (!isOKR && !isKPI) {
                                                            const actionRow = row as ActionRow;
                                                            // Calculate max tasks in any visible week for this year
                                                            const actionCounts = MONTHS.flatMap(m => MONTH_WEEKS[m].map(w =>
                                                                actionRow.actions.filter(a => a.weekId === w && a.year === currentYear).length
                                                            ));
                                                            const maxTasks = Math.max(0, ...actionCounts);
                                                            const dynamicHeight = Math.max(96, maxTasks * 50 + 20);
                                                            heightClass = `h-[${dynamicHeight}px]`;
                                                        }

                                                        if (viewMode === 'tactical' && !isOKR) return null;
                                                        if (viewMode === 'strategic' && (isKPI || !isOKR)) return null;
                                                        if ((viewMode as string) === 'task' && isOKR) return null;

                                                        // Count OKR rows to decide logic if needed (e.g. strict ordering)
                                                        const okrRowsCount = goal.rows.filter(r => 'type' in r).length;

                                                        return (
                                                            <div key={row.id} className={`${heightClass} w-full flex items-center border-b border-gray-50 last:border-0 group relative`}>
                                                                <div className="w-56 p-3 flex items-center gap-2 border-r border-gray-100 relative h-full">
                                                                    {rIdx === 0 && <button onClick={() => setEditingGoal(goal)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[var(--primary)] absolute right-1 top-1 z-20"><Edit2 size={12} /></button>}
                                                                    <span className={`text-xs whitespace-normal break-words leading-tight flex-1 ${isKPI ? 'text-gray-400 pl-4 italic text-[10px] font-medium' : (!isKPI && rIdx > 0 ? 'text-gray-600 pl-1 font-bold' : (okrRowsCount > 1 ? 'text-gray-600 pl-1 font-bold' : 'hidden'))} ${isOKR ? 'font-bold' : ''}`}>
                                                                        {isKPI && <span className="inline-block w-1 h-1 bg-gray-300 rounded-full mr-2 mb-0.5" />}
                                                                        {row.label}
                                                                    </span>
                                                                    {isOKR && (
                                                                        <button onClick={() => setActiveGraphModal(row as MetricRow)} className="p-1 text-gray-300 hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <TrendingUp size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="w-20 p-2 flex flex-col items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-400 border-l border-gray-100 h-full">
                                                                    <span>{isOKR ? (isKPI ? 'KPI' : 'RESULT') : 'ACTION'}</span>
                                                                    {isOKR && (row as MetricRow).unit && <span className="text-[9px] text-gray-300">({(row as MetricRow).unit})</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* 2. Data Columns (Right Side) */}
                                            <div className="flex-1 flex flex-col min-w-0">
                                                {goal.rows.map((row, rIdx) => {
                                                    const isOKR = 'type' in row;
                                                    const isKPI = isOKR && (row as MetricRow).type === 'KPI';

                                                    // Sync Height
                                                    let heightClass = 'h-[45px]';
                                                    if (!isOKR && !isKPI) {
                                                        const actionRow = row as ActionRow;
                                                        const actionCounts = MONTHS.flatMap(m => MONTH_WEEKS[m].map(w =>
                                                            actionRow.actions.filter(a => a.weekId === w && a.year === currentYear).length
                                                        ));
                                                        const maxTasks = Math.max(0, ...actionCounts);
                                                        const dynamicHeight = Math.max(96, maxTasks * 50 + 20);
                                                        heightClass = `h-[${dynamicHeight}px]`;
                                                    }

                                                    if (viewMode === 'tactical' && !isOKR) return null;
                                                    if (viewMode === 'strategic' && (isKPI || !isOKR)) return null;
                                                    if ((viewMode as string) === 'task' && isOKR) return null;

                                                    return (
                                                        <div key={row.id} className={`flex ${heightClass}`}>
                                                            {/* Iteration of Months for Data */}
                                                            {(viewMode === 'strategic' ?
                                                                ['2025', '2026', '2027'].flatMap(y => MONTHS.map(m => ({ month: m, year: parseInt(y), key: `${y}-${m}` })))
                                                                :
                                                                MONTHS.map(m => ({ month: m, year: currentYear, key: `${currentYear}-${m}` }))
                                                            ).map(({ month: m, year: y, key }) => (
                                                                <div key={key} className={`${viewMode === 'operational' ? 'w-[45rem]' : viewMode === 'strategic' ? 'w-[5rem]' : 'w-[16rem]'} shrink-0 border-r border-gray-200 flex items-center justify-center p-1 transition-all duration-300`}>
                                                                    {isOKR ? (
                                                                        (() => {
                                                                            const metricRow = row as MetricRow;
                                                                            const data = metricRow.monthlyData.find(d => d.monthId === m && d.year === y);
                                                                            const hasData = data && data.target !== null;
                                                                            const hasResult = data && data.actual !== null && data.actual !== undefined;
                                                                            if (!hasData) return <div className="w-full h-full bg-gray-50/50 flex items-center justify-center"><span className="text-gray-200 text-[10px]">-</span></div>;

                                                                            const isSuccess = hasResult && (metricRow.targetValue >= metricRow.startValue ? (data.actual! >= data.target!) : (data.actual! <= data.target!));
                                                                            let cardClass = "";
                                                                            let textClass = "";

                                                                            if (isKPI) {
                                                                                cardClass = "bg-white border border-dashed border-gray-100";
                                                                                textClass = hasResult ? (isSuccess ? "text-green-600" : "text-red-500") : "text-gray-300";
                                                                            } else {
                                                                                cardClass = hasResult ? (isSuccess ? 'bg-green-500 shadow-md shadow-green-200' : 'bg-red-500 shadow-md shadow-red-200') : 'bg-gray-50';
                                                                                textClass = hasResult ? "text-white" : "text-gray-300";
                                                                            }

                                                                            const targetCellId = `${goal.id}-${row.id}-${m}-target`;
                                                                            const actualCellId = `${goal.id}-${row.id}-${m}-actual`;
                                                                            const currentTargetVal = editingCell?.id === targetCellId ? editingCell.value : (data.target !== null ? data.target : '');
                                                                            const currentActualVal = editingCell?.id === actualCellId ? editingCell.value : (data.actual !== null ? data.actual : '');

                                                                            return (
                                                                                <div
                                                                                    className={`w-full h-full rounded-lg flex flex-col items-center justify-center relative group isolate ${cardClass} ${isKPI ? 'hover:border-gray-300' : ''} cursor-pointer`}
                                                                                    onClick={() => hasData && setActiveCommentModal({ goalId: goal.id, rowId: row.id, monthData: data })}
                                                                                    title={data.comment || 'Click to add note'}
                                                                                >
                                                                                    {hasResult ? <span className={`${textClass} font-black drop-shadow-sm ${isKPI ? 'text-xs' : (viewMode === 'tactical' ? 'text-2xl' : 'text-xl')}`}>{data.actual}</span> : <span className="text-gray-300 font-medium group-hover:hidden">-</span>}
                                                                                    {data.comment && (
                                                                                        <div className="absolute top-0.5 right-0.5 text-[10px] opacity-70">💬</div>
                                                                                    )}
                                                                                    {/* Only show input overlay for Execution view, not Planning */}
                                                                                    {viewMode === 'operational' && (
                                                                                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 focus-within:opacity-100 backdrop-blur-sm bg-gray-50/90 transition-opacity z-20 rounded-lg border border-gray-200 shadow-sm`} onClick={(e) => e.stopPropagation()}>
                                                                                            <div className="flex flex-col gap-1 w-full p-2">
                                                                                                {viewMode === 'operational' && !isKPI && <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase"><span>Target</span><span>Actual</span></div>}
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <input className={`p-1 text-center font-bold text-xs bg-white border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[var(--primary)] text-gray-400 ${viewMode === 'operational' ? 'w-1/2' : 'w-full'}`} value={currentTargetVal} onChange={(e) => setEditingCell({ id: targetCellId, value: e.target.value })} onFocus={() => setEditingCell({ id: targetCellId, value: data.target?.toString() || '' })} onBlur={(e) => handleCommitMetric(goal.id, row.id, m, 'target', e.target.value)} title="Target" />
                                                                                                    {viewMode === 'operational' && (
                                                                                                        <button
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                setActiveCommentModal({ goalId: goal.id, rowId: row.id, monthData: data });
                                                                                                            }}
                                                                                                            className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                                                                                                            title="Add/Edit Note"
                                                                                                        >
                                                                                                            💬
                                                                                                        </button>
                                                                                                    )}
                                                                                                    <input className={`p-1 text-center font-bold text-sm bg-white border border-blue-200 rounded outline-none focus:ring-1 focus:ring-[var(--primary)] text-gray-900 ${viewMode === 'operational' ? 'w-1/2' : 'w-full'}`} placeholder="-" value={currentActualVal} onChange={(e) => setEditingCell({ id: actualCellId, value: e.target.value })} onFocus={() => setEditingCell({ id: actualCellId, value: data.actual?.toString() || '' })} onBlur={(e) => handleCommitMetric(goal.id, row.id, m, 'actual', e.target.value)} title="Actual" />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })()
                                                                    ) : (
                                                                        viewMode === 'operational' ? (
                                                                            <div className="flex w-full h-full gap-1">
                                                                                {MONTH_WEEKS[m].map(w => {
                                                                                    const weekActions = (row as ActionRow).actions.filter(a => a.weekId === w && a.year === currentYear);

                                                                                    return (
                                                                                        <div
                                                                                            key={w}
                                                                                            className="flex-1 border-r border-gray-50 last:border-0 p-2 flex flex-col gap-2 bg-gray-50/30 min-h-[80px] transition-colors"
                                                                                            onDragOver={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.currentTarget.classList.add('bg-blue-100', 'border-blue-300');
                                                                                            }}
                                                                                            onDragLeave={(e) => {
                                                                                                e.currentTarget.classList.remove('bg-blue-100', 'border-blue-300');
                                                                                            }}
                                                                                            onDrop={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.currentTarget.classList.remove('bg-blue-100', 'border-blue-300');

                                                                                                if (draggedTask && draggedTask.goalId === goal.id && draggedTask.sourceWeek !== w) {
                                                                                                    // Update locally
                                                                                                    setGoals(prev => prev.map(g => {
                                                                                                        if (g.id !== goal.id) return g;
                                                                                                        return {
                                                                                                            ...g,
                                                                                                            rows: g.rows.map(r => {
                                                                                                                if (!('actions' in r)) return r;
                                                                                                                return {
                                                                                                                    ...r,
                                                                                                                    actions: r.actions.map(a =>
                                                                                                                        a.id === draggedTask.actionId
                                                                                                                            ? { ...a, weekId: w }
                                                                                                                            : a
                                                                                                                    )
                                                                                                                };
                                                                                                            })
                                                                                                        };
                                                                                                    }));

                                                                                                    // Persist
                                                                                                    const goalToSave = goals.find(g => g.id === goal.id);
                                                                                                    if (goalToSave) {
                                                                                                        const updated = {
                                                                                                            ...goalToSave,
                                                                                                            rows: goalToSave.rows.map(r => {
                                                                                                                if (!('actions' in r)) return r;
                                                                                                                return {
                                                                                                                    ...r,
                                                                                                                    actions: r.actions.map(a =>
                                                                                                                        a.id === draggedTask.actionId
                                                                                                                            ? { ...a, weekId: w }
                                                                                                                            : a
                                                                                                                    )
                                                                                                                };
                                                                                                            })
                                                                                                        };
                                                                                                        handleSaveGoal(updated);
                                                                                                    }
                                                                                                }
                                                                                                setDraggedTask(null);
                                                                                            }}
                                                                                        >
                                                                                            {weekActions.map(a => (
                                                                                                <div
                                                                                                    key={a.id}
                                                                                                    draggable
                                                                                                    onDragStart={() => setDraggedTask({ goalId: goal.id, actionId: a.id, sourceWeek: w })}
                                                                                                    onDragEnd={() => setDraggedTask(null)}
                                                                                                    className={`p-2 rounded-lg border shadow-sm text-[10px] font-medium cursor-move hover:shadow-md transition-all ${a.status === 'DONE' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                                                                                        a.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                                                                                                            a.status === 'STUCK' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                                                                                                'bg-white border-gray-200 text-gray-700'
                                                                                                        }`}
                                                                                                >
                                                                                                    <div className="flex items-start gap-1.5">
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={a.status === 'DONE'}
                                                                                                            onChange={() => handleUpdateActionStatus(goal.id, a.id, a.status === 'DONE' ? 'TBD' : 'DONE')}
                                                                                                            className="mt-0.5 flex-shrink-0 cursor-pointer"
                                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                                        />
                                                                                                        {editingTaskId === a.id ? (
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                value={editingTaskTitle}
                                                                                                                onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                                                                                onBlur={() => {
                                                                                                                    if (editingTaskTitle.trim()) {
                                                                                                                        handleUpdateActionTitle(goal.id, a.id, editingTaskTitle);
                                                                                                                    }
                                                                                                                    setEditingTaskId(null);
                                                                                                                }}
                                                                                                                onKeyDown={(e) => {
                                                                                                                    if (e.key === 'Enter') {
                                                                                                                        if (editingTaskTitle.trim()) {
                                                                                                                            handleUpdateActionTitle(goal.id, a.id, editingTaskTitle);
                                                                                                                        }
                                                                                                                        setEditingTaskId(null);
                                                                                                                    } else if (e.key === 'Escape') {
                                                                                                                        setEditingTaskId(null);
                                                                                                                    }
                                                                                                                }}
                                                                                                                className="flex-1 leading-tight break-words bg-white border border-blue-300 rounded px-1 outline-none focus:ring-1 focus:ring-blue-500 text-[10px]"
                                                                                                                autoFocus
                                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <div
                                                                                                                className="flex-1 leading-tight break-words cursor-text"
                                                                                                                onDoubleClick={(e) => {
                                                                                                                    e.stopPropagation();
                                                                                                                    setEditingTaskId(a.id);
                                                                                                                    setEditingTaskTitle(a.title);
                                                                                                                }}
                                                                                                            >
                                                                                                                {a.title}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}

                                                                                            <button
                                                                                                onClick={() => setActiveWeekModal({ week: w, goalId: goal.id })}
                                                                                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 flex items-center justify-center"
                                                                                                title="Add task"
                                                                                            >
                                                                                                <Plus size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        ) : null
                                                                    )
                                                                    }
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </main>
            <Coach goals={goals} />
        </div>
    );
}

