'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, RefreshCw, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { matchOpportunity, normalizeOpportunity, type Opportunity, type OpportunityProfile } from '@/lib/opportunities';

type InboxItem = { opportunity: Opportunity; score: number | null; reasons: string[] };

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(value));
}

export function DashboardNotifications({ userId }: { userId: string }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastViewed, setLastViewed] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = getSupabase();
        const [opportunityResult, profileResult] = await Promise.all([
          supabase.from('opportunities').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(50),
          supabase.from('learner_profiles').select('target_role,highest_qualification,qualification_status,qualification_year,field_of_study,subjects,skills,skill_ratings,experience_months,experience_by_area,province,city,nqf_level,languages,certifications,work_authorization,availability_start_date,shift_preferences,hours_available_per_week,target_income_monthly,target_income_monthly_max,employment_status,drivers_license,own_transport,willing_to_relocate,remote_ok,computer_or_data_access').maybeSingle(),
        ]);
        if (opportunityResult.error) throw opportunityResult.error;
        if (profileResult.error) throw profileResult.error;
        const storageKey = `careerforge-opportunities-viewed-${userId}`;
        const savedLastViewed = localStorage.getItem(storageKey);
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
  }, [refreshKey, userId]);

  function toggleInbox() {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen || items.length === 0) return;
    const viewedAt = new Date().toISOString();
    try {
      localStorage.setItem(`careerforge-opportunities-viewed-${userId}`, viewedAt);
      setLastViewed(viewedAt);
    } catch (caught) {
      setError(caught instanceof Error ? `Notifications could not be marked as viewed: ${caught.message}` : 'Notifications could not be marked as viewed.');
    }
  }

  const unreadCount = alertsEnabled ? items.filter(({ opportunity }) => !lastViewed || new Date(opportunity.created_at).getTime() > new Date(lastViewed).getTime()).length : 0;

  return (
    <div className="relative">
      <button type="button" onClick={toggleInbox} aria-label={`Opportunity notifications${unreadCount ? `, ${unreadCount} new` : ''}`}
        aria-expanded={open} aria-controls="dashboard-notification-inbox"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-[#e5e5e5] bg-white text-midnight transition hover:border-sunshine-dark hover:bg-sunshine-light">
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sunshine px-1 text-[10px] font-bold text-midnight">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <section id="dashboard-notification-inbox" aria-label="New matching opportunities"
          className="absolute right-0 top-full z-[80] mt-2 max-h-[min(75vh,34rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[#e5e5e5] bg-white p-4 text-center text-midnight shadow-xl sm:text-left">
          <div className="flex items-center justify-between gap-3 text-left">
            <div>
              <h2 className="font-bold">Opportunity updates</h2>
              <p className="mt-1 text-xs text-slate-600">Recent matches from the last 7 days.</p>
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
          {!alertsEnabled ? <p className="py-5 text-sm leading-6 text-slate-600">New opportunity alerts are paused. Turn them on in Settings to see matching updates here.</p>
            : loading ? <p className="py-5 text-sm text-slate-600" role="status">Checking new opportunities...</p>
            : error ? <p className="py-4 text-sm text-red-700" role="alert">{error}</p>
              : items.length === 0 ? (
                <p className="py-5 text-sm leading-6 text-slate-600">No new matches right now. We’ll show recently published opportunities here when they fit your profile.</p>
              ) : (
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
          <Link href="/app/settings" onClick={() => setOpen(false)}
            className="mt-2 flex min-h-10 items-center border-t border-slate-200 pt-2 text-xs font-semibold underline underline-offset-2">Manage notification preferences</Link>
        </section>
      )}
    </div>
  );
}
