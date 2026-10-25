'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { ImagePlus, LogOut, Settings, UserRound } from 'lucide-react';

type AccountUser = { id: string; name: string; email: string; avatarPath: string | null };

export function AccountMenu({ compact = false, onUserChange }: { compact?: boolean; onUserChange?: (signedIn: boolean, userId?: string) => void }) {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const updateAccount = useCallback(async (account: User | null) => {
    if (!account) {
      setUser(null);
      setAvatarUrl('');
      onUserChange?.(false);
      return;
    }
    const avatarPath = typeof account.user_metadata?.avatar_path === 'string' ? account.user_metadata.avatar_path : null;
    const providerAvatar = typeof account.user_metadata?.avatar_url === 'string' ? account.user_metadata.avatar_url : '';
    setUser({
      id: account.id,
      name: account.user_metadata?.name || account.user_metadata?.full_name || account.email?.split('@')[0] || 'Learner',
      email: account.email || '',
      avatarPath,
    });
    onUserChange?.(true, account.id);
    if (!avatarPath) {
      setAvatarUrl(providerAvatar.startsWith('https://') ? providerAvatar : '');
      return;
    }
    setAvatarUrl('');
  }, [onUserChange]);

  useEffect(() => {
    const avatarPath: string = user?.avatarPath || '';
    if (!avatarPath) return;
    let active = true;
    let refreshTimer: number | undefined;
    async function refreshAvatarUrl() {
      try {
        const { data, error: avatarError } = await getSupabase().storage.from('profile-avatars').createSignedUrl(avatarPath, 3600);
        if (avatarError) throw avatarError;
        if (!active) return;
        setAvatarUrl(data.signedUrl);
        refreshTimer = window.setTimeout(() => void refreshAvatarUrl(), 50 * 60 * 1000);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Profile photo could not be loaded.');
      }
    }
    void refreshAvatarUrl();
    return () => {
      active = false;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    };
  }, [user?.avatarPath]);

  useEffect(() => {
    let active = true;
    try {
      const supabase = getSupabase();
      supabase.auth.getUser().then(async ({ data, error: authError }) => {
        if (!active) return;
        if (authError) {
          setError(authError.message);
          onUserChange?.(false);
          return;
        }
        await updateAccount(data.user);
      }).catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Account status could not be loaded.');
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        window.setTimeout(() => {
          if (!active) return;
          void updateAccount(session?.user || null).catch((caught: unknown) => {
            if (active) setError(caught instanceof Error ? caught.message : 'Profile photo could not be loaded.');
          });
        }, 0);
      });
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Account status could not be loaded.');
    }
    return () => { active = false; };
  }, [onUserChange, updateAccount]);

  async function signOut() {
    setSigningOut(true);
    setError('');
    try {
      const { error: authError } = await getSupabase().auth.signOut({ scope: 'local' });
      if (authError) throw authError;
      setUser(null);
      setAvatarUrl('');
      setOpen(false);
      router.replace('/');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'You could not be signed out.');
    } finally {
      setSigningOut(false);
    }
  }

  async function uploadAvatar(file: File | undefined) {
    if (!file || !user) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.');
      return;
    }
    setUploadingAvatar(true);
    try {
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const supabase = getSupabase();
      const { error: uploadError } = await supabase.storage.from('profile-avatars').upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
      });
      if (uploadError) throw uploadError;
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { avatar_path: path } });
      if (updateError) {
        const { error: cleanupError } = await supabase.storage.from('profile-avatars').remove([path]);
        if (cleanupError) throw new Error(`${updateError.message} The uploaded image could not be cleaned up: ${cleanupError.message}`);
        throw updateError;
      }
      await updateAccount(data.user);
      if (user.avatarPath) {
        const { error: cleanupError } = await supabase.storage.from('profile-avatars').remove([user.avatarPath]);
        if (cleanupError) setError(`Your new photo was saved, but the previous photo could not be removed: ${cleanupError.message}`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Profile photo could not be uploaded.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (!user) {
    return compact ? (
      <div className="flex items-center gap-1.5">
        <Link href="/login" aria-label="Sign in or create an account" title="Sign in or create an account" className="grid h-10 w-10 place-items-center rounded-full bg-white text-midnight ring-1 ring-[#FFF8B8] hover:bg-sunshine-light">
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
        className={`flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 text-midnight transition hover:border-slate-300 hover:bg-sunshine-light ${compact ? 'h-10 w-10 justify-center p-0' : ''}`}>
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-sunshine text-xs font-bold text-midnight">
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : initials || <UserRound size={17} aria-hidden="true" />}
        </span>
        {!compact && <span className="hidden max-w-28 truncate pr-2 text-sm font-semibold sm:block">{user.name}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[70] mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-midnight shadow-xl">
          <div className="border-b border-slate-200 px-2 pb-3">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-slate-600">{user.email}</p>
          </div>
          <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-sunshine-light focus-within:ring-2 focus-within:ring-sunshine-dark">
            <ImagePlus size={17} aria-hidden="true" />
            {uploadingAvatar ? 'Uploading photo...' : 'Add or change photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingAvatar} onChange={(event) => {
              void uploadAvatar(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }} />
          </label>
          <Link href="/app/settings" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-sunshine-light">
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
