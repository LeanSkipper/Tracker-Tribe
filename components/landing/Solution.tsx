import { Target, Users, Shield, Zap } from 'lucide-react';
import Image from 'next/image';

export default function Solution() {
    return (
        <section className="relative overflow-hidden bg-white py-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-16 lg:flex-row">

                    {/* Visual / Screenshot Placeholder */}
                    <div className="relative w-full lg:w-1/2">
                        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-2xl"></div>
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                            <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-400">
                                {/* Ideally replaced with actual app screenshot later */}
                                <div className="text-center p-8">
                                    <div className="mb-4 text-6xl">🚀</div>
                                    <p className="font-bold">Mission Control Center</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="mb-6 text-3xl font-black text-slate-900 md:text-5xl">
                            Enter The <span className="text-blue-600">TNT Ecosystem</span>.
                        </h2>
                        <p className="mb-8 text-lg text-slate-600">
                            We provide the structure, the community, and the tools you need to stop drifting and start conquering. This isn't just an app; it's your operating system for success.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                        <Target size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">Crystal Clear Vision</h3>
                                    <p className="text-slate-600">
                                        Define your Grand Vision and break it down into actionable OKRs. Turn abstract dreams into concrete daily targets.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">Your Tribe</h3>
                                    <p className="text-slate-600">
                                        Match with high-caliber peers who demand your best. Weekly "Pit Stops" ensure you never hide from the truth.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                        <Zap size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">Gamified Discipline</h3>
                                    <p className="text-slate-600">
                                        Earn XP, badges, and rank up as you execute. We make the hard work addictive through proven gamification mechanics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
