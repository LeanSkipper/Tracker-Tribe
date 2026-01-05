'use client';

import { useState } from 'react';
import { X, Lightbulb, Plus, Bot, Sparkles } from 'lucide-react';
import { GOAL_TEMPLATES, GoalTemplate } from '@/lib/goalTemplates';

interface InspirationModalProps {
    onClose: () => void;
    onSelectTemplate: (template: GoalTemplate) => void;
    onCreateFromScratch: () => void;
}

export default function InspirationModal({ onClose, onSelectTemplate, onCreateFromScratch }: InspirationModalProps) {
    const [showCoach, setShowCoach] = useState(false);

    const getAreaColor = (area: string) => {
        const colors: Record<string, string> = {
            'Health': 'bg-teal-600',
            'Family': 'bg-indigo-500',
            'Business/Career': 'bg-blue-700',
            'Wealth': 'bg-emerald-600',
            'Leisure': 'bg-pink-500',
            'Intellectual': 'bg-purple-600',
            'Social': 'bg-orange-500',
        };
        return colors[area] || 'bg-gray-500';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Lightbulb size={28} className="text-[var(--primary)]" />
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--primary)]">Create Your Goal</h2>
                            <p className="text-sm text-gray-600">Start from scratch or choose a template</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Create from Scratch - Compact */}
                <div className="p-6 border-b border-gray-200">
                    <div
                        onClick={onCreateFromScratch}
                        className="border-2 border-blue-200 bg-blue-50 rounded-xl p-4 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Plus size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Create from Scratch
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Build a custom goal tailored to your unique vision
                                </p>
                            </div>
                            <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Templates Section */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Lightbulb size={20} className="text-purple-600" />
                            Or Choose a Template
                        </h3>

                        {/* LAPIS Coach Button */}
                        <button
                            onClick={() => setShowCoach(!showCoach)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showCoach
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Bot size={18} />
                            LAPIS Coach
                        </button>
                    </div>

                    {/* LAPIS Coach Help - Compact */}
                    {showCoach && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-purple-900 mb-2 text-sm flex items-center gap-1">
                                        <Sparkles size={14} className="text-purple-600" />
                                        Quick Tips
                                    </h4>
                                    <ul className="space-y-1 text-xs text-purple-700">
                                        <li>• <strong>New to goals?</strong> Templates show you the structure</li>
                                        <li>• <strong>Have a vision?</strong> Create from scratch for full control</li>
                                        <li>• <strong>Remember:</strong> Vision + OKR + KPIs = Success</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Templates Grid - No filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {GOAL_TEMPLATES.map(template => (
                            <div
                                key={template.id}
                                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                                onClick={() => onSelectTemplate(template)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${getAreaColor(template.area)}`}>
                                        {template.area}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
                                    {template.title}
                                </h3>

                                <div className="text-sm text-gray-600 mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{template.metric}</span>
                                        <span className="text-xs">{template.startValue} → {template.targetValue}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-xs font-bold text-gray-500 mb-2">Suggested KPIs:</p>
                                    <ul className="space-y-1">
                                        {template.kpis.slice(0, 2).map((kpi, idx) => (
                                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                                                <span className="text-[var(--primary)] mr-1">•</span>
                                                <span className="flex-1">{kpi}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button className="mt-4 w-full py-2 bg-gray-50 group-hover:bg-[var(--primary)] group-hover:text-white text-gray-700 font-bold rounded-lg transition-colors text-sm">
                                    Use Template
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <p className="text-xs text-gray-600 text-center">
                        💡 <strong>Tip:</strong> You can customize any template after selecting it
                    </p>
                </div>
            </div>
        </div>
    );
}
