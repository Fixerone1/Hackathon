'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, BellRing, CalendarDays, GraduationCap, Wrench } from 'lucide-react';

const reminderStorageKey = 'beacon:study-admissions-return-date';

const applicationRoutes = [
  {
    title: 'University applications',
    description: 'Compare courses and campuses, then apply through each university’s official admissions portal. Requirements and opening dates differ by institution.',
    steps: [
      'Shortlist courses and check subject, admission-point, and qualification requirements.',
      'Confirm application dates, fees or fee waivers, and required documents with each university.',
      'Apply on the official university website and save your reference number.',
    ],
    link: 'https://www.usaf.ac.za/',
    linkLabel: 'Explore South Africa’s public universities',
    Icon: GraduationCap,
  },
  {
    title: 'TVET college applications',
    description: 'Explore vocational and occupational programmes at public TVET colleges. Apply directly to the college and campus offering your chosen course.',
    steps: [
      'Choose a programme and campus; check its entry requirements and application dates.',
      'Ask the college about placement assessments, supporting documents, and any application fee.',
      'Apply through the college’s official channel and keep your confirmation details.',
    ],
    link: 'https://www.dhet.gov.za/SitePages/TVETColleges.aspx',
    linkLabel: 'Visit the Department of Higher Education and Training',
    Icon: Wrench,
  },
];

function todayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`));
}

export function StudyAdmissions() {
  const [returnDate, setReturnDate] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setReturnDate(localStorage.getItem(reminderStorageKey) || '');
    } catch (caught) {
      setError(caught instanceof Error ? `Your admissions reminder could not be loaded: ${caught.message}` : 'Your admissions reminder could not be loaded.');
    } finally {
      setLoaded(true);
    }
  }, []);

  function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      if (!returnDate) {
        localStorage.removeItem(reminderStorageKey);
        setMessage('Your return reminder has been cleared.');
      } else {
        localStorage.setItem(reminderStorageKey, returnDate);
        setMessage('Your return reminder has been saved in this browser.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? `Your admissions reminder could not be saved: ${caught.message}` : 'Your admissions reminder could not be saved.');
    }
  }

  function clearReminder() {
    setMessage('');
    setError('');
    try {
      localStorage.removeItem(reminderStorageKey);
      setReturnDate('');
      setMessage('Your return reminder has been cleared.');
    } catch (caught) {
      setError(caught instanceof Error ? `Your admissions reminder could not be cleared: ${caught.message}` : 'Your admissions reminder could not be cleared.');
    }
  }

  const reminderDue = Boolean(returnDate && returnDate <= todayKey());

  return (
    <section id="admissions" className="mb-8 scroll-mt-36" aria-labelledby="study-admissions-heading">
      <div className="mb-4">
        <p className="eyebrow">Plan ahead</p>
        <h2 id="study-admissions-heading" className="mt-1 text-xl font-bold text-midnight">University and TVET college applications</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Admissions usually happen directly through each institution. Use this guide to prepare while applications are closed, and always check dates and requirements with the institution.</p>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {applicationRoutes.map(({ title, description, steps, link, linkLabel, Icon }) => (
          <li key={title}>
            <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunshine-light text-midnight">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-midnight">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              <h4 className="mt-4 text-sm font-semibold text-midnight">Get ready</h4>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-6 text-slate-600">
                {steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <a href={link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-midnight underline underline-offset-2 hover:text-slate-700">
                {linkLabel} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl border border-sunshine bg-sunshine-light/50 p-5">
        <div className="flex items-start gap-3">
          <CalendarDays size={21} className="mt-0.5 shrink-0 text-midnight" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-midnight">Remind me to check applications</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">Choose a day to come back and check whether applications have opened. Your reminder stays in this browser and appears here when it is due; it does not send an email or phone notification.</p>
            {reminderDue && (
              <p className="mt-3 rounded-lg bg-white p-3 text-sm font-semibold text-midnight" role="status">
                <BellRing size={16} className="mr-2 inline" aria-hidden="true" />
                It’s time to check university and TVET college application dates. Your reminder was set for {formatDate(returnDate)}.
              </p>
            )}
            <form onSubmit={saveReminder} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label htmlFor="study-admissions-return-date" className="text-sm font-semibold text-midnight">
                Come back on
                <input
                  id="study-admissions-return-date"
                  type="date"
                  min={todayKey()}
                  value={returnDate}
                  onChange={(event) => { setReturnDate(event.target.value); setMessage(''); }}
                  disabled={!loaded}
                  className="input mt-1 min-h-11 bg-white"
                />
              </label>
              <button type="submit" disabled={!loaded} className="btn-primary min-h-11 px-4">
                Save reminder
              </button>
              {returnDate && (
                <button type="button" disabled={!loaded} className="btn-secondary min-h-11 px-4" onClick={clearReminder}>
                  Clear reminder
                </button>
              )}
            </form>
            {message && <p className="mt-3 text-sm font-medium text-emerald-900" role="status">{message}</p>}
            {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
