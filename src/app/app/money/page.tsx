import { PhaseOneStatus } from '@/components/PhaseOneStatus';

export default function MoneySkillsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Money Skills</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Build money confidence</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Practice practical money decisions and plan for your next step.</p>
      <div className="mt-7 grid gap-8 md:grid-cols-2">
        <PhaseOneStatus title="Salary planner">The salary planner implementation was not included in the uploaded source. It is not currently calculating take-home pay.</PhaseOneStatus>
        <PhaseOneStatus title="Savings goals">Goal tracking and lesson content are not connected in this Phase 1 build.</PhaseOneStatus>
      </div>
    </div>
  );
}
