'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus } from 'lucide-react';
import InspirationModal from '@/components/InspirationModal';
import { GoalTemplate } from '@/lib/goalTemplates';

export default function SelectTemplatePage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleSelectTemplate = (template: GoalTemplate) => {
        // Store template in sessionStorage for next step
        sessionStorage.setItem('onboarding_template', JSON.stringify(template));
        router.push('/onboarding/customize');
    };

    const handleCreateFromScratch = () => {
        sessionStorage.removeItem('onboarding_template');
        router.push('/onboarding/customize');
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>

            <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Step 2 of 3</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Choose Your First Goal</h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">
                        Pick a template to get started quickly, or create your own from scratch.
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* Browse Templates */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/30 hover:border-purple-500 hover:bg-slate-900 hover:shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)] transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-purple-500/20">
                            <Sparkles size={28} className="text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Browse Templates</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Choose from 35 ready-made goals across 7 life areas
                        </p>
                        <div className="flex items-center text-purple-400 font-bold text-xs uppercase tracking-wider">
                            Recommended for first goal →
                        </div>
                    </button>

                    {/* Create from Scratch */}
                    <button
                        onClick={handleCreateFromScratch}
                        className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-blue-500 hover:bg-slate-900 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                            <Plus size={28} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Create from Scratch</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Build your own custom goal with full flexibility
                        </p>
                        <div className="flex items-center text-blue-400 font-bold text-xs uppercase tracking-wider">
                            Custom Build →
                        </div>
                    </button>
                </div>

                {/* Inspiration Modal */}
                {isModalOpen && (
                    <InspirationModal
                        onClose={() => setIsModalOpen(false)}
                        onSelectTemplate={handleSelectTemplate}
                        onCreateFromScratch={handleCreateFromScratch}
                    />
                )}
            </div>
        </main>
    );
}
