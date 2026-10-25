import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';
import { PageIntro } from '@/components/PageIntro';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

const steps = [
  { number: '01', title: 'Tell us what you have', text: 'Build a profile from your qualification, subjects, skills, location, and goals. You can add detail over time.' },
  { number: '02', title: 'Check what is open to you', text: 'When verified opportunity sources are connected, requirements can be compared with your profile and gaps explained.' },
  { number: '03', title: 'Choose your next step', text: 'Review the original advert and decide for yourself. Ukukhanya does not apply or contact employers on your behalf.' },
];

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <section className="page-section">
        <PageIntro
          eyebrow="How it works"
          title="A clearer route from your current skills to your next opportunity."
          description="Move at your own pace. Each step helps you understand your options and decide what feels right for you."
          className="max-w-4xl"
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => <li key={step.number}>
            <article className="h-full rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-sunshine text-sm font-bold text-midnight">{step.number}</span>
              <h2 className="mt-5 text-lg font-bold leading-snug text-midnight">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#555555]">{step.text}</p>
            </article>
          </li>)}
        </ol>
        <div className="mt-8 grid items-center gap-6 rounded-2xl border border-[#e5e5e5] bg-white p-4 sm:p-6 md:grid-cols-[0.85fr_1fr] md:gap-8">
          <PhotoPlaceholder
            label="Your next step, supported"
            description="Add a candid photo of a learner preparing, getting guidance, or exploring work."
            className="min-h-48"
          />
          <div className="px-1 py-2 sm:px-3">
            <p className="eyebrow">You stay in control</p>
            <h2 className="section-heading mt-2">Guidance that helps you decide, not decide for you.</h2>
            <p className="section-description">Check the original advert, compare its requirements with your profile, and choose how to apply. Ukukhanya does not submit applications for you.</p>
            <p className="mt-5 rounded-xl border-l-4 border-sunshine bg-[#f7f7f7] px-4 py-3 text-sm leading-6 text-[#444444]">Current preview: opportunities are curated by administrators. Availability and match guidance depend on verified listing details.</p>
            <Link href="/signup" className="btn-primary mt-5">Create a learner profile</Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
