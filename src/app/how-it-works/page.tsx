import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';

const steps = [
  { number: '01', title: 'Tell us what you have', text: 'Build a profile from your qualification, subjects, skills, location, and goals. You can add detail over time.' },
  { number: '02', title: 'Check what is open to you', text: 'When verified opportunity sources are connected, requirements can be compared with your profile and gaps explained.' },
  { number: '03', title: 'Choose your next step', text: 'Review the original advert and decide for yourself. CareerForge does not apply or contact employers on your behalf.' },
];

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-midnight sm:text-4xl">A clearer route from your current skills to your next opportunity.</h1>
        <div className="mt-9 grid gap-8 border-y border-slate-200 py-7 md:grid-cols-3 md:gap-10">
          {steps.map((step) => <article key={step.number}>
            <p className="text-xs font-semibold text-emerald-dark">{step.number}</p>
            <h2 className="mt-2 font-semibold text-midnight">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
          </article>)}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600">Current preview limitation: approved listing sources and match calculations are not connected. No live matches are shown yet.</p>
        <Link href="/signup" className="btn-primary mt-6">Create a learner profile</Link>
      </section>
    </PublicShell>
  );
}
