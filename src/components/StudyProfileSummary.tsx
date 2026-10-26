'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

type StudyProfile = {
  highest_qualification: string | null;
  qualification_status: string | null;
  field_of_study: string | null;
  qualification_year: number | null;
  personal_goal: string | null;
  subjects: unknown;
};

function subjectLabels(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return [];
    const mark = 'mark' in item && typeof item.mark === 'number' ? `: ${item.mark}` : '';
    return [`${item.name}${mark}`];
  });
}

export function StudyProfileSummary() {
  const [profile, setProfile] = useState<StudyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadStudyProfile() {
      try {
        const { data, error: profileError } = await getSupabase()
          .from('learner_profiles')
          .select('highest_qualification,qualification_status,field_of_study,qualification_year,personal_goal,subjects')
          .maybeSingle();
        if (profileError) throw profileError;
        if (active) setProfile(data as StudyProfile | null);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Your study profile could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadStudyProfile();
    return () => { active = false; };
  }, []);

  const subjects = subjectLabels(profile?.subjects);
  const details = [
    ['Current or highest qualification', profile?.highest_qualification],
    ['Status', profile?.qualification_status === 'completed' ? 'Completed' : profile?.qualification_status === 'in_progress' ? 'In progress' : null],
    ['Field of study', profile?.field_of_study],
    ['Completion year', profile?.qualification_year ? String(profile.qualification_year) : null],
    ['Study goal', profile?.personal_goal],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="study-profile-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Your details</p>
          <h2 id="study-profile-heading" className="mt-1 text-lg font-bold text-midnight">Study profile</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Education details saved in your learner profile appear here to help you prepare for study and funding applications.</p>
        </div>
        <Link href="/app/profile" className="btn-secondary min-h-10 px-3">Update education details</Link>
      </div>
      {loading ? (
        <p className="mt-4 text-sm text-slate-600" role="status">Loading your study details...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">Study details could not be loaded: {error}</p>
      ) : details.length || subjects.length ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs font-semibold text-slate-500">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-800">{value}</dd>
            </div>
          ))}
          {subjects.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
              <dt className="text-xs font-semibold text-slate-500">Subjects and marks</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{subjects.join(' · ')}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">Add your qualification, subjects, and study goals to your profile to keep them together here.</p>
      )}
    </section>
  );
}
