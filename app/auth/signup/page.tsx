'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Target, Mail, Lock, User } from 'lucide-react';

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            // Create account
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to create account');
                setIsLoading(false);
                return;
            }

            // Auto sign-in after successful signup
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Account created but sign-in failed. Please sign in manually.');
                setIsLoading(false);
            } else if (result?.ok) {
                // Use window.location for full page reload to ensure session loads
                window.location.href = '/obeya';
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Target size={48} className="text-[var(--primary)]" />
                    <h1 className="text-5xl font-black text-[var(--primary)]">LAPIS</h1>
                </div>

                {/* Sign Up Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Start your 60-day free trial</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Sign Up Form */}
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[var(--primary)] text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="text-center space-y-2">
                        <div className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-semibold">
                                Sign in
                            </Link>
                        </div>
                        <div className="text-sm text-gray-600">
                            <Link href="/obeya" className="text-blue-600 hover:text-blue-800 font-semibold">
                                ← Continue as guest
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
