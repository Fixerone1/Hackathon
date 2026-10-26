'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

type Fact = {
  key: string;
  label: string;
  value: string;
  source: string;
  table: 'learner_profiles' | 'learner_opportunity_actions';
  column: string;
  resetValue: unknown;
  opportunityId?: string;
};

type SavedAction = {
  opportunity_id: string;
  status: 'saved' | 'applied';
  opportunities: { title: string; organization: string };
};

function listValue(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value.flatMap((item) => {
    if (typeof item === 'string') return [item];
    if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') return [item.name];
    if (item && typeof item === 'object' && 'area' in item && typeof item.area === 'string') return [item.area];
    return [];
  }).join(', ');
}

export default function ForgeMemoryPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function loadFacts() {
      try {
        const supabase = getSupabase();
        const [{ data: authData, error: authError }, profileResult, actionResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('learner_profiles').select('display_name,highest_qualification,qualification_status,field_of_study,subjects,skills,skill_ratings,experience_months,experience_by_area,province,target_role,personal_goal,interests,languages,availability_start_date,shift_preferences,certifications').maybeSingle(),
          supabase.from('learner_opportunity_actions').select('opportunity_id,status,opportunities!inner(title,organization)'),
        ]);
        if (authError || !authData.user) throw new Error('Sign in again to view your personalisation data.');
        if (profileResult.error) throw profileResult.error;
        if (actionResult.error) throw actionResult.error;
        const profile = (profileResult.data || {}) as Record<string, unknown>;
        const skillFacts = Array.isArray(profile.skill_ratings) && profile.skill_ratings.length ? profile.skill_ratings : profile.skills;
        const nextFacts: Fact[] = [];
        const addText = (key: string, label: string, column: string, value: unknown, resetValue: unknown = '') => {
          if (typeof value === 'string' && value.trim()) nextFacts.push({ key, label, value: value.trim(), source: 'Your learner profile', table: 'learner_profiles', column, resetValue });
        };
        addText('display_name', 'Name you chose', 'display_name', profile.display_name);
        addText('qualification', 'Qualification', 'highest_qualification', profile.highest_qualification);
        addText('field', 'Field of study', 'field_of_study', profile.field_of_study);
        addText('target', 'Role or field goal', 'target_role', profile.target_role);
        addText('location', 'Province', 'province', profile.province);
        addText('goal', 'Personal goal', 'personal_goal', profile.personal_goal);
        addText('qualification_status', 'Qualification status', 'qualification_status', profile.qualification_status);
        addText('interests', 'Interests', 'interests', listValue(profile.interests), []);
        addText('skills', 'Skills', 'skill_ratings', listValue(skillFacts), []);
        addText('subjects', 'Subjects', 'subjects', listValue(profile.subjects), []);
        addText('experience', 'Experience areas', 'experience_by_area', listValue(profile.experience_by_area), []);
        addText('languages', 'Languages', 'languages', listValue(profile.languages), []);
        addText('certifications', 'Certificates and training', 'certifications', listValue(profile.certifications), []);
        addText('availability', 'Available from', 'availability_start_date', profile.availability_start_date);
        addText('shifts', 'Preferred shifts', 'shift_preferences', listValue(profile.shift_preferences), []);
        ((actionResult.data || []) as unknown as SavedAction[]).forEach((action) => {
          nextFacts.push({
            key: `action-${action.opportunity_id}`,
            label: action.status === 'applied' ? 'Marked applied' : 'Saved opportunity',
            value: `${action.opportunities.title} · ${action.opportunities.organization}`,
            source: 'An action you took in Opportunities',
            table: 'learner_opportunity_actions',
            column: 'status',
            resetValue: null,
            opportunityId: action.opportunity_id,
          });
        });
        if (active) setFacts(nextFacts);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Your personalisation data could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadFacts();
    return () => { active = false; };
  }, []);

  async function removeFact(fact: Fact) {
    setBusyKey(fact.key);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to remove this fact.');
      const query = fact.table === 'learner_opportunity_actions'
        ? supabase.from('learner_opportunity_actions').delete().eq('user_id', authData.user.id).eq('opportunity_id', fact.opportunityId || '')
        : supabase.from('learner_profiles').update({ [fact.column]: fact.resetValue }).eq('user_id', authData.user.id);
      const { error: saveError } = await query;
      if (saveError) throw saveError;
      setFacts((current) => current.filter((item) => item.key !== fact.key));
      setMessage('Removed. Beacon Guide will no longer use this fact after the next context refresh.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'This fact could not be removed.');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <Link href="/app/settings" className="link text-sm">Settings</Link>
      <header className="mt-3 rounded-2xl border border-slate-200 bg-sunshine p-5 sm:p-6">
        <p className="eyebrow text-black">Your data, your call</p>
        <h1 className="page-title mt-2 text-black">What Beacon Guide knows about me</h1>
        <p className="page-description text-black/75">Only details you added or actions you took in Beacon appear here. Nothing inferred is used.</p>
      </header>
      {loading && <p className="py-6 text-sm text-slate-600" role="status">Loading your facts...</p>}
      {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}
      {message && <p className="mt-5 text-sm text-emerald-dark" role="status">{message}</p>}
      {!loading && !error && facts.length === 0 && <p className="py-7 text-sm leading-6 text-slate-600">No profile facts or saved opportunity actions are available for personalisation yet.</p>}
      {!loading && facts.length > 0 && (
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {facts.map((fact) => (
            <li key={fact.key} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{fact.label} · {fact.source}</p>
                <p className="mt-1 break-words text-sm font-medium text-midnight">{fact.value}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {fact.table === 'learner_profiles' && <Link href="/app/profile" className="link text-sm">Edit</Link>}
                <button type="button" className="btn-secondary min-h-9 px-3 text-xs" disabled={busyKey === fact.key} onClick={() => void removeFact(fact)}>{busyKey === fact.key ? 'Removing...' : 'Remove'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs leading-5 text-slate-500">Remove clears the corresponding profile field or saved opportunity action. Pause personalisation any time in <Link href="/app/settings" className="link">Settings</Link>.</p>
    </div>
  );
}