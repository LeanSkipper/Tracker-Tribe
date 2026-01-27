'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { MATCHMAKING_OPTIONS } from '@/lib/matchmakingOptions';
import VisibilitySelect from './VisibilitySelect';

interface MatchmakingData {
    // 11 Matchmaking Criteria (aligned with tribe creation)
    ageRange?: string;
    ageRangeCustom?: string;
    ageRangeVisibility?: string;
    lifeFocus?: string[];  // Multiple selections
    lifeFocusCustom?: string;
    lifeFocusVisibility?: string;
    professional?: string;
    professionalCustom?: string;
    professionalVisibility?: string;
    wealth?: string;
    wealthCustom?: string;
    wealthVisibility?: string;
    execution?: string[];  // Multiple selections
    executionCustom?: string;
    executionVisibility?: string;
    personality?: string[];  // Multiple selections
    personalityCustom?: string;
    personalityVisibility?: string;
    health?: string;
    healthCustom?: string;
    healthVisibility?: string;
    skills?: string[];  // Multiple selections
    skillsCustom?: string;
    skillsVisibility?: string;
    values?: string;
    valuesCustom?: string;
    valuesVisibility?: string;
    social?: string;
    socialCustom?: string;
    socialVisibility?: string;
    intent?: string;
    intentCustom?: string;
    intentVisibility?: string;

    // Legacy fields (keeping for backward compatibility)
    country?: string;
    timeZone?: string;
    languagesSpoken?: string[];
    city?: string;
    maritalStatus?: string;
    hasChildren?: boolean;
    professionalRole?: string;
    industry?: string;
    seniorityLevel?: string;
    companySize?: string;
    actionSpeed?: string;
    planningStyle?: string;
    followThroughLevel?: string;
    needForAccountability?: string;

    // Privacy
    identityPrivacy?: string;
    professionalPrivacy?: string;
    executionPrivacy?: string;

    // Metadata
    matchmakingCompleteness?: number;
    profileXpEarned?: number;
}

export default function MatchmakingProfile() {
    const [data, setData] = useState<MatchmakingData>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Fetch profile data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile/matchmaking');
            if (response.ok) {
                const profileData = await response.json();
                setData(profileData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');

        try {
            const response = await fetch('/api/profile/matchmaking', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                setSaveMessage(result.message || 'Profile saved!');

                // Refresh to update completion percentage
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaveMessage('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const criteriaLabels = {
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

    const multiSelectFields = ['lifeFocus', 'execution', 'personality', 'skills'];

    const handleMultiSelectChange = (key: string, option: string) => {
        const currentValues = (data[key as keyof MatchmakingData] as string[]) || [];
        const isSelected = currentValues.includes(option);

        let newValues: string[];
        if (isSelected) {
            newValues = currentValues.filter(v => v !== option);
        } else {
            // Limit to 3 selections
            if (currentValues.length >= 3) {
                alert('You can select up to 3 options. Please deselect one first.');
                return;
            }
            newValues = [...currentValues, option];
        }

        setData({ ...data, [key]: newValues });
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Matchmaking Criteria Sections */}
            {(Object.keys(criteriaLabels) as Array<keyof typeof criteriaLabels>).map((key) => {
                const isMultiSelect = multiSelectFields.includes(key);
                const currentValue = data[key];
                const hasOther = isMultiSelect
                    ? (currentValue as string[] || []).includes('Other')
                    : currentValue === 'Other';

                return (
                    <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {criteriaLabels[key]}
                                {isMultiSelect && <span className="text-sm font-normal text-gray-500 ml-2">(Select up to 3)</span>}
                            </h3>
                        </div>

                        <div className="p-6 space-y-4 bg-white">
                            {isMultiSelect ? (
                                /* Multi-Select Checkboxes */
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Select your {criteriaLabels[key].toLowerCase()}
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {MATCHMAKING_OPTIONS[key].map((option) => {
                                            const isChecked = (currentValue as string[] || []).includes(option);
                                            return (
                                                <label
                                                    key={option}
                                                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${isChecked
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleMultiSelectChange(key, option)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm">{option}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <VisibilitySelect
                                        value={data[`${key}Visibility` as keyof MatchmakingData] as string || 'private'}
                                        onChange={(value) => setData({ ...data, [`${key}Visibility`]: value })}
                                        fieldName={criteriaLabels[key]}
                                    />
                                </div>
                            ) : (
                                /* Single-Select Dropdown */
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Select your {criteriaLabels[key].toLowerCase()}
                                    </label>
                                    <select
                                        value={(currentValue as string) || ''}
                                        onChange={(e) => setData({ ...data, [key]: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select {criteriaLabels[key].toLowerCase()}...</option>
                                        {MATCHMAKING_OPTIONS[key].map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <VisibilitySelect
                                        value={data[`${key}Visibility` as keyof MatchmakingData] as string || 'private'}
                                        onChange={(value) => setData({ ...data, [`${key}Visibility`]: value })}
                                        fieldName={criteriaLabels[key]}
                                    />
                                </div>
                            )}

                            {/* Custom Field for "Other" */}
                            {hasOther && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Describe your custom {criteriaLabels[key].toLowerCase()}
                                    </label>
                                    <textarea
                                        value={data[`${key}Custom` as keyof MatchmakingData] as string || ''}
                                        onChange={(e) => setData({ ...data, [`${key}Custom`]: e.target.value })}
                                        placeholder={`Describe your ${criteriaLabels[key].toLowerCase()}...`}
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4">
                <div>
                    {saveMessage && (
                        <p className={`text-sm font-medium ${saveMessage.includes('Congratulations') ? 'text-green-600' : 'text-gray-600'}`}>
                            {saveMessage}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Profile
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
