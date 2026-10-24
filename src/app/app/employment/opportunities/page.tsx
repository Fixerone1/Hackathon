import { EmploymentNav } from '@/components/EmploymentNav';
import { OpportunityFeed } from '@/components/OpportunityFeed';

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Opportunity matches</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Review verified opportunities, see how stated requirements compare with your profile, and apply on the original source site.</p>
      <EmploymentNav />
      <OpportunityFeed />
    </div>
  );
}
