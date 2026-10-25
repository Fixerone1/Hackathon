'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpportunityAdmin } from '@/components/OpportunityAdmin';
import { getSupabase } from '@/lib/supabase';
import { PublicShell } from '@/components/PublicShell';

export default function AdminPage() {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [email, setEmail] = useState('');

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
        <section className="max-w-4xl">
          <p className="eyebrow">Separate administration area</p>
          <h2 className="page-title mt-2">Admin console</h2>
          {state === 'checking' && <p className="mt-4 text-sm text-slate-600" role="status">Checking access...</p>}
          {state === 'denied' && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">Admin access is not enabled for this account.</p>}
          {state === 'allowed' && <>
            <p className="mt-3 text-sm text-slate-600">Signed in as {email}</p>
            <OpportunityAdmin />
            <p className="mt-5 text-xs leading-5 text-slate-500">Admin access is granted through the server-managed Supabase app_metadata role.</p>
          </>}
        </section>
      </main>
    </PublicShell>
  );
}
