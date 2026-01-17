'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface FeedbackModalProps {
    onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
    const { data: session } = useSession();
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [earnedXP, setEarnedXP] = useState(0);

    // Pre-fill email for logged-in users
    useEffect(() => {
        if (session?.user?.email && !email) {
            setEmail(session.user.email);
        }
    }, [session, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feedback.trim()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setEarnedXP(0);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback: feedback.trim(),
                    email: email.trim() || null,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setEarnedXP(data.xpEarned || 0);
                setFeedback('');
                if (!session) setEmail(''); // Clear email only if not logged in
                setTimeout(() => {
                    onClose();
                    setSubmitStatus('idle');
                }, 3000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2">
                        <MessageSquare size={28} />
                        Share Your Feedback
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    We&apos;d love to hear your suggestions and ideas to improve the platform!
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            Your Suggestion *
                            {session && (
                                <span className="text-xs font-normal bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                    ⭐ Earn +1 XP
                                </span>
                            )}
                        </label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none resize-none"
                            rows={6}
                            placeholder="Tell us what you think could be better, what features you'd like to see, or any issues you've encountered..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            Email
                            {session && (
                                <span className="text-xs font-normal bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                    ⭐ Earn +1 XP
                                </span>
                            )}
                        </label>
                        <input
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            💡 Add your email to earn 1 XP and help us recognize your valuable contribution!
                        </p>
                    </div>

                    {submitStatus === 'success' && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">✓</span>
                                <span className="font-medium">Thank you! Your feedback has been submitted.</span>
                            </div>
                            {earnedXP > 0 && (
                                <div className="flex items-center gap-2 ml-7 text-sm">
                                    <span className="text-yellow-600 font-bold">⭐ +{earnedXP} XP earned!</span>
                                    <span className="text-gray-600">Great job!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <span className="text-xl">⚠</span>
                            <span className="font-medium">Failed to submit. Please try again.</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !feedback.trim()}
                            className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Feedback
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
