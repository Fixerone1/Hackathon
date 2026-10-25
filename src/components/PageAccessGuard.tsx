'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase, isMissingAuthSession } from '@/lib/supabase';

function requiresAuthentication(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function PageAccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const protectedRoute = requiresAuthentication(pathname);

  useEffect(() => {
    let active = true;
    if (!protectedRoute) {
      setAllowed(true);
      setChecking(false);
      setError('');
      return () => { active = false; };
    }

    async function checkAccess() {
      try {
        const { data, error: authError } = await getSupabase().auth.getUser();
        if (authError && !isMissingAuthSession(authError)) throw authError;
        if (!active) return;
        if (!data.user) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Your session could not be checked.');
      } finally {
        if (active) setChecking(false);
      }
    }

    setChecking(true);
    setAllowed(false);
    void checkAccess();
    return () => { active = false; };
  }, [pathname, protectedRoute, router]);

  if (!protectedRoute) return children;
  if (checking) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-midnight" role="status">Checking your session...</p>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-midnight" role="alert">
        <h1 className="text-xl font-bold">We could not check your sign-in</h1>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }
  return allowed ? children : null;
}
