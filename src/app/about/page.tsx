import { PublicShell } from '@/components/PublicShell';

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <p className="eyebrow">About CareerForge</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-midnight sm:text-4xl">Practical support for economic mobility.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">CareerForge is a South African youth economic-mobility prototype focused on work readiness, money confidence, and growth potential. It is intended to help people see practical next steps while keeping decisions in their hands.</p>
        <div className="mt-8 border-y border-slate-200 py-6">
          <h2 className="font-semibold text-midnight">Privacy by design</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The profile avoids ID numbers, bank details, and photos. Profile and notification data are stored in Supabase and protected with per-user row-level policies. Review your organization’s privacy notice and retention requirements before collecting real user data.</p>
        </div>
      </section>
    </PublicShell>
  );
}
