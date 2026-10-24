import Link from 'next/link';
import { ArrowRight, Check, CircleDollarSign, Compass, Target } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';

const pillars = [
  { icon: Target, title: 'Employment readiness', text: 'Build practical skills and turn career goals into clear next steps.' },
  { icon: CircleDollarSign, title: 'Money confidence', text: 'Practice everyday financial decisions with simple, guided tools.' },
  { icon: Compass, title: 'Growth potential', text: 'Explore ideas and identify useful experiments to move them forward.' },
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="border-b border-[#e7e5dc] bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-16">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">A workforce-readiness platform</p>
            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-midnight sm:text-5xl lg:text-[3.25rem]">
              Prepare emerging talent for what comes next.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              CareerForge gives young people a structured starting point for work readiness, financial capability, and exploring enterprise.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/signup" className="btn-primary w-full sm:w-fit">
                Explore the learner experience <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/#organizations" className="btn-secondary w-full sm:w-fit">For organizations</Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">Create a demo account to enter the learner workspace.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[540px] lg:justify-self-end" aria-label="Illustrative learner dashboard preview">
            <div className="absolute -inset-2 -z-10 rounded-2xl bg-sunshine sm:-inset-3" />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(36,39,36,0.12)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">LEARNER WORKSPACE</p>
                  <p className="mt-1 font-semibold text-midnight">My progress</p>
                </div>
                <span className="rounded-full bg-emerald-light px-2.5 py-1 text-xs font-semibold text-emerald-dark">Sample view</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-6 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-midnight">Your next steps</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">A clear starting point across three focus areas.</p>
                </div>
                <div className="grid h-[68px] w-[68px] place-items-center rounded-full border-[6px] border-sunshine text-lg font-semibold text-midnight">
                  2/3
                </div>
              </div>
              <div className="px-5 pb-5 sm:px-6">
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {[
                    'Add your skills and experience',
                    'Set a monthly savings goal',
                    'Choose one idea to explore',
                  ].map((task, index) => (
                    <div key={task} className="flex items-center gap-3 text-sm">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${index < 2 ? 'bg-midnight text-white' : 'border border-slate-300 text-transparent'}`}>
                        {index < 2 && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                      </span>
                      <span className={index < 2 ? 'text-slate-500' : 'font-medium text-midnight'}>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-right text-xs text-slate-500">Illustrative interface. Sample progress only.</p>
          </div>
        </div>
      </section>
      <section id="platform" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8" aria-labelledby="pillars-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">One learner journey</p>
          <h2 id="pillars-heading" className="mt-2 text-2xl font-semibold text-midnight sm:text-3xl">Support the whole transition to work</h2>
          <p className="mt-3 leading-7 text-slate-600">Bring practical guidance together in one simple experience, so learners can focus on the next achievable step.</p>
        </div>
        <div className="mt-8 grid gap-7 border-y border-slate-200 py-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {pillars.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunshine text-midnight">
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-midnight">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="organizations" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center md:py-12 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">For employers, funders, and training partners</p>
            <h2 className="mt-2 text-2xl font-semibold text-midnight">Start with a shared view of learner readiness.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Explore the learner experience and assess whether CareerForge fits your youth development goals. Partner reporting and organization accounts are not part of this demo.</p>
          </div>
          <Link href="/signup" className="btn-secondary w-fit">View the learner experience <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>
    </PublicShell>
  );
}