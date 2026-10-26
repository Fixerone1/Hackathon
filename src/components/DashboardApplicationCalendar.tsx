'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { HomeArrow } from '@/components/HomeArrow';

type CalendarAction = {
  opportunity_id: string;
  status: 'saved' | 'applied';
  scheduled_apply_date: string | null;
  opportunities: { title: string; organization: string; closing_date: string | null };
};

type CalendarEvent = {
  id: string;
  date: string;
  kind: 'Come back to apply' | 'Advert closes';
  title: string;
  organization: string;
};

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return new Intl.DateTimeFormat('en-ZA', options).format(dateFromKey(value));
}

export function DashboardApplicationCalendar({ actions }: { actions: CalendarAction[] }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const today = localDateKey(new Date());
  const saved = actions.filter((action) => action.status === 'saved');
  const events: CalendarEvent[] = saved.flatMap((action) => [
    ...(action.scheduled_apply_date ? [{
      id: `${action.opportunity_id}-return`,
      date: action.scheduled_apply_date,
      kind: 'Come back to apply' as const,
    }] : []),
    ...(action.opportunities.closing_date ? [{
      id: `${action.opportunity_id}-closing`,
      date: action.opportunities.closing_date,
      kind: 'Advert closes' as const,
    }] : []),
  ].map((event) => ({
    ...event,
    title: action.opportunities.title,
    organization: action.opportunities.organization,
  })));
  const monthLength = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 3);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card" aria-labelledby="dashboard-calendar-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><CalendarDays size={14} aria-hidden="true" /> Your saved opportunities</p>
          <h2 id="dashboard-calendar-heading" className="mt-1 text-lg font-bold text-midnight">Application calendar</h2>
          <p className="mt-1 text-sm text-slate-600">See return reminders and closing dates at a glance.</p>
        </div>
        <Link href="/app/employment/applications" className="group inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-midnight transition hover:bg-slate-50">
          Manage saved dates <HomeArrow />
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <p className="text-sm leading-6 text-slate-600">Save an opportunity to see its closing date here, or set a reminder for when you want to return to it.</p>
          <Link href="/app/employment/opportunities" className="btn-secondary min-h-10">Browse opportunities</Link>
        </div>
      ) : (
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-midnight">{new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric' }).format(month)}</h3>
              <div className="flex gap-1">
                <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={17} aria-hidden="true" /></button>
                <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={17} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Saved opportunity dates">
              {weekdays.map((day) => <div key={day} className="pb-1 text-center text-[10px] font-bold uppercase text-slate-500" role="columnheader">{day}</div>)}
              {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} className="min-h-10 sm:min-h-12" aria-hidden="true" />)}
              {Array.from({ length: monthLength }, (_, index) => {
                const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), index + 1));
                const dateEvents = events.filter((event) => event.date === date);
                const selected = selectedDate === date;
                return (
                  <button
                    key={date}
                    type="button"
                    role="gridcell"
                    aria-pressed={selected}
                    aria-label={`${formatDate(date, { dateStyle: 'full' })}${dateEvents.length ? `, ${dateEvents.length} saved opportunity dates` : ''}`}
                    onClick={() => setSelectedDate(date)}
                    className={`flex min-h-10 flex-col items-center justify-center rounded-lg p-1 text-sm transition-colors sm:min-h-12 ${selected ? 'bg-midnight font-bold text-white' : date === today ? 'bg-slate-100 font-bold text-midnight' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span>{index + 1}</span>
                    <span className="mt-0.5 flex h-1.5 gap-0.5">
                      {dateEvents.slice(0, 3).map((event) => <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-white' : event.kind === 'Come back to apply' ? 'bg-amber-600' : 'bg-slate-500'}`} />)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>{saved.length} saved {saved.length === 1 ? 'opportunity' : 'opportunities'}</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-600" />Return reminder</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-slate-500" />Closing date</span>
            </p>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected day</p>
            <h3 className="mt-1 font-semibold text-midnight">{formatDate(selectedDate, { dateStyle: 'full' })}</h3>
            {selectedEvents.length ? (
              <ul className="mt-2 divide-y divide-slate-200">
                {selectedEvents.map((event) => (
                  <li key={event.id} className="flex gap-2.5 py-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.kind === 'Come back to apply' ? 'bg-amber-600' : 'bg-slate-500'}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{event.kind}</p>
                      <p className="mt-1 text-sm font-semibold text-midnight">{event.title}</p>
                      <p className="text-xs text-slate-600">{event.organization}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">Nothing saved for this day. Choose a marked date or add a reminder to a saved opportunity.</p>
            )}
            {upcoming.length > 0 && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Coming up</h4>
                <ul className="mt-1 divide-y divide-slate-200">
                  {upcoming.map((event) => <li key={event.id} className="py-2">
                    <p className="text-xs font-semibold text-midnight">{formatDate(event.date)} · {event.kind}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-600">{event.title}</p>
                  </li>)}
                </ul>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
