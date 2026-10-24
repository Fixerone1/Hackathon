import Link from 'next/link';
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
        Keep your qualification, skills, location, and goals up to date. They help the opportunity feed explain how each published listing compares with your profile.
      </PhaseOneStatus>
      <p className="mt-6 text-sm leading-6 text-slate-600">Browse current verified opportunities, save promising listings, and track the ones you apply for.</p>
      <Link href="/app/employment/opportunities" className="btn-primary mt-4">Browse opportunities</Link>
    </div>
  );
}
