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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500">
                        <span>Step 2 of 3</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Choose Your First Goal</h1>
                    <p className="text-lg text-gray-600">
                        Pick a template to get started quickly, or create your own from scratch
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* Browse Templates */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all group"
                    >
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles size={32} className="text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Templates</h3>
                        <p className="text-gray-600 text-sm">
                            Choose from 35 ready-made goals across 7 life areas
                        </p>
                        <div className="mt-4 text-purple-600 font-bold text-sm">
                            Recommended for beginners →
                        </div>
                    </button>

                    {/* Create from Scratch */}
                    <button
                        onClick={handleCreateFromScratch}
                        className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all group"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Create from Scratch</h3>
                        <p className="text-gray-600 text-sm">
                            Build your own custom goal with full flexibility
                        </p>
                        <div className="mt-4 text-blue-600 font-bold text-sm">
                            For experienced users →
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
        </div>
    );
}
