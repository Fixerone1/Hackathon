import { PhaseOneStatus } from '@/components/PhaseOneStatus';

export default function GrowthStudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <p className="eyebrow">Growth Studio</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Explore your ideas</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Develop a practical next step for a side project or business idea.</p>
      <div className="mt-7 grid gap-8 md:grid-cols-2">
        <PhaseOneStatus title="Idea validation">The original idea-validator implementation was not included in the uploaded source.</PhaseOneStatus>
        <PhaseOneStatus title="Funding and support">No verified small-business funding or support listings are connected. No funding matches are shown.</PhaseOneStatus>
      </div>
    </div>
  );
}
