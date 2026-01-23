'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, Target, TrendingUp, Save, X, ChevronDown, ChevronUp, Lock, Calculator, HelpCircle, DollarSign } from 'lucide-react';
import TribeMonetizationTermsModal from './TribeMonetizationTermsModal';
import { useRouter } from 'next/navigation';

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
    // Removed minCompletionRate
    minReputation: number;

    // Pricing
    isPaid: boolean;
    subscriptionPrice: number;
    subscriptionFrequency: 'weekly' | 'monthly' | 'yearly' | 'lifetime' | '';
}

interface TribeCreationFormProps {
    onClose?: () => void;
    onSuccess?: () => void;
    initialData?: any; // Accepting existing tribe data for editing
    isModal?: boolean; // Default true
    readOnly?: boolean; // Default false
    canMonetize?: boolean; // New prop
}

// Helper to parse existing matchmaking fields to form structure
const parseMatchmaking = (data: any): MatchmakingCriteria => {
    return {
        ageRange: { enabled: data.matchmakingAgeRange || false, description: data.matchmakingAgeRangeDesc || '' },
        lifeFocus: { enabled: data.matchmakingLifeFocus || false, description: data.matchmakingLifeFocusDesc || '' },
        professional: { enabled: data.matchmakingProfessional || false, description: data.matchmakingProfessionalDesc || '' },
        wealth: { enabled: data.matchmakingWealth || false, description: data.matchmakingWealthDesc || '' },
        execution: { enabled: data.matchmakingExecution || false, description: data.matchmakingExecutionDesc || '' },
        personality: { enabled: data.matchmakingPersonality || false, description: data.matchmakingPersonalityDesc || '' },
        health: { enabled: data.matchmakingHealth || false, description: data.matchmakingHealthDesc || '' },
        skills: { enabled: data.matchmakingSkills || false, description: data.matchmakingSkillsDesc || '' },
        values: { enabled: data.matchmakingValues || false, description: data.matchmakingValuesDesc || '' },
        social: { enabled: data.matchmakingSocial || false, description: data.matchmakingSocialDesc || '' },
        intent: { enabled: data.matchmakingIntent || false, description: data.matchmakingIntentDesc || '' },
    };
};

export default function TribeCreationForm({
    onClose,
    onSuccess,
    initialData,
    isModal = true,
    readOnly = false,
    canMonetize = false
}: TribeCreationFormProps) {
    const isEditing = !!initialData;
    const router = useRouter();
    const [showTermsModal, setShowTermsModal] = useState(false);

    const [formData, setFormData] = useState<TribeFormData>({
        name: initialData?.name || '',
        topic: initialData?.topic || '',
        meetingFrequency: initialData?.meetingFrequency || '', // 'daily' | 'weekly' | 'monthly'
        meetingTimeHour: initialData?.meetingTimeHour ?? 10,
        meetingTimeMinute: initialData?.meetingTimeMinute ?? 0,
        maxMembers: initialData?.maxMembers || 10,
        matchmaking: initialData ? parseMatchmaking(initialData) : {
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
        minLevel: initialData?.minLevel || 1,
        minGrit: initialData?.minGrit || 0,
        minExperience: initialData?.minExperience || 0,
        // minCompletionRate removed
        minReputation: initialData?.minReputation || 0,

        isPaid: initialData?.isPaid || false,
        subscriptionPrice: initialData?.subscriptionPrice || 0,
        subscriptionFrequency: initialData?.subscriptionFrequency || 'monthly',
    });

    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        matchmaking: readOnly, // Default open for read-only to show all info
        stats: readOnly,
        pricing: readOnly,
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
                        // minCompletionRate removed
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
    }, [formData.minLevel, formData.minGrit, formData.minExperience, formData.minReputation]);

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

        if (formData.isPaid) {
            if (!formData.subscriptionPrice || formData.subscriptionPrice <= 0) {
                setError('Price must be greater than 0');
                setExpandedSections(prev => ({ ...prev, pricing: true }));
                return;
            }
            if (!formData.subscriptionFrequency) {
                setError('Please select a billing frequency');
                setExpandedSections(prev => ({ ...prev, pricing: true }));
                return;
            }
        }

        setLoading(true);

        try {
            const url = isEditing ? `/api/tribes/${initialData.id}` : '/api/tribes/create';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess?.();
                onClose?.();
            } else {
                const data = await response.json();
                setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} tribe`);
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

    const Content = (
        <div className={`space-y-4 ${!isModal ? 'w-full' : ''}`}>
            {!isModal && (
                <div className="mb-6">
                    <h5 className="font-bold text-slate-700 mb-2">Tribe Configuration</h5>
                    <p className="text-sm text-slate-500">
                        {readOnly ? 'Current settings for this tribe.' : 'Configure your tribe settings.'}
                    </p>
                </div>
            )}

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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
                                required
                                disabled={readOnly}
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
                                disabled={readOnly}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
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
                                        disabled={readOnly}
                                        onClick={() => setFormData({ ...formData, meetingFrequency: freq })}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${formData.meetingFrequency === freq
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                            : 'border-gray-300 hover:border-gray-400'
                                            } ${readOnly && formData.meetingFrequency !== freq ? 'opacity-50' : ''}`}
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
                                    disabled={readOnly}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
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
                                    disabled={readOnly}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
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
                                disabled={readOnly}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
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
                                            disabled={readOnly}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                readOnly={readOnly}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-600"
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
                                    disabled={readOnly}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
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
                                    disabled={readOnly}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
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
                                    disabled={readOnly}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
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
                                        disabled={readOnly}
                                        className="flex-1 disabled:opacity-50"
                                    />
                                    <span className="w-12 text-center text-sm font-bold text-blue-600">
                                        {formData.minReputation.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Completion Rate */}
                        {/* Completion Rate Removed */}
                    </div>
                )}
            </div>

            {/* Section 4: Pricing & Access */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection('pricing')}
                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-1 rounded-full">
                            <div className="text-green-600 font-bold">$</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">4. Pricing & Access <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">Beta</span></h3>
                    </div>
                    {expandedSections.pricing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.pricing && (
                    <div className="p-6 space-y-4 bg-white border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <label className="font-bold text-gray-900">Is this a Paid Tribe?</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
                                disabled={readOnly}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPaid ? 'bg-green-600' : 'bg-gray-200'} ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPaid ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {formData.isPaid && (
                            <div className="bg-green-50 p-4 rounded-xl space-y-6 border border-green-100">
                                {/* Price Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-gray-700">
                                            Price per member <span className="text-gray-500 font-normal">(extra to subscription)</span>
                                        </label>
                                        <span className="text-xl font-black text-green-700">
                                            ${formData.subscriptionPrice}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="500"
                                        step="5"
                                        value={formData.subscriptionPrice || 0}
                                        onChange={(e) => setFormData({ ...formData, subscriptionPrice: parseFloat(e.target.value) })}
                                        disabled={readOnly}
                                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                                        <span>$5</span>
                                        <span>$500+</span>
                                    </div>
                                </div>

                                {/* Billing Frequency */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Billing Frequency</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['monthly', 'yearly'] as const).map((freq) => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, subscriptionFrequency: freq })}
                                                disabled={readOnly}
                                                className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${formData.subscriptionFrequency === freq
                                                    ? 'border-green-500 bg-green-100 text-green-700 font-bold'
                                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                                    } ${readOnly && formData.subscriptionFrequency !== freq ? 'opacity-50' : ''}`}
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Revenue Calculator */}
                                <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                                        <Calculator size={16} className="text-green-600" />
                                        Estimated Monthly Revenue
                                    </h4>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Gross Revenue ({formData.maxMembers} members x ${formData.subscriptionPrice})</span>
                                            <span>${(formData.maxMembers * (formData.subscriptionPrice || 0)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Platform Fee (30%)</span>
                                            <span>-${((formData.maxMembers * (formData.subscriptionPrice || 0)) * 0.30).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-lg text-green-700">
                                            <span>Net Potential:</span>
                                            <span>${((formData.maxMembers * (formData.subscriptionPrice || 0)) * 0.70).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Link */}
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-sm font-bold text-green-700 hover:text-green-800 underline flex items-center gap-1"
                                    >
                                        <HelpCircle size={14} />
                                        See commission terms & rules
                                    </button>
                                </div>
                            </div>
                        )}

                        {!formData.isPaid && (
                            <p className="text-sm text-gray-500 italic">This tribe will be free for members to join.</p>
                        )}
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
    );

    if (!isModal) {
        return Content;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center flex items-center justify-center">
                {/* Overlay */}
                <div className="fixed inset-0 transition-opacity" onClick={onClose} aria-hidden="true" />

                {/* Modal Container */}
                <div className="inline-block w-full max-w-3xl my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative z-10 flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Users size={28} className="text-blue-600" />
                                {isEditing ? 'Edit Tribe Settings' : 'Create Your Mastermind Table'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Update your tribe configuration and requirements' : 'Set up your tribe with matchmaking criteria'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content (Reused) */}
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                        {Content}
                    </div>

                    {!readOnly && (
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
                                        {isEditing ? 'Save Changes' : 'Create Table'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <TribeMonetizationTermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
    );
}
