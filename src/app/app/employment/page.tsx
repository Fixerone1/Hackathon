import { EmploymentNav } from '@/components/EmploymentNav';
import { PhaseOneStatus } from '@/components/PhaseOneStatus';

export default function EmploymentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Build your work readiness</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Keep your profile current, understand opportunity requirements, and prepare your next application.</p>
      <EmploymentNav />
      <PhaseOneStatus title="Your work-readiness starting point">
        Your learner profile is the first available tool. Add your qualification, subjects, location, and goals to prepare for more useful pathways as verified data sources are connected.
      </PhaseOneStatus>
      <PhaseOneStatus title="Opportunity matches">
        No verified opportunity sources are connected yet. CareerForge will not display invented listings or claim a match without a source advert and confirmed requirements.
      </PhaseOneStatus>
    </div>
  );
}
