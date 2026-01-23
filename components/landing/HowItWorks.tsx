import { ArrowRight, ClipboardCheck, Users, Trophy } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <ClipboardCheck size={32} />,
            title: "Build Your Plan",
            description: "Set your yearly vision and break it down into quarterly OKRs and weekly actions."
        },
        {
            icon: <Users size={32} />,
            title: "Join A Tribe",
            description: "Get matched with a squad of peer entrepreneurs. Weekly check-ins keep you honest."
        },
        {
            icon: <Trophy size={32} />,
            title: "Execute & Win",
            description: "Track your progress, earn XP for consistency, and watch your business compound."
        }
    ];

    return (
        <section className="bg-slate-900 py-24 text-white">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-black md:text-5xl">
                        The Plan To <span className="text-blue-500">Victory</span>
                    </h2>
                    <p className="text-slate-400">Three simple steps to regain control and accelerate.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center">
                            {/* Connector Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-8 left-1/2 hidden h-0.5 w-full -translate-y-1/2 translate-x-1/2 bg-slate-700 md:block"></div>
                            )}

                            <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/50">
                                {step.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                            <p className="max-w-xs text-slate-400">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
