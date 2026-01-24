'use client';

import Link from 'next/link';
import { ArrowRight, Lightbulb, Check } from 'lucide-react';
import CtaFooter from '@/components/landing/CtaFooter';
import VisitorTracker from '@/components/VisitorTracker';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black font-sans">
      <VisitorTracker />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight">
            Turn Strategy into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Plan.</span><br />
            Your Plan into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Execution.</span><br />
            Execution into <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Results.</span>
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
            We are the average of our network. <span className="text-white font-semibold">Join the elite.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/onboarding/welcome"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(234,179,8,0.3)]"
            >
              Start Free Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/onboarding/upgrade"
              className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold"
            >
              View Grand Slam Offer
            </Link>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY SECTION - The Road Less Stupid */}
      <section className="bg-zinc-900/50 py-32 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-8">
              <Lightbulb size={14} /> The Road Less Stupid
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Goals without plans are just <span className="text-gray-500">fantasies.</span>
            </h2>

            <div className="space-y-8 text-lg text-gray-400 leading-relaxed">
              <blockquote className="border-l-4 border-yellow-500/50 pl-6 italic text-gray-300">
                &quot;About the stupidest thing management can do is to announce some lofty goal for the year (&apos;Our revenue target is $6,000,000 this year&apos;) without any thought about the working plan to attain it.&quot;
              </blockquote>

              <p>
                The emphasis must be on the <strong className="text-white">CRITICAL drivers</strong> and the <strong className="text-white">COMMITMENT required</strong>. By tracking your effort, you immediately know if your goals are real or simply a mirage.
              </p>

              <p className="text-white text-xl font-medium">
                This platform isn&apos;t just a tracker. It&apos;s an accountability engine for your reality.
              </p>
            </div>
          </div>

          {/* Visual/Feature List */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-10 blur-2xl" />
            <div className="relative bg-black border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner">⚡</div>
                <div>
                  <h3 className="font-bold text-2xl mb-1">Your Execution System</h3>
                  <p className="text-sm text-gray-400">The difference between dreaming and doing.</p>
                </div>
              </div>

              <ul className="space-y-6">
                {[
                  "GPS Tracking (Goals, Plans, Status)",
                  "Visual Management Dashboards",
                  "Tribe Accountability & Peer Pressure",
                  "A System with Rituals & Habits"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-300 text-lg">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER CTA */}
      <CtaFooter />

    </main>
  );
}
