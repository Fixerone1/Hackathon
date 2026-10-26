import { getSupabase } from '@/lib/supabase';

export type LearnerDraft = {
  kind: 'cv' | 'cover_letter' | 'assessment' | 'pathway' | 'growth' | 'goal' | 'form';
  refId?: string;
  title: string;
  progress: number;
  data: Record<string, unknown>;
};

export async function saveLearnerDraft(draft: LearnerDraft): Promise<void> {
  const supabase = getSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign in again to save this draft.');
  const now = new Date();
  const expires = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const { error } = await supabase.from('drafts').upsert({
    user_id: authData.user.id,
    kind: draft.kind,
    ref_id: draft.refId || 'default',
    title: draft.title,
    progress: Math.max(0, Math.min(100, Math.round(draft.progress))),
    data: draft.data,
    updated_at: now.toISOString(),
    expires_at: expires.toISOString(),
  }, { onConflict: 'user_id,kind,ref_id' });
  if (error) throw error;
}
