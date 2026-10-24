import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';
import { PageIntro } from '@/components/PageIntro';

export default function PublicOpportunitiesPage() {
  return (
    <PublicShell>
      <section className="page-section">
        <PageIntro
          eyebrow="Opportunities"
          title="Find opportunities that fit what you can do today."
          description="CareerForge shares current opportunities with signed-in learners after their source and details have been checked. Every listing links back to its original advert."
          className="max-w-4xl"
        />
        <div className="rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5 sm:p-7">
          <p className="text-lg font-bold text-midnight">Sign in to see your opportunity feed.</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555555]">Listings are curated and re-checked before they are shown; we do not label sample adverts as real openings.</p>
          <Link href="/signup" className="btn-primary mt-5">Sign up to see personal matches <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </PublicShell>
  );
}
