'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, Target, TrendingUp, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

interface MatchmakingCriteria {
    ageRange: { enabled: boolean; description: string };
    lifeFocus: { enabled: boolean; description: string };
    professional: { enabled: boolean; description: string };
    wealth: { enabled: boolean; description: string };
    execution: { enabled: boolean; description: string };
    personality: { enabled: boolean; description: string };
    health: { enabled: boolean; description: string };
    skills: { enabled: boolean; description: string };
    values: { enabled: boolean; description: string };
    social: { enabled: boolean; description: string };
    intent: { enabled: boolean; description: string };
}

interface TribeFormData {
    name: string;
    topic: string;
    meetingFrequency: 'daily' | 'weekly' | 'monthly' | '';
    meetingTimeHour: number;
    meetingTimeMinute: number;
    maxMembers: number;
    matchmaking: MatchmakingCriteria;
    minLevel: number;
    minGrit: number;
    minExperience: number;
    minCompletionRate: number;
    minReputation: number;
}

interface TribeCreationFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export default function TribeCreationForm({ onClose, onSuccess }: TribeCreationFormProps) {
    const [formData, setFormData] = useState<TribeFormData>({
        name: '',
        topic: '',
        meetingFrequency: '',
        meetingTimeHour: 10,
        meetingTimeMinute: 0,
        maxMembers: 10,
        matchmaking: {
            ageRange: { enabled: false, description: '' },
            lifeFocus: { enabled: false, description: '' },
            professional: { enabled: false, description: '' },
            wealth: { enabled: false, description: '' },
            execution: { enabled: false, description: '' },
            personality: { enabled: false, description: '' },
            health: { enabled: false, description: '' },
            skills: { enabled: false, description: '' },
            values: { enabled: false, description: '' },
            social: { enabled: false, description: '' },
            intent: { enabled: false, description: '' },
        },
        minLevel: 1,
        minGrit: 0,
        minExperience: 0,
        minCompletionRate: 0,
        minReputation: 0,
    });

    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        matchmaking: false,
        stats: false,
    });

    const [estimatedMembers, setEstimatedMembers] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Calculate estimated member pool
    useEffect(() => {
        const fetchEstimate = async () => {
            try {
                const response = await fetch('/api/tribes/estimate-pool', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        minLevel: formData.minLevel,
                        minGrit: formData.minGrit,
                        minExperience: formData.minExperience,
                        minCompletionRate: formData.minCompletionRate,
                        minReputation: formData.minReputation,
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setEstimatedMembers(data.count);
                }
            } catch (err) {
                console.error('Failed to estimate pool:', err);
            }
        };

        fetchEstimate();
    }, [formData.minLevel, formData.minGrit, formData.minExperience, formData.minCompletionRate, formData.minReputation]);

    const toggleCriteria = (key: keyof MatchmakingCriteria) => {
        setFormData(prev => ({
            ...prev,
            matchmaking: {
                ...prev.matchmaking,
                [key]: {
                    ...prev.matchmaking[key],
                    enabled: !prev.matchmaking[key].enabled,
                },
            },
        }));
    };

    const updateCriteriaDescription = (key: keyof MatchmakingCriteria, description: string) => {
        setFormData(prev => ({
            ...prev,
            matchmaking: {
                ...prev.matchmaking,
                [key]: {
                    ...prev.matchmaking[key],
                    description,
                },
            },
        }));
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Tribe name is required');
            // Ensure basic section is open
            setExpandedSections(prev => ({ ...prev, basic: true }));
            return;
        }

        if (!formData.meetingFrequency) {
            setError('Meeting frequency is required');
            setExpandedSections(prev => ({ ...prev, basic: true }));
            return;
        }

        // Check at least one matchmaking criterion is enabled
        const hasMatchmaking = Object.values(formData.matchmaking).some(c => c.enabled);
        if (!hasMatchmaking) {
            setError('At least one matchmaking criterion is required');
            setExpandedSections(prev => ({ ...prev, matchmaking: true }));
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/tribes/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess?.();
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create tribe');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const criteriaLabels: Record<keyof MatchmakingCriteria, string> = {
        ageRange: 'Age Range',
        lifeFocus: 'Life Focus (now)',
        professional: 'Professional',
        wealth: 'Wealth',
        execution: 'Execution Style',
        personality: 'Personality & Behavior',
        health: 'Health & Energy',
        skills: 'Skills & Assets',
        values: 'Values & Principles',
        social: 'Social & Digital',
        intent: 'Community Intent',
    };

    const enabledCount = Object.values(formData.matchmaking).filter(c => c.enabled).length;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center flex items-center justify-center">
                {/* Overlay background click to close - optional, but nice to have */}
                <div className="fixed inset-0 transition-opacity" onClick={onClose} aria-hidden="true" />

                {/* Modal Panel */}
                <div className="inline-block w-full max-w-3xl my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative z-10 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Users size={28} className="text-blue-600" />
                                Create Your Mastermind Table
                            </h2>
                            <p className="text-gray-600 mt-1">Set up your tribe with matchmaking criteria</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                        {/* Section 1: Basic Information */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection('basic')}
                                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Target size={20} className="text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-900">1. Basic Information</h3>
                                    {!expandedSections.basic && formData.name && <span className="text-sm text-green-600 font-bold">✓ Filled</span>}
                                </div>
                                {expandedSections.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {expandedSections.basic && (
                                <div className="p-6 space-y-4 bg-white border-t border-gray-200">
                                    {/* Tribe Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Tribe Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., SaaS Founders Mastermind"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Topic (Optional) */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Topic (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            placeholder="e.g., Scaling to $1M ARR"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Meeting Frequency */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Meeting Frequency *
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                                                <button
                                                    key={freq}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, meetingFrequency: freq })}
                                                    className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${formData.meetingFrequency === freq
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {freq}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meeting Time */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Meeting Time *
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={formData.meetingTimeHour}
                                                onChange={(e) => setFormData({ ...formData, meetingTimeHour: parseInt(e.target.value) })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {i.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="text-gray-600 font-bold">:</span>
                                            <select
                                                value={formData.meetingTimeMinute}
                                                onChange={(e) => setFormData({ ...formData, meetingTimeMinute: parseInt(e.target.value) })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {[0, 15, 30, 45].map((min) => (
                                                    <option key={min} value={min}>
                                                        {min.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                            <Clock size={20} className="text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Max Members */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Max Members at Table * (1-10)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.maxMembers}
                                            onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 1 })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Matchmaking Criteria */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection('matchmaking')}
                                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Users size={20} className="text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-900">2. Matchmaking Criteria</h3>
                                    <span className="text-sm text-gray-500">({enabledCount}/11 enabled)</span>
                                </div>
                                {expandedSections.matchmaking ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {expandedSections.matchmaking && (
                                <div className="p-6 space-y-4 bg-white border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Select at least one criterion to help us match you with the right members.
                                    </p>
                                    <div className="space-y-2">
                                        {(Object.keys(criteriaLabels) as Array<keyof MatchmakingCriteria>).map((key) => (
                                            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.matchmaking[key].enabled}
                                                        onChange={() => toggleCriteria(key)}
                                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                        id={`criteria-${key}`}
                                                    />
                                                    <label htmlFor={`criteria-${key}`} className="flex-1 font-bold text-gray-900 cursor-pointer select-none">
                                                        {criteriaLabels[key]}
                                                    </label>
                                                </div>

                                                {formData.matchmaking[key].enabled && (
                                                    <div className="p-4 bg-white border-t border-gray-100">
                                                        <textarea
                                                            value={formData.matchmaking[key].description}
                                                            onChange={(e) => updateCriteriaDescription(key, e.target.value)}
                                                            placeholder={`Describe your ${criteriaLabels[key].toLowerCase()} requirements...`}
                                                            rows={2}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Required Stats */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection('stats')}
                                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={20} className="text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-900">3. Required Stats</h3>
                                    {estimatedMembers !== null && (
                                        <span className="text-sm text-blue-600 font-bold hidden sm:inline">
                                            ~{estimatedMembers} candidates
                                        </span>
                                    )}
                                </div>
                                {expandedSections.stats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {expandedSections.stats && (
                                <div className="p-6 space-y-4 bg-white border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Set minimum thresholds for member stats.
                                        {estimatedMembers !== null && (
                                            <span className="ml-2 text-blue-600 font-bold sm:hidden">
                                                • Estimated pool: {estimatedMembers} members
                                            </span>
                                        )}
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Level */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Minimum Level
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={formData.minLevel}
                                                onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) || 1 })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        {/* Grit */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Minimum Grit
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.minGrit}
                                                onChange={(e) => setFormData({ ...formData, minGrit: parseInt(e.target.value) || 0 })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        {/* Experience */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Min XP
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.minExperience}
                                                onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value) || 0 })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        {/* Reputation */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Min Reputation (0-10)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={formData.minReputation}
                                                    onChange={(e) => setFormData({ ...formData, minReputation: parseFloat(e.target.value) })}
                                                    className="flex-1"
                                                />
                                                <span className="w-12 text-center text-sm font-bold text-blue-600">
                                                    {formData.minReputation.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Completion Rate */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Minimum Completion Rate (%)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={formData.minCompletionRate}
                                                onChange={(e) => setFormData({ ...formData, minCompletionRate: parseInt(e.target.value) })}
                                                className="flex-1"
                                            />
                                            <span className="w-12 text-center text-sm font-bold text-blue-600">
                                                {formData.minCompletionRate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer - Fixed at bottom of modal */}
                    <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Create Table
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
