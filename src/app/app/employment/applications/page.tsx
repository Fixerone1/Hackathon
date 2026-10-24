import { EmploymentNav } from '@/components/EmploymentNav';
import { OpportunityFeed } from '@/components/OpportunityFeed';

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">My opportunities</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Keep track of listings you saved and opportunities you marked as applied for.</p>
      <EmploymentNav />
      <OpportunityFeed mode="applications" />
    </div>
  );
}
