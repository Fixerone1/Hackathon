'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export function WorkspaceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'authenticated' | 'unavailable'>('checking');

  useEffect(() => {
    let active = true;
    fetch('/auth-api/me', { cache: 'no-store', credentials: 'same-origin' })
      .then((response) => {
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        if (!response.ok) {
          if (active) setState('unavailable');
          return;
        }
        if (active) setState('authenticated');
      })
      .catch(() => { if (active) setState('unavailable'); });
    return () => { active = false; };
  }, [router]);

  if (state === 'checking') {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600" role="status">Checking your session...</p>;
  }
  if (state === 'unavailable') {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600" role="alert">Authentication is unavailable. Check the Supabase configuration and try again.</p>;
  }
  return children;
}
