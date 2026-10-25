import { PublicShell } from '@/components/PublicShell';
import { PageIntro } from '@/components/PageIntro';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="page-section">
        <PageIntro
          eyebrow="About Ukukhanya"
          title="Practical support for economic mobility."
          description="Ukukhanya means light in isiZulu. We are a South African youth economic-mobility platform focused on work readiness, money confidence, and growth potential, helping people see practical next steps while keeping decisions in their hands."
          className="max-w-4xl"
        />
        <div className="grid items-stretch gap-5 md:grid-cols-2 md:gap-8">
          <PhotoPlaceholder
            label="People, not just profiles"
            description="Add a genuine image of local learners, mentors, or first-time workers. Use images only with permission."
            className="min-h-64"
          />
          <section className="rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5 sm:p-7" aria-labelledby="privacy-design-heading">
            <span className="inline-flex rounded-full bg-sunshine px-3 py-1 text-xs font-bold uppercase tracking-wide text-midnight">Built around trust</span>
            <h2 id="privacy-design-heading" className="section-heading mt-5">Privacy by design</h2>
            <p className="section-description">The profile avoids ID numbers, bank details, and photos. Profile and notification data are stored in Supabase and protected with per-user row-level policies.</p>
            <p className="mt-4 text-sm leading-6 text-[#555555]">This is a prototype. Organizations should review their privacy notice and retention requirements before collecting real user data.</p>
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
