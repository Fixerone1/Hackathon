import { EmploymentNav } from '@/components/EmploymentNav';
import { OpportunityFeed } from '@/components/OpportunityFeed';

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="page-title mt-1">Opportunity matches</h1>
      <p className="page-description">Review verified opportunities, see how stated requirements compare with your profile, and apply on the original source site.</p>
      <p className="mb-5 mt-3 text-sm text-slate-500">Start with the closing date and fit signals. Open a listing to see application preparation options.</p>
      <EmploymentNav />
      <OpportunityFeed />
    </div>
  );
}
