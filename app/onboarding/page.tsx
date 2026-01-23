'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, Award, Target, Star, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const onboardingSteps = [
    {
        icon: Users,
        color: 'indigo',
        title: 'Connect with Peers',
        description: 'Build your network',
        benefits: [
            'Discover like-minded individuals with similar goals',
            'View GPS goals of peers to get inspired',
            'Join tribes for accountability and support',
            'Get matched with peers based on your interests'
        ],
        tip: 'The more connections you make, the more motivated you stay!'
    },
    {
        icon: TrendingUp,
        color: 'purple',
        title: 'Level Up Your Profile',
        description: 'Become more attractive',
        benefits: [
            'Complete goals to increase your level',
            'Higher levels unlock access to more peer GPS views',
            'Build reliability score by hitting your targets',
            'Showcase your achievements with badges'
        ],
        tip: 'Peers with higher levels and reliability get more connection requests!'
    },
    {
        icon: Award,
        color: 'yellow',
        title: 'Ranking System',
        description: 'How it works',
        levels: [
            { level: 1, name: 'Starter', requirement: '0-100 XP', access: 'View Level 1 peers' },
            { level: 2, name: 'Explorer', requirement: '100-500 XP', access: 'View Level 1-2 peers' },
            { level: 3, name: 'Achiever', requirement: '500-1500 XP', access: 'View Level 1-3 peers' },
            { level: 4, name: 'Master', requirement: '1500-5000 XP', access: 'View Level 1-4 peers' },
            { level: 5, name: 'Legend', requirement: '5000+ XP', access: 'View all peers' },
        ],
        tip: 'Earn XP by completing goals, maintaining streaks, and helping tribe members!'
    },
    {
        icon: Star,
        color: 'green',
        title: 'Build Your Reputation',
        description: 'Stand out from the crowd',
        benefits: [
            'Complete your profile with bio and skills',
            'Set ambitious but achievable goals',
            'Maintain high reliability (hit your targets)',
            'Engage with your tribe regularly',
            'Share your progress and celebrate wins'
        ],
        tip: 'A complete profile with high reliability gets 5x more connection requests!'
    }
];

export default function PaidOnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const step = onboardingSteps[currentStep];
    const Icon = step.icon;

    const colorClasses = {
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-purple-500' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-pink-500' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200', gradient: 'from-yellow-500 to-orange-500' },
        green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-emerald-500' },
    };

    const colors = colorClasses[step.color as keyof typeof colorClasses];

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/profile'); // Complete your profile
        }
    };

    const handleSkip = () => {
        router.push('/profile'); // Skip to profile
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-500">Welcome Guide</span>
                        <span className="text-sm text-gray-500">{currentStep + 1} of {onboardingSteps.length}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className={`${colors.bg} p-8 border-b-2 ${colors.border}`}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center border-2 ${colors.border}`}>
                                <Icon size={32} className={colors.text} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900">{step.title}</h2>
                                <p className="text-gray-600 font-medium">{step.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        {/* Benefits or Levels */}
                        {step.benefits && (
                            <div className="space-y-4 mb-6">
                                {step.benefits.map((benefit, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle2 size={24} className={`${colors.text} shrink-0 mt-0.5`} />
                                        <p className="text-gray-700 text-lg">{benefit}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {step.levels && (
                            <div className="space-y-3 mb-6">
                                {step.levels.map((level, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 flex items-center gap-4"
                                    >
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-black text-lg`}>
                                            {level.level}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900">{level.name}</div>
                                            <div className="text-sm text-gray-600">{level.requirement}</div>
                                        </div>
                                        <div className="text-sm text-gray-500 italic">{level.access}</div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Tip */}
                        <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 flex items-start gap-3`}>
                            <Zap size={20} className={colors.text} />
                            <div>
                                <p className="font-bold text-gray-900 mb-1">Pro Tip</p>
                                <p className="text-gray-700">{step.tip}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="text-gray-500 hover:text-gray-700 font-bold underline"
                        >
                            Skip Guide
                        </button>

                        <button
                            onClick={handleNext}
                            className={`px-8 py-3 bg-gradient-to-r ${colors.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}
                        >
                            {currentStep < onboardingSteps.length - 1 ? (
                                <>
                                    Next
                                    <ArrowRight size={20} />
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <Target size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Quick Stats Preview */}
                <div className="mt-8 grid grid-cols-4 gap-4">
                    {[
                        { label: 'Your Level', value: '1', icon: TrendingUp },
                        { label: 'Reliability', value: '0%', icon: Target },
                        { label: 'Connections', value: '0', icon: Users },
                        { label: 'Badges', value: '0', icon: Award },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 text-center border border-gray-200">
                            <stat.icon size={20} className="mx-auto mb-2 text-gray-400" />
                            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
