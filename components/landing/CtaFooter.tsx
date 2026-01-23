import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaFooter() {
    return (
        <footer className="relative bg-slate-950 py-32 text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

            <div className="relative container mx-auto px-4 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8">
                    <Sparkles size={12} />
                    <span>The Final Call</span>
                </div>

                <h2 className="mb-8 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 md:text-7xl tracking-tighter drop-shadow-sm">
                    Your Future Is Waiting.
                </h2>

                <p className="mx-auto mb-12 max-w-2xl text-xl md:text-2xl text-slate-400 leading-relaxed font-light">
                    You can keep doing what you've always done, or you can <span className="text-white font-semibold">step into the arena</span>.
                    The cost of inaction is far higher than the price of discipline.
                </p>

                <div className="flex flex-col justify-center gap-6 sm:flex-row items-center">
                    <Link
                        href="/onboarding/welcome?source=landing_footer"
                        className="group relative inline-flex items-center justify-center rounded-full bg-white px-12 py-6 text-xl font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <span className="mr-3">Start Free Now</span>
                        <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full w-[20px] bg-white/40 skew-x-[-20deg] animate-[shimmer_3s_infinite] -translate-x-[150%]" />
                        </div>
                    </Link>

                    <p className="text-sm text-slate-500 font-medium">
                        No credit card required
                    </p>
                </div>

                <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600 gap-4">
                    <p>&copy; {new Date().getFullYear()} Lapis Platform. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
