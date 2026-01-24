'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Map, Zap, Trophy, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const philosophySteps = [
    {
        icon: Target,
        color: 'indigo',
        title: 'Strategic Vision',
        subtitle: 'The "Why"',
        description: 'Define clearly where you want to go. Without a destination, you are just wandering.',
        points: [
            'Crystal clear objectives',
            'Aligned with your true purpose',
            'Ambitious yet achievable milestones'
        ]
    },
    {
        icon: Map,
        color: 'purple',
        title: 'Planification',
        subtitle: 'The "How"',
        description: 'Turn your vision into a concrete roadmap. Hope is not a strategy.',
        points: [
            'Break down big goals into steps',
            'Identify potential obstacles',
            'Set clear timelines and deadlines'
        ]
    },
    {
        icon: Zap,
        color: 'yellow',
        title: 'Execution',
        subtitle: 'The "What"',
        description: 'Deep work and focused action. This is where the magic happens.',
        points: [
            'Focus on high-impact tasks',
            'Maintain consistency and discipline',
            'Adapt quickly to feedback'
        ]
    },
    {
        icon: Trophy,
        color: 'emerald',
        title: 'Results & Transformation',
        subtitle: 'The "Outcome"',
        description: 'Measure what matters. Celebrate wins and learn from setbacks.',
        points: [
            'Track your progress systematically',
            'Review and refine your approach',
            'Become the person who achieves the goal'
        ]
    }
];

export default function OnboardingIntroPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < philosophySteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/onboarding/select-template');
        }
    };

    const handleSkip = () => {
        router.push('/onboarding/select-template');
    };

    const step = philosophySteps[currentStep];
    const Icon = step.icon;

    // Premium styling config
    const getGradient = (color: string) => {
        switch (color) {
            case 'indigo': return 'from-indigo-600 to-blue-600';
            case 'purple': return 'from-purple-600 to-indigo-600';
            case 'yellow': return 'from-amber-500 to-orange-500';
            case 'emerald': return 'from-emerald-500 to-teal-500';
            default: return 'from-gray-600 to-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-100 to-transparent -z-10" />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5 rounded-full blur-3xl bg-gradient-to-r ${getGradient(step.color)} transition-all duration-700`} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* Left: Interactive Visuals */}
                    <div className="relative order-2 md:order-1">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative z-10"
                        >
                            <div className="aspect-square max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 flex flex-col items-center justify-center text-center border border-slate-100">
                                <div className={`w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br ${getGradient(step.color)} flex items-center justify-center text-white shadow-lg`}>
                                    <Icon size={48} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{step.title}</h2>
                                <p className={`text-sm font-bold uppercase tracking-wider mb-6 text-${step.color}-600`}>{step.subtitle}</p>
                                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                    {step.description}
                                </p>
                                <ul className="text-left space-y-3 w-full bg-slate-50 p-6 rounded-2xl">
                                    {step.points.map((point, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className={`w-2 h-2 rounded-full bg-${step.color}-500`} />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Decorative blobs */}
                        <div className="absolute top-10 -left-10 w-24 h-24 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                        <div className="absolute top-10 -right-10 w-24 h-24 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-24 h-24 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                    </div>

                    {/* Right: Navigation & Context */}
                    <div className="order-1 md:order-2 space-y-8 md:pl-12">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
                                The <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Road Less Stupid</span>
                            </h1>
                            <p className="text-xl text-slate-600">
                                A proven system to achieve what matters most without the chaos.
                            </p>
                        </div>

                        {/* Steps Indicator */}
                        <div className="space-y-4">
                            {philosophySteps.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 group ${currentStep === idx
                                            ? 'bg-white shadow-lg scale-105 border border-slate-100'
                                            : 'hover:bg-white/50 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${currentStep === idx
                                            ? `bg-gray-900 text-white`
                                            : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold ${currentStep === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {s.title}
                                        </div>
                                    </div>
                                    {currentStep === idx && <ArrowRightCircle className="text-gray-900" size={20} />}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={handleNext}
                                className="flex-1 bg-slate-900 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                            >
                                {currentStep === philosophySteps.length - 1 ? 'Start NOW' : 'Next Step'}
                                <ArrowRight size={20} />
                            </button>

                            {currentStep < philosophySteps.length - 1 && (
                                <button
                                    onClick={handleSkip}
                                    className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    Skip
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
