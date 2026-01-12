'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Target, Mail, Lock } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setIsLoading(false);
            } else if (result?.ok) {
                // Use window.location for a full page reload to ensure session is loaded
                window.location.href = '/obeya';
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'linkedin') => {
        setIsLoading(true);
        try {
            await signIn(provider, { callbackUrl: '/obeya' });
        } catch (err) {
            setError(`Failed to sign in with ${provider}`);
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

                {/* Sign In Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Sign in to continue your journey</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="text-center space-y-2">
                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                            Forgot password?
                        </Link>
                        <div className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
                                Sign up
                            </Link>
                        </div>
                        <div className="text-sm text-gray-600">
                            <Link href="/onboarding/welcome" className="text-blue-600 hover:text-blue-800 font-semibold">
                                ← Try without email
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
