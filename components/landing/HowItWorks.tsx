import { Compass, ClipboardList, Zap, Users } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <Compass size={28} className="text-emerald-400" />,
            title: "1. Build Your Strategy",
            description: "Put your vision. Know exactly where you are going before you start running."
        },
        {
            icon: <ClipboardList size={28} className="text-blue-400" />,
            title: "2. Build Your Plan",
            description: "Break it down into quarterly OKRs and weekly actions."
        },
        {
            icon: <Zap size={28} className="text-amber-400" />,
            title: "3. Execute & Win",
            description: "Track your progress, earn XP for consistency, and watch your business compound."
        },
        {
            icon: <Users size={28} className="text-purple-400" />,
            title: "4. Join A Tribe",
            description: "Get matched with a squad, accelerate, leverage your engagement and commitment."
        }
    ];

    return (
        <section className="bg-slate-950 py-32 text-white overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <span className="text-blue-500 font-bold tracking-wider text-sm uppercase mb-4 block">The Framework</span>
                    <h2 className="mb-6 text-4xl font-black md:text-5xl leading-tight">
                        The Blueprint For <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Domination</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Complexity relies on chaos. We rely on a simple, 4-step cycle to guarantee momentum.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <div key={index} className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>

                            <div className="relative z-10">
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    {step.icon}
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
