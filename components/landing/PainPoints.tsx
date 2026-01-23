import { XCircle, AlertTriangle, TrendingDown } from 'lucide-react';

export default function PainPoints() {
    return (
        <section className="bg-slate-50 py-24">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                        Identify The <span className="text-red-600">Enemy</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-slate-600">
                        Most entrepreneurs don't fail because of a lack of talent. They fail because they are fighting a war on three fronts without a strategy.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="group rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:shadow-2xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <XCircle size={32} />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-slate-900">Isolation</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Building a business is lonely. Without a tribe, your doubts amplify, and your momentum dies in the vacuum of solitude.
                        </p>
                    </div>

                    <div className="group rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:shadow-2xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-slate-900">Drift</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Without clear targets and accountability, days turn into weeks of "busy work" that moves the needle nowhere. You're drifting, not driving.
                        </p>
                    </div>

                    <div className="group rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:shadow-2xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                            <TrendingDown size={32} />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-slate-900">Burnout</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Pushing without pause or purpose leads to the crash. You sacrifice your health and relationships for a goal that keeps moving further away.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
