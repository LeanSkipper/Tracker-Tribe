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
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
        green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
        orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    };

    const colors = colorClasses[step.color as keyof typeof colorClasses];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-500">Quick Tutorial</span>
                        <span className="text-sm text-gray-500">{currentStep + 1} of {tutorialSteps.length}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--primary)] transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className={`bg-white rounded-3xl shadow-xl border-2 ${colors.border} p-8 md:p-12 text-center space-y-6`}>
                    {/* Icon */}
                    <div className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto`}>
                        <Icon size={40} className={colors.text} />
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-2">{step.title}</h2>
                        <p className="text-xl text-gray-600">{step.description}</p>
                    </div>

                    {/* Example */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <p className="text-sm font-bold text-gray-500 mb-2">Example:</p>
                        <p className="text-lg font-bold text-gray-900">{step.example}</p>
                    </div>

                    {/* Detail */}
                    <p className="text-gray-600 max-w-md mx-auto">{step.detail}</p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    <Link
                        href="/onboarding/select-template"
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Skip Tutorial
                    </Link>

                    {currentStep < tutorialSteps.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors"
                        >
                            Next
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <Link
                            href="/onboarding/select-template"
                            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors"
                        >
                            Continue
                            <ArrowRight size={20} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
