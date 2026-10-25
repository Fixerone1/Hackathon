'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase, isMissingAuthSession } from '@/lib/supabase';

export function WorkspaceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '/app';
  const [state, setState] = useState<'checking' | 'authenticated' | 'unavailable'>('checking');

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    try {
      const supabase = getSupabase();
      supabase.auth.getUser().then(({ data, error }) => {
        if (!active) return;
        if (error && !isMissingAuthSession(error)) {
          setState('unavailable');
          return;
        }
        if (!data.user) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setState('authenticated');
      }).catch(() => { if (active) setState('unavailable'); });
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });
      unsubscribe = () => authListener.subscription.unsubscribe();
    } catch {
      setState('unavailable');
    }
    return () => { active = false; unsubscribe(); };
  }, [pathname, router]);

  if (state === 'checking') {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 sm:px-6 lg:px-8" role="status">Checking your session...</p>;
  }
  if (state === 'unavailable') {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 sm:px-6 lg:px-8" role="alert">Authentication is unavailable. Check the Supabase configuration and try again.</p>;
  }
  return children;
}
