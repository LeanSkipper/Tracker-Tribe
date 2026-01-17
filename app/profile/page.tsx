"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User as UserIcon, Mail, Lock, Save, X, CheckCircle, AlertCircle, Shield, TrendingUp, Target, Zap, Award, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || '',
            }));
            fetchProfile();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status, session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            setMessage({ type: 'error', text: 'Name and email are required' });
            return;
        }

        if (formData.newPassword) {
            if (formData.newPassword.length < 8) {
                setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'Passwords do not match' });
                return;
            }
            if (!formData.currentPassword) {
                setMessage({ type: 'error', text: 'Current password is required to change password' });
                return;
            }
        }

        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setProfile(data.profile);
                setIsEditing(false);
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while updating profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: profile?.name || '',
            email: profile?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setMessage(null);
    };

    const toggleKPI = (kpiName: string) => {
        setExpandedKPI(expandedKPI === kpiName ? null : kpiName);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-blue-600 animate-pulse text-xl font-bold">Loading Profile...</div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
                    <p className="text-gray-600 mb-6">Please sign in to view your profile</p>
                    <a href="/auth/signin" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    const level = profile?.level || 1;
    const grit = profile?.grit || 0;
    const xp = profile?.experience || 0;
    const completion = profile?.taskCompletionRate ? Math.round(profile.taskCompletionRate * 100) : 0;
    const reputation = profile?.reputationScore || 0;

    // Calculate progress percentages for visual scales
    const levelProgress = ((level % 10) / 10) * 100; // Progress within current tier
    const gritProgress = Math.min((grit / 100) * 100, 100);
    const xpProgress = Math.min((xp / 1000) * 100, 100);
    const reputationProgress = Math.min((reputation / 10) * 100, 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* 1. YOUR STATS - Now at the top */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" size={28} />
                        Your Stats
                    </h2>

                    <div className="space-y-4">
                        {/* Level KPI */}
                        <div
                            onClick={() => toggleKPI('level')}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <Award className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600">Level</div>
                                        <div className="text-3xl font-black text-blue-600">{level}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="w-32 bg-blue-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${levelProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">Tier {Math.floor(level / 10) + 1}</div>
                                    </div>
                                    {expandedKPI === 'level' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedKPI === 'level' && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">How to Level Up:</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Complete goals and action plans to earn XP</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Maintain consistent progress (builds Grit)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Participate in tribes and help peers</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Grit KPI */}
                        <div
                            onClick={() => toggleKPI('grit')}
                            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                                        <Zap className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600">Grit</div>
                                        <div className="text-3xl font-black text-purple-600">{grit}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="w-32 bg-purple-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-purple-700 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${gritProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">{gritProgress.toFixed(0)}% to max</div>
                                    </div>
                                    {expandedKPI === 'grit' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedKPI === 'grit' && (
                                <div className="mt-4 pt-4 border-t border-purple-200">
                                    <h4 className="font-bold text-gray-900 mb-2">How to Build Grit:</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600 font-bold">•</span>
                                            <span>Log in daily and update your progress</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600 font-bold">•</span>
                                            <span>Complete tasks even when they're difficult</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600 font-bold">•</span>
                                            <span>Maintain streaks and consistency over time</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* XP KPI */}
                        <div
                            onClick={() => toggleKPI('xp')}
                            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-green-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
                                        <Star className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600">Experience Points</div>
                                        <div className="text-3xl font-black text-green-600">{xp}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="w-32 bg-green-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-green-700 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${xpProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">{xp}/1000 XP</div>
                                    </div>
                                    {expandedKPI === 'xp' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedKPI === 'xp' && (
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <h4 className="font-bold text-gray-900 mb-2">How to Earn XP:</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 font-bold">•</span>
                                            <span>Complete action plan tasks (+10 XP each)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 font-bold">•</span>
                                            <span>Achieve OKR milestones (+50 XP)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 font-bold">•</span>
                                            <span>Finish entire goals (+100 XP)</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Completion KPI */}
                        <div
                            onClick={() => toggleKPI('completion')}
                            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center">
                                        <Target className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600">Completion Rate</div>
                                        <div className="text-3xl font-black text-orange-600">{completion}%</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="w-32 bg-orange-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-orange-500 to-orange-700 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${completion}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">{completion < 70 ? 'Needs work' : completion < 90 ? 'Good!' : 'Excellent!'}</div>
                                    </div>
                                    {expandedKPI === 'completion' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedKPI === 'completion' && (
                                <div className="mt-4 pt-4 border-t border-orange-200">
                                    <h4 className="font-bold text-gray-900 mb-2">How to Improve Completion:</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-600 font-bold">•</span>
                                            <span>Focus on finishing started tasks before adding new ones</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-600 font-bold">•</span>
                                            <span>Break large tasks into smaller, achievable steps</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-600 font-bold">•</span>
                                            <span>Set realistic deadlines and stick to them</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Reputation KPI */}
                        <div
                            onClick={() => toggleKPI('reputation')}
                            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center">
                                        <Shield className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600">Reputation</div>
                                        <div className="text-3xl font-black text-yellow-600">{reputation.toFixed(1)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="w-32 bg-yellow-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-yellow-500 to-yellow-700 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${reputationProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">{reputation.toFixed(1)}/10.0</div>
                                    </div>
                                    {expandedKPI === 'reputation' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedKPI === 'reputation' && (
                                <div className="mt-4 pt-4 border-t border-yellow-200">
                                    <h4 className="font-bold text-gray-900 mb-2">How to Build Reputation:</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Join tribes and actively participate in sessions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Help peers achieve their goals</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Share your roadmap and inspire others</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MY PROFILE - Now in the middle */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <UserIcon size={48} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
                            <p className="text-gray-600 mt-1">Manage your account settings</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            <span className="font-medium">{message.text}</span>
                            <button
                                onClick={() => setMessage(null)}
                                className="ml-auto hover:opacity-70"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* Login Credentials Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                            <Lock size={20} className="text-blue-600" />
                            Login Credentials
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            These are the credentials you use to sign in to your account
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="font-bold text-gray-900">{profile?.email || session?.user?.email || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Lock size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600">Password:</span>
                                <span className="font-medium text-gray-700">••••••••</span>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-bold"
                                    >
                                        Change Password
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <UserIcon size={16} className="inline mr-2" />
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Your name"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                    {profile?.name || session?.user?.name || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Email (editable) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email Address
                            </label>
                            {isEditing ? (
                                <div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="your@email.com"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        This will also update your login email
                                    </p>
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                    {profile?.email || session?.user?.email || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Password Change Section */}
                        {isEditing && (
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield size={20} className="text-blue-600" />
                                    Change Password
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Leave blank if you don&apos;t want to change your password
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="At least 8 characters"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <X size={20} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ACCOUNT INFORMATION - Now at the bottom */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Subscription:</span>
                            <span className="ml-2 font-bold text-gray-900">
                                {profile?.subscriptionStatus === 'TRIAL' ? '60-Day Free Trial' : profile?.subscriptionPlan || 'Free'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Member Since:</span>
                            <span className="ml-2 font-bold text-gray-900">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        {profile?.trialEndDate && (
                            <div>
                                <span className="text-gray-600">Trial Ends:</span>
                                <span className="ml-2 font-bold text-blue-600">
                                    {new Date(profile.trialEndDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
