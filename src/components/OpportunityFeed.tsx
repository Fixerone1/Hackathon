'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  categoryLabel,
  matchOpportunity,
  opportunityCategories,
  type LearnerOpportunityAction,
  type Opportunity,
  type OpportunityProfile,
} from '@/lib/opportunities';

type OpportunityFeedProps = { mode?: 'matches' | 'applications' };
type ActionRow = { opportunity_id: string; status: LearnerOpportunityAction };

function formatDate(value: string | null): string {
  if (!value) return 'No closing date listed';
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

function opportunityLoadErrorMessage(error: unknown): string {
  if (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === 'PGRST205'
    && 'message' in error
    && typeof error.message === 'string'
    && error.message.includes('public.opportunities')
  ) {
    return "Supabase cannot find public.opportunities. Apply the Supabase migrations in order, including 20261024000000_verified_opportunities.sql, then reload the API schema cache. Details: " + error.message;
  }
  return errorMessage(error, 'Opportunities could not be loaded.');
}

function profileList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return [item.trim()].filter(Boolean);
    if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
      return [item.name.trim()].filter(Boolean);
    }
    return [];
  });
}

function applicationProfileSummary(opportunity: Opportunity, profile: OpportunityProfile): string {
  const details = [
    ['Target role', profile.target_role],
    ['Highest qualification', profile.highest_qualification],
    ['Field of study', profile.field_of_study],
    ['Subjects', profileList(profile.subjects).join(', ')],
    ['Skills', [...new Set([...profileList(profile.skills), ...profileList(profile.skill_ratings)])].join(', ')],
    ['Experience', typeof profile.experience_months === 'number' ? `${profile.experience_months} months` : ''],
    ['Province', profile.province],
  ].filter((item): item is [string, string] => typeof item[1] === 'string' && item[1].trim().length > 0);

  return [
    `Application notes for ${opportunity.title} at ${opportunity.organization}`,
    ...details.map(([label, value]) => `${label}: ${value}`),
  ].join('\n');
}

export function OpportunityFeed({ mode = 'matches' }: OpportunityFeedProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<OpportunityProfile>({});
  const [actions, setActions] = useState<Record<string, LearnerOpportunityAction>>({});
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [copiedOpportunityId, setCopiedOpportunityId] = useState('');
  const [aiBusyId, setAiBusyId] = useState('');
  const [aiPlans, setAiPlans] = useState<Record<string, string>>({});
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  const [copiedPlanId, setCopiedPlanId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadFeed() {
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again to view your opportunity feed.');
        const opportunityResult = await supabase.from('opportunities').select('*');
        if (opportunityResult.error) throw opportunityResult.error;
        if (!active) return;
        setOpportunities(opportunityResult.data || []);

        const [profileResult, actionResult] = await Promise.all([
          supabase.from('learner_profiles').select('target_role,highest_qualification,field_of_study,subjects,skills,skill_ratings,experience_months,province,nqf_level').maybeSingle(),
          supabase.from('learner_opportunity_actions').select('opportunity_id,status'),
        ]);
        if (!active) return;
        const supportingErrors: string[] = [];
        if (profileResult.error) {
          supportingErrors.push(`Profile matching unavailable: ${errorMessage(profileResult.error, 'profile query failed')}`);
          console.error('Could not load learner profile for opportunity matching:', profileResult.error);
        } else {
          setProfile((profileResult.data || {}) as OpportunityProfile);
        }
        if (actionResult.error) {
          supportingErrors.push(`Saving status unavailable: ${errorMessage(actionResult.error, 'saved listings query failed')}`);
          console.error('Could not load saved opportunity actions:', actionResult.error);
        } else {
          setActions(Object.fromEntries(((actionResult.data || []) as ActionRow[]).map((action) => [action.opportunity_id, action.status])));
        }
        if (supportingErrors.length) {
          setError(`Listings loaded, but ${supportingErrors.join('; ')}.`);
        }
      } catch (caught) {
        if (active) {
          console.error('Failed to load opportunity feed:', caught);
          setError(opportunityLoadErrorMessage(caught));
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadFeed();
    return () => { active = false; };
  }, []);

  const matches = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const verificationCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return opportunities
      .filter((opportunity) => mode === 'applications' || opportunity.status === 'published')
      .filter((opportunity) => mode === 'applications' || !opportunity.closing_date || opportunity.closing_date >= today)
      .filter((opportunity) => mode === 'applications' || opportunity.verified_at >= verificationCutoff)
      .filter((opportunity) => mode !== 'applications' || Boolean(actions[opportunity.id]))
      .filter((opportunity) => category === 'all' || opportunity.category === category)
      .map((opportunity) => ({
        ...matchOpportunity(opportunity, profile),
        action: actions[opportunity.id],
      }))
      .sort((left, right) => (right.score ?? -1) - (left.score ?? -1));
  }, [actions, category, mode, opportunities, profile]);

  async function setAction(opportunityId: string, status: LearnerOpportunityAction | null) {
    setBusyId(opportunityId);
    setError('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to update your opportunity list.');
      const result = status
        ? await supabase.from('learner_opportunity_actions').upsert({
          user_id: authData.user.id,
          opportunity_id: opportunityId,
          status,
        }, { onConflict: 'user_id,opportunity_id' })
        : await supabase.from('learner_opportunity_actions')
          .delete()
          .eq('user_id', authData.user.id)
          .eq('opportunity_id', opportunityId);
      if (result.error) throw result.error;
      setActions((current) => {
        const updated = { ...current };
        if (status) updated[opportunityId] = status;
        else delete updated[opportunityId];
        return updated;
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your opportunity list could not be updated.');
    } finally {
      setBusyId('');
    }
  }

  async function copyApplicationDetails(opportunity: Opportunity) {
    setError('');
    try {
      await navigator.clipboard.writeText(applicationProfileSummary(opportunity, profile));
      setCopiedOpportunityId(opportunity.id);
    } catch (caught) {
      setError(`Could not copy your profile details: ${errorMessage(caught, 'clipboard access was denied.')}`);
    }
  }

  async function createApplicationPlan(opportunity: Opportunity) {
    setAiBusyId(opportunity.id);
    setAiErrors((current) => ({ ...current, [opportunity.id]: '' }));
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'application-plan',
          payload: {
            opportunity: {
              title: opportunity.title,
              organization: opportunity.organization,
              category: categoryLabel(opportunity.category),
              summary: opportunity.summary,
              source_name: opportunity.source_name,
              closing_date: opportunity.closing_date,
              location: opportunity.location,
              provinces: opportunity.provinces,
              remote_ok: opportunity.remote_ok,
              minimum_nqf_level: opportunity.minimum_nqf_level,
              required_skills: opportunity.required_skills,
            },
            profile: {
              target_role: profile.target_role,
              highest_qualification: profile.highest_qualification,
              field_of_study: profile.field_of_study,
              subjects: profileList(profile.subjects),
              skills: [...new Set([...profileList(profile.skills), ...profileList(profile.skill_ratings)])],
              experience_months: profile.experience_months,
              province: profile.province,
              nqf_level: profile.nqf_level,
            },
          },
        }),
      });
      const data = await response.json() as { text?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'The application plan could not be created.');
      }
      if (typeof data.text !== 'string' || !data.text.trim()) {
        throw new Error('The AI provider returned an empty application plan.');
      }
      const plan = data.text;
      setAiPlans((current) => ({ ...current, [opportunity.id]: plan }));
    } catch (caught) {
      setAiErrors((current) => ({
        ...current,
        [opportunity.id]: errorMessage(caught, 'The application plan could not be created.'),
      }));
    } finally {
      setAiBusyId('');
    }
  }

  async function copyApplicationPlan(opportunityId: string) {
    try {
      await navigator.clipboard.writeText(aiPlans[opportunityId] || '');
      setCopiedPlanId(opportunityId);
      setAiErrors((current) => ({ ...current, [opportunityId]: '' }));
    } catch (caught) {
      setAiErrors((current) => ({
        ...current,
        [opportunityId]: `Could not copy the application plan: ${errorMessage(caught, 'clipboard access was denied.')}`,
      }));
    }
  }

  if (loading) return <p className="py-8 text-sm text-slate-600" role="status">Finding verified opportunities...</p>;

  return (
    <section aria-label={mode === 'applications' ? 'Saved opportunities and applications' : 'Personalized opportunities'}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">{mode === 'applications' ? 'Your saved opportunities and application progress.' : 'Current listings from verified sources, ranked against the details in your profile.'}</p>
        </div>
        <div className="w-full max-w-xs">
          <label htmlFor="opportunity-category" className="label">Opportunity type</label>
          <select id="opportunity-category" className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All types</option>
            {opportunityCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="mb-5 text-sm text-red-700" role="alert">{error}</p>}

      {matches.length === 0 && !error ? (
        <div className="border-y border-slate-200 py-7">
          <h2 className="font-semibold text-midnight">{mode === 'applications' ? 'Nothing saved yet' : 'No current verified listings yet'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {mode === 'applications'
              ? 'When you save an opportunity or mark that you applied, it will appear here.'
              : 'Listings appear here after an admin verifies the original source, checks the details, and publishes them. We do not invent or scrape adverts.'}
          </p>
          {mode === 'applications' && <Link href="/app/employment/opportunities" className="link mt-4 inline-block text-sm">Browse opportunities</Link>}
        </div>
      ) : matches.length > 0 ? (
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {matches.map(({ opportunity, score, reasons, cautions, action }) => (
            <li key={opportunity.id} className="py-6">
              <article>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-dark">{categoryLabel(opportunity.category)}</p>
                    <h2 className="mt-1 text-lg font-semibold text-midnight">{opportunity.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{opportunity.organization}{opportunity.location ? ` · ${opportunity.location}` : ''}</p>
                  </div>
                  <div className="text-right">
                    {score === null
                      ? <p className="text-xs text-slate-500">Add profile details for fit guidance</p>
                      : <p className="text-sm font-semibold text-emerald-dark">{score}% fit signals</p>}
                    <p className="mt-1 text-xs text-slate-500">Closes: {formatDate(opportunity.closing_date)}</p>
                  </div>
                </div>

                {mode === 'applications' && (
                  opportunity.status === 'withdrawn'
                  || (opportunity.closing_date && opportunity.closing_date < new Date().toISOString().slice(0, 10))
                  || opportunity.verified_at < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                ) && (
                  <p className="mt-3 text-xs font-medium text-amber-800">This listing may have closed or been withdrawn. Check its source before taking action.</p>
                )}
                <p className="mt-3 max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-700">{opportunity.summary}</p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                  {opportunity.minimum_nqf_level !== null && <span>Stated minimum: NQF {opportunity.minimum_nqf_level}</span>}
                  {opportunity.required_skills.length > 0 && <span>Requirements: {opportunity.required_skills.join(', ')}</span>}
                  {opportunity.provinces.length > 0 && <span>Provinces: {opportunity.provinces.join(', ')}</span>}
                  {opportunity.remote_ok && <span>Remote option listed</span>}
                </div>

                {reasons.length > 0 && <p className="mt-3 text-xs leading-5 text-emerald-dark">Fit signals: {reasons.join(' · ')}</p>}
                {cautions.length > 0 && <p className="mt-2 text-xs leading-5 text-amber-800">Check before applying: {cautions.join(' · ')}</p>}

                <details className="mt-4 rounded-lg border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-midnight">Prepare your application</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Review and copy relevant details from your profile, then paste them into the employer&apos;s form as needed.
                    Your profile is not sent to the employer by CareerForge.
                  </p>
                  <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm text-slate-700">{applicationProfileSummary(opportunity, profile)}</pre>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" className="btn-secondary min-h-10" onClick={() => void copyApplicationDetails(opportunity)}>
                      {copiedOpportunityId === opportunity.id ? 'Copied profile details' : 'Copy profile details'}
                    </button>
                    <Link href="/app/profile" className="link text-sm">Review or update your profile</Link>
                  </div>
                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <h3 className="font-semibold text-midnight">AI application plan</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      When you choose to create a plan, this listing and the profile details shown above are sent to the configured AI provider for suggestions. CareerForge does not send them to the employer or save the generated plan. Check the original listing and edit all AI-written content before using it.
                    </p>
                    <button
                      type="button"
                      className="btn-secondary mt-3 min-h-10"
                      disabled={Boolean(aiBusyId)}
                      onClick={() => void createApplicationPlan(opportunity)}
                    >
                      {aiBusyId === opportunity.id ? 'Creating your plan…' : aiPlans[opportunity.id] ? 'Refresh AI plan' : 'Create AI application plan'}
                    </button>
                    {aiErrors[opportunity.id] && <p className="mt-3 text-sm text-amber-800" role="alert">{aiErrors[opportunity.id]}</p>}
                    {aiPlans[opportunity.id] && (
                      <div className="mt-4">
                        <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{aiPlans[opportunity.id]}</pre>
                        <button type="button" className="btn-secondary mt-3 min-h-10" onClick={() => void copyApplicationPlan(opportunity.id)}>
                          {copiedPlanId === opportunity.id ? 'Copied AI plan' : 'Copy AI plan'}
                        </button>
                      </div>
                    )}
                  </div>
                </details>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-10">
                    Apply on employer site
                  </a>
                  {action === 'applied' ? (
                    <>
                      <span className="text-sm font-medium text-emerald-dark">Marked as applied</span>
                      <button type="button" className="btn-secondary min-h-10" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'saved')}>Move to saved</button>
                    </>
                  ) : action === 'saved' ? (
                    <>
                      <span className="text-sm font-medium text-slate-600">Saved</span>
                      <button type="button" className="btn-secondary min-h-10" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'applied')}>Mark as applied</button>
                      <button type="button" className="btn-secondary min-h-10" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, null)}>Remove</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn-secondary min-h-10" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'saved')}>Save</button>
                      <button type="button" className="btn-secondary min-h-10" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'applied')}>Mark as applied</button>
                    </>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500">Source: {opportunity.source_name} · Verified {formatDate(opportunity.verified_at)}. Application opens in a new tab and is completed on the employer&apos;s site; CareerForge does not submit it. Fit signals use only listed requirements and profile details; they are not an eligibility decision.</p>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
