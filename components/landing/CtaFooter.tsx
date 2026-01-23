import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaFooter() {
    return (
        <footer className="bg-slate-900 py-24 text-center">
            <div className="container mx-auto px-4">
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                    Your Future Is Waiting.
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-400">
                    You can keep doing what you've always done, or you can step into the arena.
                    The cost of inaction is far higher than the price of discipline.
                </p>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/onboarding/welcome?source=landing_footer"
                        className="group inline-flex items-center justify-center rounded-full bg-white px-10 py-5 text-lg font-bold text-slate-900 transition-all hover:scale-105 hover:bg-blue-50 hover:text-blue-600 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <span className="mr-2">Start Free Now</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="mt-24 border-t border-slate-800 pt-8 text-sm text-slate-600">
                    <p>&copy; {new Date().getFullYear()} TNT Ecosystem. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
