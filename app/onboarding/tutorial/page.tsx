'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Target, BarChart2, TrendingUp, Activity, ArrowRight, ArrowLeft } from 'lucide-react';

const tutorialSteps = [
    {
        icon: Target,
        color: 'blue',
        title: 'Vision',
        description: 'Your big-picture goal',
        example: 'Run a marathon',
        detail: 'What do you want to achieve? Be specific and inspiring.'
    },
    {
        icon: BarChart2,
        color: 'purple',
        title: 'OKR',
        description: 'Measurable result',
        example: 'Complete 156 training sessions',
        detail: 'How will you measure success? Set a clear target number.'
    },
    {
        icon: TrendingUp,
        color: 'green',
        title: 'KPI',
        description: 'Supporting metrics',
        example: 'Weekly running hours',
        detail: 'What other metrics help track your progress?'
    },
    {
        icon: Activity,
        color: 'orange',
        title: 'Metric',
        description: 'How you track',
        example: 'Sessions logged',
        detail: 'How do you measure and record your progress?'
    }
];

export default function TutorialPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const step = tutorialSteps[currentStep];
    const Icon = step.icon;

    const colorClasses = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]' },
        green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]' },
        orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)]' },
    };

    const colors = colorClasses[step.color as keyof typeof colorClasses];

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>

            <div className="max-w-xl w-full relative z-10">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Quick Tutorial</span>
                        <span className="text-sm font-medium text-slate-400">{currentStep + 1} <span className="text-slate-600">/</span> {tutorialSteps.length}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className={`bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 text-center transition-all duration-500 ${colors.glow}`}>
                    {/* Icon */}
                    <div className={`w-20 h-20 ${colors.bg} ${colors.border} border rounded-2xl flex items-center justify-center mx-auto mb-8 transition-colors duration-300`}>
                        <Icon size={36} className={colors.text} />
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{step.title}</h2>
                        <p className="text-lg text-slate-400">{step.description}</p>
                    </div>

                    {/* Example */}
                    <div className="bg-slate-950/50 rounded-xl p-6 border border-white/5 mb-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example</p>
                        <p className="text-lg font-bold text-slate-200">{step.example}</p>
                    </div>

                    {/* Detail */}
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">{step.detail}</p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <Link
                        href="/onboarding/select-template"
                        className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    >
                        Skip
                    </Link>

                    {currentStep < tutorialSteps.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="group flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                        >
                            Next
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    ) : (
                        <Link
                            href="/onboarding/select-template"
                            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30"
                        >
                            Start
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
