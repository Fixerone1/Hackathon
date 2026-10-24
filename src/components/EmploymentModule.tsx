import { EmploymentNav } from '@/components/EmploymentNav';
import { PhaseOneStatus } from '@/components/PhaseOneStatus';

export function EmploymentModule({ title, description, statusTitle, statusText }: { title: string; description: string; statusTitle: string; statusText: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      <EmploymentNav />
      <PhaseOneStatus title={statusTitle}>{statusText}</PhaseOneStatus>
    </div>
  );
}
