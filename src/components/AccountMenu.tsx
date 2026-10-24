'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';

type AccountUser = { name: string; email: string };

export function AccountMenu({ compact = false, onUserChange }: { compact?: boolean; onUserChange?: (signedIn: boolean) => void }) {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    try {
      const supabase = getSupabase();
      supabase.auth.getUser().then(({ data, error: authError }) => {
        if (!active) return;
        if (authError) {
          setError(authError.message);
          onUserChange?.(false);
          return;
        }
        const account = data.user;
        onUserChange?.(Boolean(account));
        setUser(account ? {
          name: account.user_metadata?.name || account.email?.split('@')[0] || 'Learner',
          email: account.email || '',
        } : null);
      }).catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Account status could not be loaded.');
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        const account = session?.user;
        onUserChange?.(Boolean(account));
        setUser(account ? {
          name: account.user_metadata?.name || account.email?.split('@')[0] || 'Learner',
          email: account.email || '',
        } : null);
      });
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Account status could not be loaded.');
    }
    return () => { active = false; };
  }, [onUserChange]);

  async function signOut() {
    setSigningOut(true);
    setError('');
    try {
      const { error: authError } = await getSupabase().auth.signOut({ scope: 'local' });
      if (authError) throw authError;
      setUser(null);
      setOpen(false);
      router.replace('/');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'You could not be signed out.');
    } finally {
      setSigningOut(false);
    }
  }

  if (!user) {
    return compact ? (
      <div className="flex items-center gap-1.5">
        <Link href="/login" aria-label="Sign in" className="grid h-10 w-10 place-items-center rounded-full bg-white text-midnight ring-1 ring-[#e5e5e5] hover:bg-sunshine-light">
          <UserRound size={19} aria-hidden="true" />
        </Link>
        <Link href="/signup" className="btn-primary min-h-10 px-3 py-2 text-xs sm:px-4 sm:text-sm">
          <span className="sm:hidden">Join</span><span className="hidden sm:inline">Get started</span>
        </Link>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <Link href="/login" className="rounded-full px-3 py-2 text-midnight hover:bg-sunshine-light">Sign in</Link>
        <Link href="/signup" className="btn-primary min-h-10 px-4 py-2 text-xs sm:text-sm">Get started</Link>
      </div>
    );
  }

  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="relative">
      <button type="button" aria-label={`Open account menu for ${user.name}`} aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white p-1.5 text-midnight transition hover:border-sunshine-dark hover:bg-sunshine-light ${compact ? 'h-10 w-10 justify-center p-0' : ''}`}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sunshine text-xs font-bold text-midnight">{initials || <UserRound size={17} aria-hidden="true" />}</span>
        {!compact && <span className="hidden max-w-28 truncate pr-2 text-sm font-semibold sm:block">{user.name}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[70] mt-2 w-64 rounded-2xl border border-[#e5e5e5] bg-white p-3 text-midnight shadow-xl">
          <div className="border-b border-[#e5e5e5] px-2 pb-3">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-slate-600">{user.email}</p>
          </div>
          <Link href="/app" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-sunshine-light">
            <LayoutDashboard size={17} aria-hidden="true" /> Dashboard
          </Link>
          <Link href="/app/profile" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-sunshine-light">
            <UserRound size={17} aria-hidden="true" /> My profile
          </Link>
          <Link href="/app/settings" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-sunshine-light">
            <Settings size={17} aria-hidden="true" /> Settings
          </Link>
          <button type="button" onClick={() => void signOut()} disabled={signingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-midnight hover:bg-sunshine-light disabled:opacity-60">
            <LogOut size={17} aria-hidden="true" /> {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
          {error && <p role="alert" className="mt-2 px-2 text-xs text-red-700">{error}</p>}
        </div>
      )}
      {error && !open && <span className="sr-only" role="status">Account status: {error}</span>}
    </div>
  );
}
