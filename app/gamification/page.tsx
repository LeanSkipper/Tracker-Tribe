"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, TrendingUp, Shield, Zap, Award, Target, HelpCircle } from 'lucide-react';

export default function GamificationRulesPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/profile" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900">Rules of the Game</h1>
                        <p className="text-slate-600">How to level up and increase your Global Score</p>
                    </div>
                </div>

                {/* Global Score Formula */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>

                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                        <TrendingUp className="text-yellow-300" />
                        The Global Score Formula
                    </h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 relative z-10 mb-6">
                        <div className="text-center">
                            <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Level</div>
                            <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                                <span className="text-2xl md:text-4xl font-black">Level</span>
                            </div>
                        </div>
                        <div className="text-2xl font-black opacity-50">×</div>
                        <div className="text-center">
                            <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Grit %</div>
                            <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                                <span className="text-2xl md:text-4xl font-black">Grit</span>
                            </div>
                        </div>
                        <div className="text-2xl font-black opacity-50">×</div>
                        <div className="text-center">
                            <div className="text-xs uppercase tracking-wider opacity-75 mb-1">XP</div>
                            <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                                <span className="text-2xl md:text-4xl font-black">XP</span>
                            </div>
                        </div>
                        <div className="text-2xl font-black opacity-50">×</div>
                        <div className="text-center">
                            <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Reputation</div>
                            <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                                <span className="text-2xl md:text-4xl font-black">Rep</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-indigo-100 text-sm md:text-base max-w-2xl mx-auto relative z-10">
                        Your Global Score is accurate reflection of your overall impact. It compounds your experience (Level), your consistency (Grit), your current momentum (XP), and how others value you (Reputation).
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* XP Table */}
                    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <Star size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Experience Points (XP)</h2>
                                <p className="text-sm text-gray-500">Earn XP to Level Up. Every 1000 XP increases your Level.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {/* Positive Actions */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Daily & Weekly Wins</h3>
                                <XPItem label="Feedback Given" value={1} />
                                <XPItem label="Generate a Task" value={2} />
                                <XPItem label="Complete a Task" value={3} />
                                <XPItem label="Attend Mastermind Session" value={10} />
                                <XPItem label="Complete a Pit Stop" value={20} />
                                <XPItem label="Referral Link Opened" value={50} highlight />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Performance Milestones</h3>
                                <XPItem label="Red KPI" value={5} />
                                <XPItem label="Green KPI" value={10} />
                                <XPItem label="Red OKR" value={20} />
                                <XPItem label="Green OKR" value={50} />
                                <XPItem label="Achieve Quarter KPI" value={40} highlight />
                                <XPItem label="Achieve Quarter OKR" value={200} highlight />
                            </div>

                            {/* Negative Actions */}
                            <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Penalties</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <XPItem label="Late Pit Stop (Week)" value={-5} isNegative />
                                    <XPItem label="No Pit Stop (Week)" value={-10} isNegative />
                                    <XPItem label="Miss Mastermind Session" value={-10} isNegative />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grit & Reputation Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Grit */}
                        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Grit (Consistency)</h2>
                                    <p className="text-sm text-gray-500">Calculated as an average percentage.</p>
                                </div>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="font-medium text-slate-700">Task Completion Rate</span>
                                    <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">%</span>
                                </li>
                                <li className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="font-medium text-slate-700">Mastermind Attendance</span>
                                    <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">%</span>
                                </li>
                                <li className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="font-medium text-slate-700">Pit Stops on Time</span>
                                    <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">%</span>
                                </li>
                            </ul>
                        </div>

                        {/* Reputation */}
                        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Reputation Scorecard</h2>
                                    <p className="text-sm text-gray-500">Rated 1-10 by your peers.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {[
                                    "Reliability", "Active Presence", "Constructive Candor",
                                    "Generosity", "Energy Catalyst", "Responsiveness",
                                    "Coachability", "Knowledge Transparency", "Emotional Regulation", "Preparation"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-400 text-sm pb-8">
                    <p>Gamification criteria are dynamic and subject to change based on seasonal events.</p>
                </div>
            </div>
        </div>
    );
}

function XPItem({ label, value, highlight = false, isNegative = false }: { label: string, value: number, highlight?: boolean, isNegative?: boolean }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${highlight
                ? 'bg-blue-50 border-blue-100'
                : isNegative
                    ? 'bg-red-50 border-red-100'
                    : 'bg-white border-slate-100 hover:border-slate-200'
            }`}>
            <span className={`font-medium ${isNegative ? 'text-red-700' : 'text-slate-700'}`}>{label}</span>
            <span className={`font-black ${isNegative ? 'text-red-600' : highlight ? 'text-blue-600' : 'text-green-600'
                }`}>
                {value > 0 ? '+' : ''}{value} XP
            </span>
        </div>
    );
}
