'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpportunityAdmin } from '@/components/OpportunityAdmin';
import { SiteContentAdmin } from '@/components/SiteContentAdmin';
import { getSupabase } from '@/lib/supabase';
import { PublicShell } from '@/components/PublicShell';

type AdminSection = 'opportunities' | 'site-content';

export default function AdminPage() {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [email, setEmail] = useState('');
  const [section, setSection] = useState<AdminSection>('opportunities');

  useEffect(() => {
    let active = true;
    getSupabase().auth.getUser()
      .then(({ data, error }) => {
        if (error || !data.user) {
          router.replace('/login?next=%2Fadmin');
          return;
        }
        if (data.user.app_metadata?.role !== 'admin') {
          if (active) setState('denied');
          return;
        }
        if (active) {
          setEmail(data.user.email || '');
          setState('allowed');
        }
      })
      .catch(() => { if (active) setState('denied'); });
    return () => { active = false; };
  }, [router]);

  return (
    <PublicShell variant="workspace">
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <section>
          <p className="eyebrow">Separate administration area</p>
          <h2 className="page-title mt-2">Admin console</h2>
          {state === 'checking' && <p className="mt-4 text-sm text-slate-600" role="status">Checking access...</p>}
          {state === 'denied' && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">Admin access is not enabled for this account.</p>}
          {state === 'allowed' && <>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Signed in as {email}</p>
              <p className="text-xs leading-5 text-slate-500">Admin access is managed through the server-controlled Supabase role.</p>
            </div>
            <div className="mt-6 border-b border-slate-300">
              <div className="-mb-px flex flex-wrap gap-2" role="tablist" aria-label="Admin content sections">
                {([
                  ['opportunities', 'Opportunities'],
                  ['site-content', 'Site content & events'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    id={`admin-tab-${value}`}
                    type="button"
                    role="tab"
                    aria-selected={section === value}
                    aria-controls={`admin-panel-${value}`}
                    className={`min-h-11 border-b-2 px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunshine-dark ${
                      section === value
                        ? 'border-b-black text-midnight'
                        : 'border-b-transparent text-slate-600 hover:border-b-slate-400 hover:text-midnight'
                    }`}
                    onClick={() => setSection(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div id={`admin-panel-${section}`} role="tabpanel" aria-labelledby={`admin-tab-${section}`}>
              {section === 'opportunities'
                ? <OpportunityAdmin />
                : <SiteContentAdmin />}
            </div>
          </>}
        </section>
      </main>
    </PublicShell>
  );
}
