import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';

const pillars = [
  { number: '01', title: 'Get work-ready', text: 'Build practical skills and take clearer next steps toward work.' },
  { number: '02', title: 'Grow money confidence', text: 'Practice budgeting, planning, and making informed decisions.' },
  { number: '03', title: 'Explore your ideas', text: 'Turn an early business idea into a set of useful experiments.' },
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="border-b border-slate-200 bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-dark">Your next step starts here</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-midnight sm:text-5xl">
              Build your path to economic independence.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              CareerForge brings employment readiness, money confidence, and entrepreneurship tools into one practical workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="btn-primary">Explore the demo</Link>
              <Link href="/signup" className="btn-secondary">Create an account</Link>
            </div>
          </div>
          <aside className="border-l-4 border-emerald bg-white p-6 shadow-card" aria-label="CareerForge approach">
            <p className="text-sm font-semibold text-slate-500">A practical starting point</p>
            <p className="mt-3 text-2xl font-bold text-midnight">One plan. Three pillars.</p>
            <p className="mt-3 leading-7 text-slate-600">Make progress visible, understand what to work on next, and keep your goals moving.</p>
            <Link href="/app" className="link mt-5 inline-flex">View your workspace <span aria-hidden="true">-&gt;</span></Link>
          </aside>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" aria-labelledby="pillars-heading">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-dark">CareerForge workspace</p>
            <h2 id="pillars-heading" className="mt-1 text-2xl font-bold text-midnight">Progress across what matters</h2>
          </div>
          <Link href="/app" className="link">Open dashboard</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.number} className="border-t-2 border-slate-200 pt-4">
              <p className="text-sm font-bold text-emerald-dark">{pillar.number}</p>
              <h3 className="mt-2 text-lg font-semibold text-midnight">{pillar.title}</h3>
              <p className="mt-2 leading-6 text-slate-600">{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}