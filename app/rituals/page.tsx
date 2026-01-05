'use client';

import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function RitualsPage() {
    const [form, setForm] = useState({
        win: '',
        stuck: '',
        planVsActual: '',
        mood: 3
    });

    const [submitted, setSubmitted] = useState(false);

    // Mock submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // In a real app, POST to /api/rituals
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Save size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">Ritual Logged!</h2>
                    <p className="text-gray-600 mb-6">Your weekly reflections have been saved. See you at the Mastermind.</p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-[var(--primary)] hover:underline"
                    >
                        Submit another query
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">Weekly Ritual</h1>
                    <p className="text-gray-600">Reflect on your progress. Define your Reality.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Plan vs Actual */}
                    <div className="card bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Plan vs Actual (Mod Op Logic)
                        </label>
                        <p className="text-xs text-gray-400 mb-3">Did you hit your targets from last week?</p>
                        <textarea
                            required
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none min-h-[100px]"
                            placeholder="I planned to X, but I did Y because..."
                            value={form.planVsActual}
                            onChange={e => setForm({ ...form, planVsActual: e.target.value })}
                        />
                    </div>

                    {/* Win & Stuck */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="card bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-semibold text-green-700 mb-2">Weekly Win</label>
                            <textarea
                                required
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-[80px]"
                                placeholder="What went well?"
                                value={form.win}
                                onChange={e => setForm({ ...form, win: e.target.value })}
                            />
                        </div>

                        <div className="card bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-semibold text-red-700 mb-2">Stuck Point</label>
                            <textarea
                                required
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[80px]"
                                placeholder="Where are you blocked?"
                                value={form.stuck}
                                onChange={e => setForm({ ...form, stuck: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Mood */}
                    <div className="card bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-4">Mood / Energy Level</label>
                        <div className="flex justify-between items-center px-4">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setForm({ ...form, mood: val })}
                                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all
                    ${form.mood === val
                                            ? 'bg-[var(--primary)] text-white scale-110 shadow-lg'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                  `}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                            <span>Drained</span>
                            <span>Unstoppable</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full btn btn-primary py-4 text-lg shadow-lg flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Submit Ritual
                    </button>
                </form>
            </div>
        </div>
    );
}
