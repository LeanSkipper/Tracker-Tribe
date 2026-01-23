export default function SocialProof() {
    return (
        <section className="border-y border-slate-200 bg-slate-50 py-12">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-8 text-sm font-bold uppercase tracking-wider text-slate-400">
                    Trusted by builders from
                </p>
                <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
                    {/* Placeholder Brand Names for Premium Feel (Can replace with actual logos) */}
                    <span className="text-xl font-black text-slate-900">ACME Corp</span>
                    <span className="text-xl font-black text-slate-900">Globex</span>
                    <span className="text-xl font-black text-slate-900">Soylent</span>
                    <span className="text-xl font-black text-slate-900">Initech</span>
                    <span className="text-xl font-black text-slate-900">Umbrella</span>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm text-left">
                        <div className="mb-4 flex text-amber-400">★★★★★</div>
                        <p className="mb-4 text-slate-600 mb-6 italic">"I was drowning in tasks with zero direction. TNT gave me the structure I was missing. My revenue doubled in 3 months."</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                            <div>
                                <p className="font-bold text-slate-900">Alex M.</p>
                                <p className="text-xs text-slate-500">SaaS Founder</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm text-left">
                        <div className="mb-4 flex text-amber-400">★★★★★</div>
                        <p className="mb-4 text-slate-600 mb-6 italic">"The community is elite. No fluff, just execution. The weekly Pit Stops are now the most important hour of my week."</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                            <div>
                                <p className="font-bold text-slate-900">Sarah J.</p>
                                <p className="text-xs text-slate-500">Agency Owner</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm text-left md:hidden lg:block">
                        <div className="mb-4 flex text-amber-400">★★★★★</div>
                        <p className="mb-4 text-slate-600 mb-6 italic">"Finally, a tool that understands how entrepreneurs think. The gamification actually works to keep you disciplined."</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                            <div>
                                <p className="font-bold text-slate-900">David R.</p>
                                <p className="text-xs text-slate-500">Consultant</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
