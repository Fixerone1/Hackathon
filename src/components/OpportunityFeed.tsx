'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Heart, Image, Linkedin, MessageCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { sendApplicationReminder, syncGoogleCalendar } from '@/lib/integrations';
import {
  categoryLabel,
  matchOpportunity,
  normalizeOpportunity,
  opportunityCoverageLabel,
  opportunityCategories,
  type LearnerOpportunityAction,
  type Opportunity,
  type OpportunityProfile,
} from '@/lib/opportunities';

type OpportunityFeedProps = { mode?: 'matches' | 'applications' };
type ActionRow = { opportunity_id: string; status: LearnerOpportunityAction; scheduled_apply_date: string | null };
type AccountDetails = { name: string; email: string };
const pageSize = 5;
const officialOpportunitySources = [
  {
    name: 'SAYouth',
    type: 'Jobs and learning opportunities',
    description: 'Explore opportunities on the national youth platform.',
    href: 'https://sayouth.mobi/',
  },
  {
    name: 'DPSA vacancy circulars',
    type: 'Public service vacancies',
    description: 'Check the latest official Public Service Vacancy Circular.',
    href: 'https://www.dpsa.gov.za/newsroom/psvc/',
  },
  {
    name: 'NSFAS',
    type: 'Student financial aid',
    description: 'Check funding information and application updates directly.',
    href: 'https://www.nsfas.org.za/',
  },
];

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
    if (item && typeof item === 'object') {
      if ('name' in item && typeof item.name === 'string') return [item.name.trim()].filter(Boolean);
      if ('area' in item && typeof item.area === 'string') {
        const months = 'months' in item && typeof item.months === 'number' ? ` (${item.months} months)` : '';
        return [`${item.area.trim()}${months}`];
      }
    }
    return [];
  });
}

function applicationProfileSummary(opportunity: Opportunity, profile: OpportunityProfile, account: AccountDetails): string {
  const workAuthorizationLabels: Record<string, string> = {
    citizen: 'South African citizen',
    permanent_resident: 'Permanent resident',
    work_visa: 'Work visa holder',
    unsure: 'Not sure',
    prefer_not_to_say: 'Prefer not to say',
  };
  const shiftLabels: Record<string, string> = {
    day: 'Daytime',
    evening: 'Evenings',
    night: 'Night shifts',
    weekend: 'Weekends',
    flexible: 'Flexible',
  };
  const qualificationStatusLabels: Record<string, string> = {
    completed: 'Completed',
    in_progress: 'In progress',
  };
  const employmentStatusLabels: Record<string, string> = {
    unemployed: 'Looking for work',
    student: 'Studying',
    employed_looking: 'Working and looking',
    self_employed: 'Self-employed',
  };
  const details = [
    ['Name', account.name],
    ['Email', account.email],
    ['Target role', profile.target_role],
    ['Highest qualification', profile.highest_qualification],
    ['Qualification status', typeof profile.qualification_status === 'string' ? qualificationStatusLabels[profile.qualification_status] || profile.qualification_status : ''],
    ['Qualification year', typeof profile.qualification_year === 'number' ? String(profile.qualification_year) : ''],
    ['Field of study', profile.field_of_study],
    ['Subjects', profileList(profile.subjects).join(', ')],
    ['Skills', [...new Set([...profileList(profile.skills), ...profileList(profile.skill_ratings)])].join(', ')],
    ['Experience', typeof profile.experience_months === 'number' ? `${profile.experience_months} months` : ''],
    ['Experience areas', profileList(profile.experience_by_area).map((entry) => entry).join(', ')],
    ['Location', [profile.city, profile.province].filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).join(', ')],
    ['Languages', profileList(profile.languages).join(', ')],
    ['Certificates and training', profileList(profile.certifications).join(', ')],
    ['Work authorization', typeof profile.work_authorization === 'string' ? workAuthorizationLabels[profile.work_authorization] || '' : ''],
    ['Available to start', profile.availability_start_date],
    ['Preferred shifts', profileList(profile.shift_preferences).map((shift) => shiftLabels[shift] || shift).join(', ')],
    ['Current situation', typeof profile.employment_status === 'string' ? employmentStatusLabels[profile.employment_status] || '' : ''],
    ['Weekly availability', typeof profile.hours_available_per_week === 'number' ? `${profile.hours_available_per_week} hours` : ''],
    ['Target monthly income', typeof profile.target_income_monthly === 'number' || typeof profile.target_income_monthly_max === 'number'
      ? `R ${typeof profile.target_income_monthly === 'number' ? profile.target_income_monthly : '—'} to ${typeof profile.target_income_monthly_max === 'number' ? profile.target_income_monthly_max : '—'}`
      : ''],
    ['Driver’s licence', typeof profile.drivers_license === 'boolean' ? profile.drivers_license ? 'Yes' : 'No' : ''],
    ['Transport access', typeof profile.own_transport === 'boolean' ? profile.own_transport ? 'Yes' : 'No' : ''],
    ['Open to relocating', typeof profile.willing_to_relocate === 'boolean' ? profile.willing_to_relocate ? 'Yes' : 'No' : ''],
    ['Work arrangement', profile.remote_ok === true ? 'Open to remote work' : profile.remote_ok === false ? 'Not open to remote work' : ''],
    ['Computer or data access', typeof profile.computer_or_data_access === 'boolean' ? profile.computer_or_data_access ? 'Yes' : 'No' : ''],
  ].filter((item): item is [string, string] => typeof item[1] === 'string' && item[1].trim().length > 0);

  return [
    `Application details for ${opportunity.title} at ${opportunity.organization}`,
    ...details.map(([label, value]) => `${label}: ${value}`),
    '',
    'Before submitting: check the original advert for requirements and upload identity documents directly on the employer’s site if requested. References are not stored here; provide them directly only when an application asks.',
  ].join('\n');
}

export function OpportunityFeed({ mode = 'matches' }: OpportunityFeedProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<OpportunityProfile>({});
  const [account, setAccount] = useState<AccountDetails>({ name: '', email: '' });
  const [actions, setActions] = useState<Record<string, LearnerOpportunityAction>>({});
  const [reminders, setReminders] = useState<Record<string, string>>({});
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [copiedOpportunityId, setCopiedOpportunityId] = useState('');
  const [aiBusyId, setAiBusyId] = useState('');
  const [aiPlans, setAiPlans] = useState<Record<string, string>>({});
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  const [copiedPlanId, setCopiedPlanId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openNoteId, setOpenNoteId] = useState('');

  useEffect(() => {
    let active = true;
    async function loadFeed() {
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again to view your opportunity feed.');
        const accountName = authData.user.user_metadata?.name;
        setAccount({
          name: typeof accountName === 'string' ? accountName : '',
          email: authData.user.email || '',
        });
        const opportunityResult = await supabase.from('opportunities').select('*');
        if (opportunityResult.error) throw opportunityResult.error;
        if (!active) return;
        setOpportunities((opportunityResult.data || []).map(normalizeOpportunity));

        const [profileResult, actionResult] = await Promise.all([
          supabase.from('learner_profiles').select('target_role,highest_qualification,qualification_status,qualification_year,field_of_study,subjects,skills,skill_ratings,experience_months,experience_by_area,province,city,nqf_level,languages,certifications,work_authorization,availability_start_date,shift_preferences,hours_available_per_week,target_income_monthly,target_income_monthly_max,employment_status,drivers_license,own_transport,willing_to_relocate,remote_ok,computer_or_data_access').maybeSingle(),
          supabase.from('learner_opportunity_actions').select('opportunity_id,status,scheduled_apply_date'),
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
          const loadedActions = (actionResult.data || []) as ActionRow[];
          setActions(Object.fromEntries(loadedActions.map((action) => [action.opportunity_id, action.status])));
          setReminders(Object.fromEntries(loadedActions.flatMap((action) => action.scheduled_apply_date ? [[action.opportunity_id, action.scheduled_apply_date]] : [])));
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

  useEffect(() => {
    if (!account.email) return;
    try {
      const saved = localStorage.getItem(`careerforge-opportunity-notes-${account.email}`);
      setNotes(saved ? JSON.parse(saved) as Record<string, string> : {});
    } catch (caught) {
      setError(caught instanceof Error ? `Private notes could not be loaded: ${caught.message}` : 'Private notes could not be loaded.');
    }
  }, [account.email]);

  const matches = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const verificationCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const query = searchQuery.trim().toLocaleLowerCase();
    return opportunities
      .filter((opportunity) => mode === 'applications' || opportunity.status === 'published')
      .filter((opportunity) => mode === 'applications' || !opportunity.closing_date || opportunity.closing_date >= today)
      .filter((opportunity) => mode === 'applications' || opportunity.verified_at >= verificationCutoff)
      .filter((opportunity) => mode !== 'applications' || Boolean(actions[opportunity.id]))
      .filter((opportunity) => category === 'all' || opportunity.category === category)
      .filter((opportunity) => !query || [
        opportunity.title,
        opportunity.organization,
        opportunity.location,
        opportunity.summary,
        opportunity.source_name,
        categoryLabel(opportunity.category),
        ...opportunity.provinces,
      ].some((value) => value.toLocaleLowerCase().includes(query)))
      .map((opportunity) => ({
        ...matchOpportunity(opportunity, profile),
        action: actions[opportunity.id],
      }))
      .sort((left, right) => (right.score ?? -1) - (left.score ?? -1));
  }, [actions, category, mode, opportunities, profile, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const pageMatches = matches.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [category, mode, searchQuery]);

  async function setAction(opportunityId: string, status: LearnerOpportunityAction | null) {
    setBusyId(opportunityId);
    setError('');
    setMessage('');
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
      try {
        await syncGoogleCalendar();
      } catch (caught) {
        setError(`Your opportunity list was updated, but Google Calendar could not be synced: ${errorMessage(caught, 'please try again later.')}`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your opportunity list could not be updated.');
    } finally {
      setBusyId('');
    }
  }

  async function saveReminder(opportunityId: string, date: string) {
    setBusyId(opportunityId);
    setError('');
    setMessage('');
    try {
      const changedDate = (reminders[opportunityId] || '') !== date;
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to save your application reminder.');
      const { error: saveError } = await supabase.from('learner_opportunity_actions').upsert({
        user_id: authData.user.id,
        opportunity_id: opportunityId,
        status: actions[opportunityId] || 'saved',
        scheduled_apply_date: date || null,
      }, { onConflict: 'user_id,opportunity_id' });
      if (saveError) throw saveError;
      setReminders((current) => {
        const updated = { ...current };
        if (date) updated[opportunityId] = date;
        else delete updated[opportunityId];
        return updated;
      });
      setActions((current) => current[opportunityId] ? current : { ...current, [opportunityId]: 'saved' });
      const warnings: string[] = [];
      try {
        await syncGoogleCalendar();
      } catch (caught) {
        warnings.push(`Google Calendar could not be synced: ${errorMessage(caught, 'please try again later.')}`);
      }
      let emailSent = false;
      if (date && changedDate) {
        try {
          emailSent = (await sendApplicationReminder(opportunityId)).sent === true;
        } catch (caught) {
          warnings.push(errorMessage(caught, 'The email alert could not be sent.'));
        }
      }
      if (warnings.length > 0) setError(`Your reminder was saved. ${warnings.join(' ')}`);
      setMessage(emailSent ? 'Your application reminder was saved and emailed.' : 'Your application reminder was saved.');
    } catch (caught) {
      setError(errorMessage(caught, 'Your application reminder could not be saved.'));
    } finally {
      setBusyId('');
    }
  }

  async function copyApplicationDetails(opportunity: Opportunity) {
    setError('');
    try {
      await navigator.clipboard.writeText(applicationProfileSummary(opportunity, profile, account));
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
              shift_types: opportunity.shift_types,
              salary_min_monthly: opportunity.salary_min_monthly,
              salary_max_monthly: opportunity.salary_max_monthly,
            },
            profile: {
              target_role: profile.target_role,
              highest_qualification: profile.highest_qualification,
              field_of_study: profile.field_of_study,
              subjects: profileList(profile.subjects),
              skills: [...new Set([...profileList(profile.skills), ...profileList(profile.skill_ratings), ...profileList(profile.certifications)])],
              experience_months: profile.experience_months,
              province: profile.province,
              nqf_level: profile.nqf_level,
              languages: profileList(profile.languages),
              certifications: profileList(profile.certifications),
              availability_start_date: profile.availability_start_date,
              shift_preferences: profileList(profile.shift_preferences),
              work_authorization: profile.work_authorization,
              target_income_monthly: profile.target_income_monthly,
              target_income_monthly_max: profile.target_income_monthly_max,
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

  function updateNote(opportunityId: string, value: string) {
    const updated = { ...notes, [opportunityId]: value };
    setNotes(updated);
    try {
      localStorage.setItem(`careerforge-opportunity-notes-${account.email}`, JSON.stringify(updated));
    } catch (caught) {
      setError(caught instanceof Error ? `Your private note could not be saved: ${caught.message}` : 'Your private note could not be saved.');
    }
  }

  if (loading) return <p className="py-8 text-sm text-slate-600" role="status">Finding verified opportunities...</p>;

  return (
    <section aria-label={mode === 'applications' ? 'Saved opportunities and applications' : 'Personalized opportunities'}>
      <div className="mb-5 rounded-2xl border border-slate-200 bg-sunshine-light p-4 sm:p-5">
        <p className="mb-4 text-sm leading-6 text-slate-600">{mode === 'applications' ? 'Your saved opportunities and application progress.' : 'Search current listings from verified sources. Matches use the details in your profile; check each original advert before applying.'}</p>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.55fr)]">
          <div>
            <label htmlFor="opportunity-search" className="label">Search opportunities</label>
            <input
              id="opportunity-search"
              className="input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Role, organisation, location, or skill"
            />
          </div>
          <div>
            <label htmlFor="opportunity-category" className="label">Opportunity type</label>
            <select id="opportunity-category" className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All types</option>
              {opportunityCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-3 text-sm" aria-live="polite">
        <p className="font-medium text-midnight">
          {matches.length === 0
            ? '0 opportunities'
            : `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, matches.length)} of ${matches.length} opportunities`}
        </p>
        {pageCount > 1 && <nav className="flex items-center gap-2" aria-label="Opportunity pages">
          <button type="button" className="btn-secondary min-h-9 px-3" aria-label="Previous opportunities" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} aria-hidden="true" /></button>
          <span className="min-w-20 text-center text-xs text-slate-600">Page {page} of {pageCount}</span>
          <button type="button" className="btn-secondary min-h-9 px-3" aria-label="Next opportunities" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={16} aria-hidden="true" /></button>
        </nav>}
      </div>

      {error && <p className="mb-5 text-sm text-red-700" role="alert">{error}</p>}
      {message && <p className="mb-5 text-sm text-emerald-dark" role="status">{message}</p>}

      {matches.length === 0 && !error ? (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-sunshine bg-sunshine-light/40 p-5 sm:p-6">
            <h2 className="font-semibold text-midnight">
              {mode === 'applications'
                ? 'Nothing saved yet'
                : searchQuery.trim() || category !== 'all'
                  ? 'No opportunities match these filters'
                  : 'No current verified listings yet'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              {mode === 'applications'
                ? 'Save a listing from your matches to keep it here, set a reminder, and track when you apply.'
                : searchQuery.trim() || category !== 'all'
                  ? 'Try a different search or type. Filters only change what you see; they do not remove saved listings.'
                  : 'New listings appear here after they are checked against the original source. Until then, you can search these official opportunity sites directly.'}
            </p>
            {(searchQuery.trim() || category !== 'all') && (
              <button
                type="button"
                className="btn-secondary mt-4 min-h-10"
                onClick={() => {
                  setSearchQuery('');
                  setCategory('all');
                }}
              >
                Clear filters
              </button>
            )}
            {mode === 'applications' && <Link href="/app/employment/opportunities" className="link mt-4 inline-block text-sm">Browse opportunities</Link>}
          </div>
          {mode === 'matches' && (
            <section aria-labelledby="official-opportunity-sources-heading">
              <div className="mb-3">
                <p className="eyebrow">Trusted places to start</p>
                <h2 id="official-opportunity-sources-heading" className="mt-1 text-lg font-semibold text-midnight">Browse official opportunity sources</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">These links open the provider’s site. Check current availability, requirements, and closing dates there.</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {officialOpportunitySources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full min-h-36 flex-col rounded-2xl border border-sunshine bg-white p-4 transition hover:bg-sunshine-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunshine-dark focus-visible:ring-offset-2"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{source.type}</span>
                      <span className="mt-2 flex items-center justify-between gap-2 font-semibold text-midnight">
                        {source.name}
                        <ArrowUpRight size={17} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                      <span className="mt-2 text-sm leading-5 text-slate-600">{source.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : matches.length > 0 ? (
        <ul className="space-y-4">
          {pageMatches.map(({ opportunity, score, reasons, cautions, action }, index) => (
            <li key={opportunity.id}>
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(10,10,10,0.04)] transition-shadow hover:shadow-[0_8px_20px_rgba(10,10,10,0.08)]">
                <div className="relative h-36 overflow-hidden bg-sunshine-light sm:h-44">
                  <div className="absolute inset-0 grid place-items-center text-midnight/60" aria-hidden="true"><Image size={30} strokeWidth={1.5} /></div>
                  {opportunity.banner_image_url && <img src={opportunity.banner_image_url} alt={`${opportunity.organization} opportunity banner`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-midnight shadow-sm">{categoryLabel(opportunity.category)}</span>
                </div>
                <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-midnight">{opportunity.organization}</p>
                    <p className="truncate text-xs text-slate-500">{categoryLabel(opportunity.category)} · {opportunity.source_name} · Verified {formatDate(opportunity.verified_at)}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-slate-500">{(page - 1) * pageSize + index + 1}/{matches.length}</span>
                </header>
                <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold leading-snug text-midnight">{opportunity.title}</h2>
                    {opportunity.location && <p className="mt-1 text-sm text-slate-600">{opportunity.location}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:justify-end">
                    {score === null
                      ? <p className="text-xs leading-5 text-slate-600">Fit guidance</p>
                      : <p className="font-semibold text-midnight"><span className="rounded-full bg-sunshine-light px-2 py-1">{score}% fit</span></p>}
                    {score === null && <Link href="/app/profile" className="text-xs font-semibold text-midnight underline underline-offset-2">Improve your match</Link>}
                    <p className="text-xs text-slate-600">Closes {formatDate(opportunity.closing_date)}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-700">{opportunity.summary}</p>

                {mode === 'applications' && (
                  (opportunity.closing_date && opportunity.closing_date < new Date().toISOString().slice(0, 10))
                  || opportunity.verified_at < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                ) && (
                  <p className="mt-3 text-xs font-medium text-amber-800">This listing may have closed or needs re-verification. Check its source before taking action.</p>
                )}
                <details className="mt-3 min-w-0">
                  <summary className="min-h-10 cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-midnight marker:text-emerald-dark hover:bg-slate-50">View requirements and plan a return date</summary>
                  <div className="mt-3 border-l-2 border-sunshine-dark pl-4">
                    <p className="max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-700">{opportunity.summary}</p>
                    <div className="mt-3">
                      <p className="metadata-label mb-2">Listing details · confirm against the original advert</p>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                        <span className="chip">Coverage: {opportunityCoverageLabel(opportunity.provinces)}</span>
                        {opportunity.minimum_nqf_level !== null && <span className="chip">Minimum NQF {opportunity.minimum_nqf_level}</span>}
                        {opportunity.required_skills.length > 0 && <span className="chip">Skills: {opportunity.required_skills.join(', ')}</span>}
                        {opportunity.remote_ok && <span className="chip">Remote option</span>}
                        {opportunity.shift_types.length > 0 && <span className="chip">Shifts: {opportunity.shift_types.join(', ')}</span>}
                        {(opportunity.salary_min_monthly !== null || opportunity.salary_max_monthly !== null) && <span className="chip">Monthly pay: R {opportunity.salary_min_monthly ?? '—'} to {opportunity.salary_max_monthly ?? '—'}</span>}
                      </div>
                    </div>
                    {reasons.length > 0 && <p className="mt-3 text-sm leading-6 text-emerald-900"><span className="font-semibold">Why this may fit:</span> {reasons.join(' · ')}</p>}
                    {cautions.length > 0 && <p className="mt-2 text-sm leading-6 text-amber-900"><span className="font-semibold">Check before applying:</span> {cautions.join(' · ')}</p>}
                    <p className="mt-3 text-xs leading-5 text-slate-500">Source: {opportunity.source_name} · Verified {formatDate(opportunity.verified_at)}. Apply on the employer&apos;s site; Ukukhanya does not submit applications.</p>
                  </div>
                  {action === 'saved' ? (
                    <div className="mt-4 flex flex-col gap-2 rounded-lg bg-sunshine-light/60 p-3 sm:flex-row sm:items-end">
                      <label className="flex-1 text-xs font-semibold text-midnight" htmlFor={`return-date-${opportunity.id}`}>
                        Set a day to come back
                        <input id={`return-date-${opportunity.id}`} type="date" className="input mt-1 min-h-10 bg-white" value={reminders[opportunity.id] || ''} onChange={(event) => setReminders((current) => ({ ...current, [opportunity.id]: event.target.value }))} />
                      </label>
                      <button type="button" className="btn-secondary min-h-10 w-full sm:w-auto" disabled={busyId === opportunity.id} onClick={() => void saveReminder(opportunity.id, reminders[opportunity.id] || '')}>
                        {busyId === opportunity.id ? 'Saving...' : 'Save reminder'}
                      </button>
                      <p className="text-xs leading-5 text-slate-600 sm:max-w-44">The bell will show it when the date is due.</p>
                    </div>
                  ) : action === 'applied' ? (
                    <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">Applied · marked complete in your list.</p>
                  ) : (
                    <button type="button" className="btn-secondary mt-4 min-h-10 w-full sm:w-auto" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'saved')}>
                      <Heart size={16} aria-hidden="true" /> Save this opportunity to plan a return date
                    </button>
                  )}
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Review your saved details, then copy this application pack and paste it into the employer&apos;s form. Nothing is sent to the employer automatically.
                  </p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-sm leading-6 text-slate-700">{applicationProfileSummary(opportunity, profile, account)}</pre>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" className="btn-secondary min-h-10" onClick={() => void copyApplicationDetails(opportunity)}>
                      {copiedOpportunityId === opportunity.id ? 'Copied application pack' : 'Copy application pack'}
                    </button>
                    <Link href="/app/profile" className="link text-sm">Review or update your profile</Link>
                  </div>
                  <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                    <h3 className="font-semibold text-midnight">AI application plan</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      When you choose to create a plan, this listing and the profile details shown above are sent to the configured AI provider for suggestions. Ukukhanya does not send them to the employer or save the generated plan. Check the original listing and edit all AI-written content before using it.
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
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{aiPlans[opportunity.id]}</pre>
                        <button type="button" className="btn-secondary mt-3 min-h-10" onClick={() => void copyApplicationPlan(opportunity.id)}>
                          {copiedPlanId === opportunity.id ? 'Copied AI plan' : 'Copy AI plan'}
                        </button>
                      </div>
                    )}
                  </div>
                </details>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                  <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-10 w-full sm:w-auto">
                    View &amp; apply <span aria-hidden="true">→</span>
                  </a>
                  {action === 'saved' && <span className="text-xs font-medium text-emerald-800">Saved to your plan</span>}
                  <div role="group" aria-label="Opportunity social actions" className="flex w-full items-center justify-center gap-2">
                    <button type="button" aria-label={action === 'saved' ? 'Unlike and remove from saved opportunities' : 'Like and save this opportunity'}
                      aria-pressed={action === 'saved'} disabled={busyId === opportunity.id || action === 'applied'}
                      title={action === 'saved' ? 'Remove from saved' : 'Like and save'}
                      onClick={() => void setAction(opportunity.id, action === 'saved' ? null : 'saved')}
                      className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-midnight transition hover:border-slate-300 hover:bg-sunshine-light disabled:opacity-50">
                      <Heart size={19} fill={action === 'saved' ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunity.source_url)}`}
                      target="_blank" rel="noopener noreferrer" aria-label="Share this opportunity on LinkedIn" title="Share on LinkedIn"
                      className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-midnight transition hover:border-slate-300 hover:bg-sunshine-light">
                      <Linkedin size={19} aria-hidden="true" />
                    </a>
                    <button type="button" aria-label={openNoteId === opportunity.id ? 'Close private note' : 'Add a private note'}
                      aria-expanded={openNoteId === opportunity.id} title="Add a private note"
                      onClick={() => setOpenNoteId((current) => current === opportunity.id ? '' : opportunity.id)}
                      className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-midnight transition hover:border-slate-300 hover:bg-sunshine-light">
                      <MessageCircle size={19} aria-hidden="true" />
                    </button>
                  </div>
                  {action === 'applied' ? (
                    <>
                      <span className="text-sm font-medium text-emerald-dark">Marked as applied</span>
                      <button type="button" className="btn-secondary w-full sm:w-auto" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'saved')}>Move to saved</button>
                    </>
                  ) : action === 'saved' ? (
                    <>
                      <button type="button" className="btn-secondary w-full sm:w-auto" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'applied')}>Mark as applied</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn-secondary w-full sm:w-auto" disabled={busyId === opportunity.id} onClick={() => void setAction(opportunity.id, 'applied')}>Mark as applied</button>
                    </>
                  )}
                </div>
                {openNoteId === opportunity.id && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center sm:text-left">
                    <label htmlFor={`opportunity-note-${opportunity.id}`} className="block text-sm font-semibold text-midnight">Private note</label>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Only stored in this browser and not shared with the employer or other learners.</p>
                    <textarea id={`opportunity-note-${opportunity.id}`} className="input mt-3 min-h-24 resize-y"
                      maxLength={2000} value={notes[opportunity.id] || ''}
                      onChange={(event) => updateNote(opportunity.id, event.target.value)}
                      placeholder="Add a reminder, question, or follow-up idea..." />
                  </div>
                )}

                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
