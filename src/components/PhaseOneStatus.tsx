import type { ReactNode } from 'react';

export function PhaseOneStatus({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-sunshine-light p-5 sm:p-6">
      <span className="mb-4 block h-1 w-10 rounded-full bg-sunshine" aria-hidden="true" />
      <h2 className="text-lg font-bold leading-snug text-midnight">{title}</h2>
      <div className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{children}</div>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
