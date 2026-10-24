'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let active = true;
    getSupabase().auth.getUser()
      .then(({ data, error }) => {
        if (error || !data.user) {
          router.replace('/login');
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
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 md:py-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <Link href="/" className="font-semibold text-midnight">CareerForge <span className="font-normal text-slate-500">/ Admin</span></Link>
        <Link href="/app" className="text-sm font-medium text-emerald-dark hover:underline">Learner workspace</Link>
      </header>
      <section className="max-w-2xl py-10">
        <p className="eyebrow">Separate administration area</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Admin console</h1>
        {state === 'checking' && <p className="mt-4 text-sm text-slate-600" role="status">Checking access...</p>}
        {state === 'denied' && <p className="mt-4 text-sm text-red-700" role="alert">Admin access is not enabled for this account.</p>}
        {state === 'allowed' && <>
          <p className="mt-3 text-sm text-slate-600">Signed in as {email}</p>
          <div className="mt-7 border-y border-slate-200 py-5">
            <h2 className="font-semibold text-midnight">Review queue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Opportunity-source management and scam review are not connected yet. No listings are being ingested or promoted by this preview.</p>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Admin access is granted through the server-managed Supabase app_metadata role.</p>
        </>}
      </section>
    </main>
  );
}
