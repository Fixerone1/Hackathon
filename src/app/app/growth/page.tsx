import { PhaseOneStatus } from '@/components/PhaseOneStatus';
import { PageIntro } from '@/components/PageIntro';

export default function GrowthStudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro eyebrow="Growth Studio" title="Explore your ideas" description="Develop a practical next step for a side project or business idea." />
      <div className="grid gap-5 md:grid-cols-2">
        <PhaseOneStatus title="Idea validation">The original idea-validator implementation was not included in the uploaded source.</PhaseOneStatus>
        <PhaseOneStatus title="Funding and support">No verified small-business funding or support listings are connected. No funding matches are shown.</PhaseOneStatus>
      </div>
    </div>
  );
}
