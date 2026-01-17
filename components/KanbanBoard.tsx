'use client';

import { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertCircle, Flame, CheckCircle2, Plus, X } from 'lucide-react';

type ActionCard = { id: string; weekId: string; year: number; title: string; status: 'TBD' | 'DONE'; };
type GoalCategory = { id: string; category: string; title: string; rows: any[]; };

interface KanbanBoardProps {
    goals: GoalCategory[];
    currentYear: number;
    onUpdateStatus: (goalId: string, cardId: string, newStatus: 'TBD' | 'DONE') => void;
    onUpdateTitle: (goalId: string, cardId: string, newTitle: string) => void;
    onAddTask: (goalId: string, title: string) => void;
}

export default function KanbanBoard({ goals, currentYear, onUpdateStatus, onUpdateTitle, onAddTask }: KanbanBoardProps) {
    const [draggedTask, setDraggedTask] = useState<{ goalId: string; taskId: string } | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [newTaskGoalId, setNewTaskGoalId] = useState<string | null>(null);
    const [newTaskText, setNewTaskText] = useState('');

    // Collect all tasks from all goals
    const allTasks = useMemo(() => {
        const tasks: Array<ActionCard & { goalId: string; goalTitle: string; category: string }> = [];
        goals.forEach(goal => {
            const actionRow = goal.rows.find(r => !('type' in r));
            if (actionRow && 'actions' in actionRow) {
                actionRow.actions.forEach((action: ActionCard) => {
                    tasks.push({
                        ...action,
                        goalId: goal.id,
                        goalTitle: goal.title,
                        category: goal.category
                    });
                });
            }
        });
        return tasks;
    }, [goals]);

    const todoTasks = allTasks.filter(t => t.status === 'TBD');
    const doneTasks = allTasks.filter(t => t.status === 'DONE');

    // Calculate statistics
    const stats = useMemo(() => {
        const total = allTasks.length;
        const completed = doneTasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Get current week number
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(daysSinceStart / 7) + 1;
        const currentWeekId = `W${currentWeek}`;

        // Late tasks: TBD tasks from past weeks
        const lateTasks = todoTasks.filter(t => {
            const taskWeekNum = parseInt(t.weekId.replace('W', ''));
            return taskWeekNum < currentWeek && t.year <= currentYear;
        }).length;

        // This week's tasks
        const thisWeekTasks = allTasks.filter(t => t.weekId === currentWeekId && t.year === currentYear);
        const thisWeekCompleted = thisWeekTasks.filter(t => t.status === 'DONE').length;

        // Engagement score (0-100)
        const engagementScore = Math.min(100, Math.round(
            (completionRate * 0.5) +
            (lateTasks === 0 ? 25 : Math.max(0, 25 - lateTasks * 5)) +
            (thisWeekCompleted * 5)
        ));

        return {
            total,
            completed,
            completionRate,
            lateTasks,
            thisWeekTasks: thisWeekTasks.length,
            thisWeekCompleted,
            engagementScore,
            streak: 7 // Placeholder - would need to track daily activity
        };
    }, [allTasks, todoTasks, doneTasks, currentYear]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Health': return 'bg-teal-600';
            case 'Wealth': return 'bg-emerald-600';
            case 'Family': return 'bg-indigo-500';
            case 'Leisure': return 'bg-pink-500';
            case 'Business/Career': return 'bg-blue-700';
            default: return 'bg-gray-500';
        }
    };

    const handleDrop = (newStatus: 'TBD' | 'DONE') => {
        if (draggedTask) {
            onUpdateStatus(draggedTask.goalId, draggedTask.taskId, newStatus);
            setDraggedTask(null);
        }
    };

    const handleAddTask = () => {
        if (newTaskGoalId && newTaskText.trim()) {
            onAddTask(newTaskGoalId, newTaskText.trim());
            setNewTaskText('');
            setNewTaskGoalId(null);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Statistics Dashboard */}
            <div className="bg-white border-b border-gray-200 p-6">
                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={24} />
                    Your Performance Dashboard
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-600 mb-1">Total Tasks</div>
                        <div className="text-3xl font-black text-blue-600">{stats.total}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-600 mb-1">Completion</div>
                        <div className="text-3xl font-black text-green-600">{stats.completionRate}%</div>
                        <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                            <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-600 mb-1">Late Tasks</div>
                        <div className="text-3xl font-black text-red-600 flex items-center gap-2">
                            {stats.lateTasks > 0 && <AlertCircle size={20} />}
                            {stats.lateTasks}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-600 mb-1">Streak</div>
                        <div className="text-3xl font-black text-orange-600 flex items-center gap-2">
                            <Flame size={20} />
                            {stats.streak}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-600 mb-1">This Week</div>
                        <div className="text-2xl font-black text-purple-600">{stats.thisWeekCompleted}/{stats.thisWeekTasks}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-600 mb-1">Engagement</div>
                        <div className="text-3xl font-black text-yellow-600">{stats.engagementScore}%</div>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    {/* TO DO Column */}
                    <div
                        className="bg-white rounded-xl shadow-lg p-4 flex flex-col"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop('TBD')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <Target className="text-blue-600" size={20} />
                                To Do
                                <span className="text-sm font-normal text-gray-500">({todoTasks.length})</span>
                            </h3>
                            <button
                                onClick={() => setNewTaskGoalId(goals[0]?.id || null)}
                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto space-y-2">
                            {todoTasks.map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={() => setDraggedTask({ goalId: task.goalId, taskId: task.id })}
                                    onDragEnd={() => setDraggedTask(null)}
                                    className={`bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all ${draggedTask?.taskId === task.id ? 'opacity-50' : ''}`}
                                >
                                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-2 ${getCategoryColor(task.category)}`}>
                                        {task.category}
                                    </div>
                                    {editingTaskId === task.id ? (
                                        <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onBlur={() => {
                                                onUpdateTitle(task.goalId, task.id, editingValue);
                                                setEditingTaskId(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onUpdateTitle(task.goalId, task.id, editingValue);
                                                    setEditingTaskId(null);
                                                }
                                            }}
                                            className="w-full p-1 border border-blue-300 rounded outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <div
                                            className="font-medium text-gray-900 mb-1 cursor-text"
                                            onDoubleClick={() => {
                                                setEditingTaskId(task.id);
                                                setEditingValue(task.title);
                                            }}
                                        >
                                            {task.title}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 flex items-center justify-between">
                                        <span>{task.weekId} | {task.goalTitle}</span>
                                        <button
                                            onClick={() => onUpdateStatus(task.goalId, task.id, 'DONE')}
                                            className="p-1 hover:bg-green-50 rounded text-green-600"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {newTaskGoalId && (
                                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                                    <input
                                        type="text"
                                        placeholder="Enter task title..."
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddTask();
                                            if (e.key === 'Escape') setNewTaskGoalId(null);
                                        }}
                                        className="w-full p-2 border border-blue-300 rounded outline-none mb-2"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleAddTask} className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-bold">Add</button>
                                        <button onClick={() => setNewTaskGoalId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-bold">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DONE Column */}
                    <div
                        className="bg-white rounded-xl shadow-lg p-4 flex flex-col"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop('DONE')}
                    >
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-4">
                            <CheckCircle2 className="text-green-600" size={20} />
                            Done
                            <span className="text-sm font-normal text-gray-500">({doneTasks.length})</span>
                        </h3>

                        <div className="flex-1 overflow-auto space-y-2">
                            {doneTasks.map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={() => setDraggedTask({ goalId: task.goalId, taskId: task.id })}
                                    onDragEnd={() => setDraggedTask(null)}
                                    className={`bg-green-50 border-2 border-green-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all ${draggedTask?.taskId === task.id ? 'opacity-50' : ''}`}
                                >
                                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-2 ${getCategoryColor(task.category)}`}>
                                        {task.category}
                                    </div>
                                    <div className="font-medium text-gray-700 line-through mb-1">
                                        {task.title}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center justify-between">
                                        <span>{task.weekId} | {task.goalTitle}</span>
                                        <button
                                            onClick={() => onUpdateStatus(task.goalId, task.id, 'TBD')}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
