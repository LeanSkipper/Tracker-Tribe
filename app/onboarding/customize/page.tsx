'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Plus, X, ArrowLeft, Check } from 'lucide-react';
import { GoalTemplate } from '@/lib/goalTemplates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LIFE_AREAS = ['Health', 'Family', 'Wealth', 'Business/Career', 'Leisure', 'Intellectual', 'Social'];

export default function CustomizeGoalPage() {
    const router = useRouter();
    const [template, setTemplate] = useState<GoalTemplate | null>(null);
    const [vision, setVision] = useState('');
    const [category, setCategory] = useState(LIFE_AREAS[0]);
    const [okrLabel, setOkrLabel] = useState('');
    const [startValue, setStartValue] = useState(0);
    const [targetValue, setTargetValue] = useState(100);
    const [kpis, setKpis] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Load template from sessionStorage if available
        const stored = sessionStorage.getItem('onboarding_template');
        if (stored) {
            const tmpl: GoalTemplate = JSON.parse(stored);
            setTemplate(tmpl);
            setVision(tmpl.title);
            setCategory(tmpl.area);
            setOkrLabel(tmpl.metric);
            setStartValue(tmpl.startValue);
            setTargetValue(tmpl.targetValue);
            setKpis(tmpl.kpis);
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);

        // Create goal object
        const newGoal = {
            category,
            title: vision,
            isShared: false,
            rows: [
                // OKR
                {
                    type: 'OKR',
                    label: okrLabel,
                    unit: '',
                    startValue,
                    targetValue,
                    startYear: new Date().getFullYear(),
                    startMonth: 0,
                    deadlineYear: new Date().getFullYear(),
                    deadlineMonth: 11,
                },
                // KPIs
                ...kpis.map((kpi, idx) => ({
                    type: 'KPI',
                    label: kpi,
                    unit: '',
                    startValue: 0,
                    targetValue: 100,
                    startYear: new Date().getFullYear(),
                    startMonth: 0,
                    deadlineYear: new Date().getFullYear(),
                    deadlineMonth: 11,
                })),
                // Action Plan
                {
                    label: 'Action Plan',
                    actions: []
                }
            ]
        };

        try {
            // Save goal to backend
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGoal),
            });

            if (response.ok) {
                const data = await response.json();
                // Clear onboarding data
                sessionStorage.removeItem('onboarding_template');
                // Redirect to First Action view with Goal ID
                router.push(`/onboarding/first-action?goalId=${data.id}`);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create goal');
            }
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Failed to create goal. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 mb-3">
                        <span>Step 3 of 4</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {template ? 'Customize Your Goal' : 'Create Your Goal'}
                    </h1>
                    <p className="text-gray-600">
                        {template ? 'Edit the template to fit your needs' : 'Fill in the details for your first goal'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Vision & Category */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Life Area
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {LIFE_AREAS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Vision / Goal Title
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                                placeholder="e.g., Run a marathon"
                                value={vision}
                                onChange={(e) => setVision(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* OKR */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={20} className="text-blue-600" />
                            <h3 className="font-bold text-blue-900">Main OKR (Objective & Key Result)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Metric Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Training sessions completed"
                                    value={okrLabel}
                                    onChange={(e) => setOkrLabel(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Start Value
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={startValue}
                                        onChange={(e) => setStartValue(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Target Value
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={targetValue}
                                        onChange={(e) => setTargetValue(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Supporting KPIs</h3>
                            <button
                                onClick={() => setKpis([...kpis, ''])}
                                className="text-sm bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                            >
                                <Plus size={14} /> Add KPI
                            </button>
                        </div>
                        <div className="space-y-2">
                            {kpis.map((kpi, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        placeholder="KPI name"
                                        value={kpi}
                                        onChange={(e) => {
                                            const newKpis = [...kpis];
                                            newKpis[idx] = e.target.value;
                                            setKpis(newKpis);
                                        }}
                                    />
                                    <button
                                        onClick={() => setKpis(kpis.filter((_, i) => i !== idx))}
                                        className="p-3 text-gray-400 hover:text-red-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                            {kpis.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No KPIs added yet. Click "Add KPI" to add supporting metrics.</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !vision || !okrLabel}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Next: First Action
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
