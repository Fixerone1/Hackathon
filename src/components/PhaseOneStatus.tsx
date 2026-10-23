import type { ReactNode } from 'react';

export function PhaseOneStatus({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-y border-slate-200 py-6">
      <h2 className="font-semibold text-midnight">{title}</h2>
      <div className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{children}</div>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
