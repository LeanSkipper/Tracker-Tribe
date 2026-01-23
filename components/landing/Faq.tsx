'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Faq() {
    const faqs = [
        {
            question: "Is this just another to-do list app?",
            answer: "No. To-do lists are where dreams go to die. TNT is a complete execution system combining OKRs, community accountability, and gamified discipline. It's an Operating System for your life."
        },
        {
            question: "How does the Tribe matching work?",
            answer: "We use a detailed profile algorithm to match you with peers in similar industries and revenue stages. You'll be placed in a 'Table' of 6-10 members for maximum relevance."
        },
        {
            question: "What happens if I miss my goals?",
            answer: "You won't be shamed, but your Grit Score will decay. We believe in transparency—if you're drifting, the data will show it, and your Tribe will help you course-correct."
        },
        {
            question: "Is there a free trial?",
            answer: "Yes, you can start as a Guest completely free to explore the system. No credit card required to get your first taste of organized execution."
        }
    ];

    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-black text-slate-900">Common Questions</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <FaqItem key={idx} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all hover:bg-slate-100">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-6 text-left font-bold text-slate-900 focus:outline-none"
            >
                {question}
                {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-slate-600 animate-slide-down">
                    {answer}
                </div>
            )}
        </div>
    );
}
