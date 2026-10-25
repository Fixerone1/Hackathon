'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase';

type ForgeProfile = {
  display_name?: string;
  highest_qualification?: string;
  qualification_status?: string;
  qualification_year?: number;
  field_of_study?: string;
  subjects?: unknown[];
  skills?: unknown[];
  skill_ratings?: unknown[];
  experience_months?: number;
  experience_by_area?: unknown[];
  province?: string;
  city?: string;
  target_role?: string;
  personal_goal?: string;
  interests?: string[];
  languages?: unknown[];
  availability_start_date?: string;
  shift_preferences?: string[];
  certifications?: string[];
};

type ForgePreferences = {
  forge_name: string;
  tone: 'chill' | 'straight_up' | 'coach';
  language: 'en-ZA';
  data_light: boolean;
  personalisation_paused: boolean;
  streak_enabled: boolean;
};

type ForgeAction = {
  opportunity_id: string;
  status: 'saved' | 'applied';
  scheduled_apply_date: string | null;
  updated_at: string;
  opportunities: { title: string; organization: string; closing_date: string | null };
};

type ForgeFact = { label: string; value: string; source: string };
type ForgeContextValue = {
  loading: boolean;
  error: string;
  userId: string;
  firstName: string;
  profile: ForgeProfile;
  preferences: ForgePreferences;
  checklist: string[];
  actions: ForgeAction[];
  stage: 'Getting started' | 'Building skills' | 'Job ready';
  nextAction: { label: string; reason: string; href: string } | null;
  recentWin: string;
  facts: ForgeFact[];
  refresh: () => void;
};

const preferenceDefaults: ForgePreferences = {
  forge_name: 'Forge',
  tone: 'straight_up',
  language: 'en-ZA',
  data_light: false,
  personalisation_paused: false,
  streak_enabled: false,
};

const ForgeContext = createContext<ForgeContextValue | null>(null);

function toList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return [item.trim()].filter(Boolean);
    if (item && typeof item === 'object') {
      if ('name' in item && typeof item.name === 'string') return [item.name.trim()].filter(Boolean);
      if ('area' in item && typeof item.area === 'string') return [item.area.trim()].filter(Boolean);
    }
    return [];
  });
}

export function ForgeProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ForgeProfile>({});
  const [preferences, setPreferences] = useState(preferenceDefaults);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [actions, setActions] = useState<ForgeAction[]>([]);
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadContext() {
      setLoading(true);
      setError('');
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again to refresh your Forge context.');
        const [profileResult, progressResult, preferencesResult, actionsResult] = await Promise.all([
          supabase.from('learner_profiles').select('*').maybeSingle(),
          supabase.from('learner_progress').select('checklist').maybeSingle(),
          supabase.from('learner_preferences').select('*').maybeSingle(),
          supabase.from('learner_opportunity_actions').select('opportunity_id,status,scheduled_apply_date,updated_at,opportunities!inner(title,organization,closing_date)'),
        ]);
        const firstError = profileResult.error || progressResult.error || preferencesResult.error || actionsResult.error;
        if (firstError) throw firstError;
        if (!active) return;
        const loadedProfile = (profileResult.data || {}) as ForgeProfile;
        const loadedActions = (actionsResult.data || []) as unknown as ForgeAction[];
        const accountName = authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Learner';
        const displayName = loadedProfile.display_name?.trim() || accountName;
        setUserId(authData.user.id);
        setFirstName(displayName.split(/\s+/)[0] || 'Learner');
        setProfile(loadedProfile);
        setChecklist(Array.isArray(progressResult.data?.checklist) ? progressResult.data.checklist.filter((item): item is string => typeof item === 'string') : []);
        setPreferences({ ...preferenceDefaults, ...(preferencesResult.data || {}) });
        setActions(loadedActions);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Forge context could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadContext();
    return () => { active = false; };
  }, [refreshKey]);

  const value = useMemo<ForgeContextValue>(() => {
    const hasQualification = Boolean(profile.highest_qualification);
    const hasSkills = Boolean(profile.skills?.length || profile.skill_ratings?.length);
    const hasTarget = Boolean(profile.target_role);
    const stage: ForgeContextValue['stage'] = !hasQualification || !hasTarget
      ? 'Getting started'
      : hasSkills ? 'Job ready' : 'Building skills';
    const today = new Date().toISOString().slice(0, 10);
    const urgentAction = actions
      .filter((action) => action.status === 'saved' && action.opportunities.closing_date && action.opportunities.closing_date >= today)
      .sort((left, right) => (left.opportunities.closing_date || '').localeCompare(right.opportunities.closing_date || ''))[0];
    const nextAction = urgentAction
      ? { label: `Review ${urgentAction.opportunities.title}`, reason: `You saved this listing and its closing date is ${urgentAction.opportunities.closing_date}.`, href: '/app/employment/applications' }
      : !hasQualification
        ? { label: 'Add your highest qualification', reason: 'Your profile needs a qualification before it can compare stated requirements.', href: '/app/profile' }
        : !hasTarget
          ? { label: 'Choose a role or field', reason: 'Your target role helps sort opportunities toward the work you want.', href: '/app/profile' }
          : !hasSkills
            ? { label: 'Add one or two skills', reason: 'Skills help explain how a listing connects to your experience.', href: '/app/profile' }
            : checklist.includes('profile')
              ? null
              : { label: 'Review your saved opportunities', reason: 'Your saved list is the best place to pick up where you left off.', href: '/app/employment/applications' };
    const win = actions.find((action) => action.status === 'applied');
    const facts: ForgeFact[] = [];
    const addFact = (label: string, raw: unknown, source = 'Your learner profile') => {
      const rendered = Array.isArray(raw) ? toList(raw).join(', ') : typeof raw === 'string' ? raw.trim() : '';
      if (rendered) facts.push({ label, value: rendered, source });
    };
    addFact('Name', profile.display_name);
    addFact('Qualification', profile.highest_qualification);
    addFact('Field of study', profile.field_of_study);
    addFact('Subjects', profile.subjects);
    addFact('Skills', profile.skill_ratings?.length ? profile.skill_ratings : profile.skills);
    addFact('Experience', profile.experience_by_area);
    addFact('Location', [profile.city, profile.province].filter(Boolean).join(', '));
    addFact('Goal', profile.personal_goal);
    addFact('Availability', profile.availability_start_date);
    addFact('Interests', profile.interests);
    actions.forEach((action) => facts.push({
      label: action.status === 'applied' ? 'Marked applied' : 'Saved opportunity',
      value: `${action.opportunities.title} · ${action.opportunities.organization}`,
      source: 'Action you took in Ukukhanya',
    }));
    return {
      loading,
      error,
      userId,
      firstName,
      profile,
      preferences,
      checklist,
      actions,
      stage,
      nextAction: preferences.personalisation_paused ? null : nextAction,
      recentWin: win ? `You marked ${win.opportunities.title} as applied.` : '',
      facts,
      refresh: () => setRefreshKey((current) => current + 1),
    };
  }, [actions, checklist, error, firstName, loading, preferences, profile, userId]);

  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge(): ForgeContextValue {
  const context = useContext(ForgeContext);
  if (!context) throw new Error('useForge must be used within ForgeProvider.');
  return context;
}
