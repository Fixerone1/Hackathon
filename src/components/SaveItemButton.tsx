'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Check, Undo2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export type SavedItemType = 'opportunity' | 'lesson' | 'idea' | 'funding' | 'interview_question' | 'tool';

type SaveItemButtonProps = {
  itemType: SavedItemType;
  itemId: string;
  title: string;
  link: string;
  initialSaved?: boolean;
  compact?: boolean;
};

export function SaveItemButton({
  itemType,
  itemId,
  title,
  link,
  initialSaved,
  compact = false,
}: SaveItemButtonProps) {
  const [saved, setSaved] = useState(initialSaved === true);
  const [loaded, setLoaded] = useState(initialSaved !== undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialSaved !== undefined) return;
    let active = true;
    async function checkSaved() {
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authData.user) throw new Error('Sign in to save items to My Space.');
        const { data, error: queryError } = await supabase
          .from('saved_items')
          .select('id')
          .eq('user_id', authData.user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId)
          .maybeSingle();
        if (queryError) throw queryError;
        if (active) setSaved(Boolean(data));
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Saved status could not be checked.');
      } finally {
        if (active) setLoaded(true);
      }
    }
    void checkSaved();
    return () => { active = false; };
  }, [initialSaved, itemId, itemType]);

  async function toggle() {
    if (busy || !loaded) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in to save items to My Space.');
      if (saved) {
        const { error: deleteError } = await supabase.from('saved_items')
          .delete()
          .eq('user_id', authData.user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);
        if (deleteError) throw deleteError;
        setSaved(false);
        setMessage('Removed from My Space.');
      } else {
        const { error: saveError } = await supabase.from('saved_items').upsert({
          user_id: authData.user.id,
          item_type: itemType,
          item_id: itemId,
          title,
          link,
        }, { onConflict: 'user_id,item_type,item_id' });
        if (saveError) throw saveError;
        setSaved(true);
        setMessage('Saved. Find it in My Space.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The item could not be updated.');
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    if (!saved || busy) return;
    setMessage('');
    await toggle();
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={!loaded || busy}
        aria-pressed={saved}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition disabled:opacity-60 ${saved ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-midnight hover:bg-slate-50'} ${compact ? 'w-11 px-0' : ''}`}
        aria-label={saved ? `Remove ${title} from My Space` : `Save ${title} for later`}
      >
        {saved ? <Check size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}
        {!compact && <span>{busy ? 'Updating…' : saved ? 'Saved' : 'Save for later'}</span>}
      </button>
      {message && (
        <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-emerald-900" role="status">
          {message}
          {saved && <button type="button" onClick={() => void undo()} className="inline-flex min-h-8 items-center gap-1 font-semibold underline underline-offset-2"><Undo2 size={13} aria-hidden="true" />Undo</button>}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-700" role="alert">{error}</p>}
    </div>
  );
}
