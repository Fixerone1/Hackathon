import type { ReactNode } from 'react';

export function PhaseOneStatus({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="bg-sunshine px-5 py-3 sm:px-6">
        <h2 className="text-lg font-bold leading-snug text-black">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">
        <div className="max-w-2xl text-sm leading-6 text-slate-700">{children}</div>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </section>
  );
}
