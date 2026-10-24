import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';

export default function PublicOpportunitiesPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="eyebrow">Opportunities</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-midnight sm:text-4xl">Find opportunities that fit what you can do today.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">CareerForge shares current opportunities with signed-in learners after their source and details have been checked. Every listing links back to its original advert.</p>
        <div className="mt-8 border-y border-slate-200 py-6">
          <p className="font-semibold text-midnight">Sign in to see your opportunity feed.</p>
          <p className="mt-2 text-sm text-slate-600">Listings are curated and re-checked before they are shown; we do not label sample adverts as real openings.</p>
        </div>
        <Link href="/signup" className="btn-primary mt-6">Sign up to see personal matches <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    </PublicShell>
  );
}
