import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-slate-900 pt-16 pb-32 md:pt-48 md:pb-48">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <div className="container relative mx-auto px-4 text-center">
                {/* Logo & Branding */}
                <div className="mb-8 flex justify-center">
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10 shadow-2xl">
                        <Image
                            src="/tnt-logo.jpg"
                            alt="TNT Logo"
                            width={120}
                            height={120}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </div>

                <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
                        Stop Drifting.
                    </span>
                    Start Dominating.
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl leading-relaxed">
                    The ultimate ecosystem for entrepreneurs who refuse to settle.
                    Structure your goals, join a powerful tribe, and execute with relentless discipline.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/onboarding/welcome?source=landing_hero"
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <span className="mr-2">Start Your Journey</span>
                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>

                    <p className="mt-4 text-sm text-slate-500 sm:mt-0 sm:ml-6">
                        <span className="mr-2">✨</span>
                        Free to start. No credit card required.
                    </p>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="h-[500px] w-[1000px] rounded-full bg-blue-600/20 blur-[100px]"></div>
            </div>
        </section>
    );
}
