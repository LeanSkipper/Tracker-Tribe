'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lock, Users, Globe, Save } from 'lucide-react';

interface MatchmakingData {
    // Identity & Context
    ageRange?: string;
    country?: string;
    timeZone?: string;
    languagesSpoken?: string[];
    city?: string;
    maritalStatus?: string;
    hasChildren?: boolean;

    // Professional
    professionalRole?: string;
    industry?: string;
    seniorityLevel?: string;
    companySize?: string;

    // Execution Style
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
    const [expandedSections, setExpandedSections] = useState({
        identity: true,
        professional: false,
        execution: false,
    });

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

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getPrivacyIcon = (level?: string) => {
        if (level === 'public') return <Globe size={16} className="text-blue-500" />;
        if (level === 'members') return <Users size={16} className="text-green-500" />;
        return <Lock size={16} className="text-gray-500" />;
    };

    const getPrivacyLabel = (level?: string) => {
        if (level === 'public') return 'Public';
        if (level === 'members') return 'Members Only';
        return 'Private';
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Identity & Context Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('identity')}
                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Identity & Context</h3>
                        <span className="text-sm text-gray-500">(7 fields)</span>
                        {getPrivacyIcon(data.identityPrivacy)}
                    </div>
                    {expandedSections.identity ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.identity && (
                    <div className="p-6 space-y-4 bg-white">
                        {/* Privacy Control */}
                        <div className="mb-4 pb-4 border-b">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Who can see this section?
                            </label>
                            <select
                                value={data.identityPrivacy || 'private'}
                                onChange={(e) => setData({ ...data, identityPrivacy: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="private">🔒 Private (Only me)</option>
                                <option value="members">👥 Members Only</option>
                                <option value="public">🌍 Public</option>
                            </select>
                        </div>

                        {/* Age Range */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Age Range</label>
                            <select
                                value={data.ageRange || ''}
                                onChange={(e) => setData({ ...data, ageRange: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select age range</option>
                                <option value="18-25">18-25</option>
                                <option value="26-35">26-35</option>
                                <option value="36-45">36-45</option>
                                <option value="46-55">46-55</option>
                                <option value="56+">56+</option>
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                            <input
                                type="text"
                                value={data.country || ''}
                                onChange={(e) => setData({ ...data, country: e.target.value })}
                                placeholder="e.g., United States, Portugal, Brazil"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Time Zone */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Time Zone</label>
                            <input
                                type="text"
                                value={data.timeZone || ''}
                                onChange={(e) => setData({ ...data, timeZone: e.target.value })}
                                placeholder="e.g., UTC+1, EST, PST"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Languages Spoken */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Languages Spoken</label>
                            <input
                                type="text"
                                value={data.languagesSpoken?.join(', ') || ''}
                                onChange={(e) => setData({ ...data, languagesSpoken: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })}
                                placeholder="e.g., English, Portuguese, Spanish"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple languages with commas</p>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">City (Optional)</label>
                            <input
                                type="text"
                                value={data.city || ''}
                                onChange={(e) => setData({ ...data, city: e.target.value })}
                                placeholder="e.g., Lisbon, New York, São Paulo"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Marital Status */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Marital Status</label>
                            <select
                                value={data.maritalStatus || ''}
                                onChange={(e) => setData({ ...data, maritalStatus: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="partnered">Partnered</option>
                                <option value="divorced">Divorced</option>
                            </select>
                        </div>

                        {/* Children */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Do you have children?</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setData({ ...data, hasChildren: true })}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${data.hasChildren === true
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setData({ ...data, hasChildren: false })}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${data.hasChildren === false
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Professional Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('professional')}
                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Professional</h3>
                        <span className="text-sm text-gray-500">(4 fields)</span>
                        {getPrivacyIcon(data.professionalPrivacy)}
                    </div>
                    {expandedSections.professional ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.professional && (
                    <div className="p-6 space-y-4 bg-white">
                        {/* Privacy Control */}
                        <div className="mb-4 pb-4 border-b">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Who can see this section?
                            </label>
                            <select
                                value={data.professionalPrivacy || 'members'}
                                onChange={(e) => setData({ ...data, professionalPrivacy: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="private">🔒 Private (Only me)</option>
                                <option value="members">👥 Members Only</option>
                                <option value="public">🌍 Public</option>
                            </select>
                        </div>

                        {/* Professional Role */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Professional Role</label>
                            <select
                                value={data.professionalRole || ''}
                                onChange={(e) => setData({ ...data, professionalRole: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select role</option>
                                <option value="employee">Employee</option>
                                <option value="founder">Founder</option>
                                <option value="freelancer">Freelancer</option>
                                <option value="investor">Investor</option>
                            </select>
                        </div>

                        {/* Industry */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Industry</label>
                            <input
                                type="text"
                                value={data.industry || ''}
                                onChange={(e) => setData({ ...data, industry: e.target.value })}
                                placeholder="e.g., SaaS, E-commerce, Consulting"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Seniority Level */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Seniority Level</label>
                            <select
                                value={data.seniorityLevel || ''}
                                onChange={(e) => setData({ ...data, seniorityLevel: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select level</option>
                                <option value="junior">Junior</option>
                                <option value="mid">Mid-Level</option>
                                <option value="senior">Senior</option>
                                <option value="executive">Executive</option>
                                <option value="c-level">C-Level</option>
                            </select>
                        </div>

                        {/* Company Size */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Company Size</label>
                            <select
                                value={data.companySize || ''}
                                onChange={(e) => setData({ ...data, companySize: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-1000">201-1,000 employees</option>
                                <option value="1000+">1,000+ employees</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Execution Style Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('execution')}
                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Execution Style</h3>
                        <span className="text-sm text-gray-500">(4 fields)</span>
                        {getPrivacyIcon(data.executionPrivacy)}
                    </div>
                    {expandedSections.execution ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.execution && (
                    <div className="p-6 space-y-4 bg-white">
                        {/* Privacy Control */}
                        <div className="mb-4 pb-4 border-b">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Who can see this section?
                            </label>
                            <select
                                value={data.executionPrivacy || 'members'}
                                onChange={(e) => setData({ ...data, executionPrivacy: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="private">🔒 Private (Only me)</option>
                                <option value="members">👥 Members Only</option>
                                <option value="public">🌍 Public</option>
                            </select>
                        </div>

                        {/* Action Speed */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Action Speed</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['fast', 'steady', 'slow'].map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setData({ ...data, actionSpeed: speed })}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${data.actionSpeed === speed
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {speed}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Planning Style */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Planning Style</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['structured', 'flexible', 'chaotic'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setData({ ...data, planningStyle: style })}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${data.planningStyle === style
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Follow-Through Level */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Follow-Through Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['low', 'medium', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setData({ ...data, followThroughLevel: level })}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${data.followThroughLevel === level
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Need for Accountability */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Need for Accountability</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['low', 'high'].map((need) => (
                                    <button
                                        key={need}
                                        onClick={() => setData({ ...data, needForAccountability: need })}
                                        className={`py-3 px-4 rounded-lg border-2 transition-all capitalize ${data.needForAccountability === need
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {need}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
