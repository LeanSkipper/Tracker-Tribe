'use client';

// import VisitorTracker from '@/components/VisitorTracker';
import Hero from '@/components/landing/Hero';
import PainPoints from '@/components/landing/PainPoints';
import Solution from '@/components/landing/Solution';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import Faq from '@/components/landing/Faq';
import CtaFooter from '@/components/landing/CtaFooter';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900">
      {/* <VisitorTracker /> */}
      <Hero />
      <SocialProof />
      <PainPoints />
      <Solution />
      <HowItWorks />
      <Faq />
      <CtaFooter />
    </main>
  );
}
