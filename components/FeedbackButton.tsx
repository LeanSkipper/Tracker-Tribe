'use client';

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feedback.trim()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

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

            if (response.ok) {
                setSubmitStatus('success');
                setFeedback('');
                setEmail('');
                setTimeout(() => {
                    setIsOpen(false);
                    setSubmitStatus('idle');
                }, 2000);
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
        <>
            {/* Floating Feedback Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-[var(--primary)] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-40 flex items-center gap-2 group"
                title="Send Feedback"
            >
                <MessageSquare size={24} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">
                    Feedback
                </span>
            </button>

            {/* Feedback Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2">
                                <MessageSquare size={28} />
                                Share Your Feedback
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-6">
                            We'd love to hear your suggestions and ideas to improve the platform!
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Your Suggestion *
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email (optional)
                                </label>
                                <input
                                    type="email"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional: Provide your email if you'd like us to follow up with you
                                </p>
                            </div>

                            {submitStatus === 'success' && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <span className="text-xl">✓</span>
                                    <span className="font-medium">Thank you! Your feedback has been submitted.</span>
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
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
