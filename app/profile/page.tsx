"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User as UserIcon, Mail, Lock, Save, X, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
            // Initialize form data from session immediately
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
        // Validation
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
                // Clear password fields
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
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
                                    Leave blank if you don't want to change your password
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

                {/* KPI Stats Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <h2 className="text-xl font-black text-gray-900 mb-6">Your Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-blue-600">{profile?.level || 1}</div>
                            <div className="text-sm font-medium text-gray-700 mt-1">Level</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-purple-600">{profile?.grit || 0}</div>
                            <div className="text-sm font-medium text-gray-700 mt-1">Grit</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-green-600">{profile?.experience || 0}</div>
                            <div className="text-sm font-medium text-gray-700 mt-1">XP</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-orange-600">
                                {profile?.taskCompletionRate ? Math.round(profile.taskCompletionRate * 100) : 0}%
                            </div>
                            <div className="text-sm font-medium text-gray-700 mt-1">Completion</div>
                        </div>
                    </div>
                    <div className="mt-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Reputation Score</span>
                            <span className="text-2xl font-black text-yellow-600">
                                {profile?.reputationScore ? profile.reputationScore.toFixed(1) : '0.0'}
                            </span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((profile?.reputationScore || 0) * 10, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
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
