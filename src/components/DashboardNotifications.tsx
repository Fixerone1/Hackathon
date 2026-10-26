'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, RefreshCw, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { matchOpportunity, normalizeOpportunity, type Opportunity, type OpportunityProfile } from '@/lib/opportunities';

type InboxItem = { opportunity: Opportunity; score: number | null; reasons: string[] };
type InboxReminder = { id: string; opportunityId: string; date: string; title: string; organization: string };
type ActionWithOpportunity = {
  opportunity_id: string;
  status: string;
  scheduled_apply_date: string | null;
  opportunities: { title: string; organization: string } | { title: string; organization: string }[];
};

function dateLabel(value: string): string {
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(date);
}

function todayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function DashboardNotifications({ userId }: { userId: string }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [reminders, setReminders] = useState<InboxReminder[]>([]);
  const [seenReminderIds, setSeenReminderIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastViewed, setLastViewed] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [dateTick, setDateTick] = useState(todayKey);

  useEffect(() => {
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(() => setDateTick(todayKey()), nextMidnight.getTime() - Date.now() + 50);
    return () => window.clearTimeout(timeout);
  }, [dateTick]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = getSupabase();
        const [opportunityResult, profileResult, actionResult] = await Promise.all([
          supabase.from('opportunities').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(50),
          supabase.from('learner_profiles').select('target_role,highest_qualification,qualification_status,qualification_year,field_of_study,subjects,skills,skill_ratings,experience_months,experience_by_area,province,city,nqf_level,languages,certifications,work_authorization,availability_start_date,shift_preferences,hours_available_per_week,target_income_monthly,target_income_monthly_max,employment_status,drivers_license,own_transport,willing_to_relocate,remote_ok,computer_or_data_access').maybeSingle(),
          supabase.from('learner_opportunity_actions').select('opportunity_id,status,scheduled_apply_date,opportunities!inner(title,organization)').eq('status', 'saved').not('scheduled_apply_date', 'is', null),
        ]);
        if (opportunityResult.error) throw opportunityResult.error;
        if (profileResult.error) throw profileResult.error;
        if (actionResult.error) throw actionResult.error;
        const storageKey = `careerforge-opportunities-viewed-${userId}`;
        const reminderStorageKey = `careerforge-reminders-viewed-${userId}`;
        const savedLastViewed = localStorage.getItem(storageKey);
        const savedSeenReminders = localStorage.getItem(reminderStorageKey);
        setAlertsEnabled(localStorage.getItem('careerforge-dashboard-alerts') !== 'false');
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const profile = (profileResult.data || {}) as OpportunityProfile;
        const freshMatches = (opportunityResult.data || [])
          .map((row) => normalizeOpportunity(row as Opportunity))
          .filter((opportunity) => new Date(opportunity.created_at).getTime() > cutoff.getTime())
          .map((opportunity) => ({ ...matchOpportunity(opportunity, profile), opportunity }))
          .filter((match) => match.score === null || match.score >= 30)
          .map(({ opportunity, score, reasons }) => ({ opportunity, score, reasons }));

        if (!active) return;
        setItems(freshMatches);
        setLastViewed(savedLastViewed || '');
        setSeenReminderIds(savedSeenReminders ? JSON.parse(savedSeenReminders) as string[] : []);
        setReminders(((actionResult.data || []) as unknown as ActionWithOpportunity[]).flatMap((action) => {
          if (!action.scheduled_apply_date) return [];
          const opportunity = Array.isArray(action.opportunities) ? action.opportunities[0] : action.opportunities;
          if (!opportunity) return [];
          return [{
            id: `${action.opportunity_id}:${action.scheduled_apply_date}`,
            opportunityId: action.opportunity_id,
            date: action.scheduled_apply_date,
            title: opportunity.title,
            organization: opportunity.organization,
          }];
        }));
        setError('');
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'New opportunities could not be checked.');
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    void load();
    return () => { active = false; };
  }, [dateTick, refreshKey, userId]);

  function toggleInbox() {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen) return;
    try {
      if (items.length > 0) {
        const viewedAt = new Date().toISOString();
        localStorage.setItem(`careerforge-opportunities-viewed-${userId}`, viewedAt);
        setLastViewed(viewedAt);
      }
      const dueIds = reminders.filter((reminder) => reminder.date <= dateTick).map((reminder) => reminder.id);
      const seenIds = [...new Set([...seenReminderIds, ...dueIds])];
      localStorage.setItem(`careerforge-reminders-viewed-${userId}`, JSON.stringify(seenIds));
      setSeenReminderIds(seenIds);
    } catch (caught) {
      setError(caught instanceof Error ? `Notifications could not be marked as viewed: ${caught.message}` : 'Notifications could not be marked as viewed.');
    }
  }

  const unreadMatches = alertsEnabled ? items.filter(({ opportunity }) => !lastViewed || new Date(opportunity.created_at).getTime() > new Date(lastViewed).getTime()).length : 0;
  const dueReminders = reminders.filter((reminder) => reminder.date <= dateTick);
  const unreadDueReminders = dueReminders.filter((reminder) => !seenReminderIds.includes(reminder.id)).length;
  const unreadCount = unreadMatches + unreadDueReminders;

  return (
    <div className="relative">
      <button type="button" onClick={toggleInbox} aria-label={`Opportunity notifications${unreadCount ? `, ${unreadCount} new` : ''}`}
        aria-expanded={open} aria-controls="dashboard-notification-inbox"
        title="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-midnight transition hover:border-sunshine-dark hover:bg-sunshine-light">
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sunshine px-1 text-[10px] font-bold text-midnight">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <section id="dashboard-notification-inbox" aria-label="New matching opportunities"
          className="fixed inset-x-3 top-[calc(4.25rem+env(safe-area-inset-top))] bottom-[calc(5rem+env(safe-area-inset-bottom)+0.75rem)] z-[80] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-left text-midnight shadow-xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-[calc(4.5rem+env(safe-area-inset-top))] sm:max-h-[min(75vh,34rem)] sm:w-[min(24rem,calc(100vw-2rem))] md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:max-h-[min(75vh,34rem)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">Your reminders and matches</h2>
              <p className="mt-1 text-xs text-slate-600">Saved dates stay here until you change or complete them.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-slate-100">
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          <button type="button" onClick={() => setRefreshKey((current) => current + 1)} disabled={loading}
            className="mt-2 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-midnight underline underline-offset-2 disabled:opacity-60">
            <RefreshCw size={14} aria-hidden="true" /> Refresh opportunities
          </button>
          {loading ? <p className="py-5 text-sm text-slate-600" role="status">Checking your reminders...</p>
            : error ? <p className="py-4 text-sm text-red-700" role="alert">{error}</p>
              : <>
                {dueReminders.length > 0 && <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3" aria-label="Application reminders due">
                  <h3 className="py-3 text-sm font-bold text-midnight">Come back to apply</h3>
                  <ul className="divide-y divide-amber-200">
                    {dueReminders.map((reminder) => (
                      <li key={reminder.id} className="py-3">
                        <p className="text-[11px] font-bold uppercase text-amber-900">{reminder.date === dateTick ? 'Due today' : `Overdue · ${dateLabel(reminder.date)}`}</p>
                        <p className="mt-1 text-sm font-semibold text-midnight">{reminder.title}</p>
                        <p className="text-xs text-slate-600">{reminder.organization}</p>
                        <Link href="/app/profile" onClick={() => setOpen(false)} className="mt-2 inline-flex min-h-9 items-center text-xs font-bold underline underline-offset-2">Open planner</Link>
                      </li>
                    ))}
                  </ul>
                </section>}
                {!alertsEnabled && <p className="py-4 text-sm leading-6 text-slate-600">New match alerts are paused in Settings.</p>}
                {alertsEnabled && items.length === 0 && dueReminders.length === 0 ? (
                <p className="py-5 text-sm leading-6 text-slate-600">No new matches right now. We’ll show recently published opportunities here when they fit your profile.</p>
                ) : alertsEnabled && items.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-200">
                  {items.map(({ opportunity, score, reasons }) => (
                    <li key={opportunity.id} className="py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{opportunity.category} · {dateLabel(opportunity.created_at)}</p>
                      <h3 className="mt-1 text-sm font-bold">{opportunity.title}
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${!lastViewed || new Date(opportunity.created_at).getTime() > new Date(lastViewed).getTime() ? 'bg-sunshine text-midnight' : 'bg-slate-100 text-slate-600'}`}>
                          {!lastViewed || new Date(opportunity.created_at).getTime() > new Date(lastViewed).getTime() ? 'New' : 'Viewed'}
                        </span>
                      </h3>
                      <p className="mt-1 text-xs text-slate-600">{opportunity.organization}{opportunity.location ? ` · ${opportunity.location}` : ''}</p>
                      {reasons.length > 0
                        ? <p className="mt-2 text-xs leading-5 text-slate-700">{reasons.join(' · ')}</p>
                        : <p className="mt-2 text-xs leading-5 text-slate-700">{score === null ? 'Add more details to your profile for more relevant matches.' : `${score}% profile fit signals`}</p>}
                      <Link href="/app/employment/opportunities" onClick={() => setOpen(false)}
                        className="mt-2 inline-flex min-h-9 items-center text-xs font-bold underline underline-offset-2">View opportunity</Link>
                    </li>
                  ))}
                </ul>
                )}
              </>}
          <Link href="/app/settings" onClick={() => setOpen(false)}
            className="mt-2 flex min-h-10 items-center border-t border-slate-200 pt-2 text-xs font-semibold underline underline-offset-2">Manage notification preferences</Link>
        </section>
      )}
    </div>
  );
}
