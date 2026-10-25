'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Printer, Save } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

type LearnerProfile = {
  display_name?: string;
  about_me?: string;
  personal_goal?: string;
  target_role?: string;
  city?: string;
  province?: string;
  highest_qualification?: string;
  qualification_status?: string;
  qualification_year?: number | null;
  field_of_study?: string;
  skills?: unknown;
  skill_ratings?: unknown;
  certifications?: unknown;
  languages?: unknown;
};

type CvDetails = {
  phone: string;
  summary: string;
  experience: string;
};

const emptyDetails: CvDetails = { phone: '', summary: '', experience: '' };

function listOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return item.trim() ? [item.trim()] : [];
    if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
      return item.name.trim() ? [item.name.trim()] : [];
    }
    return [];
  });
}

export function CvBuilder() {
  const [profile, setProfile] = useState<LearnerProfile>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState<CvDetails>(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = getSupabase();
        const [authResult, profileResult, cvResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('learner_profiles').select('*').maybeSingle(),
          supabase.from('learner_cv_details').select('phone,summary,experience').maybeSingle(),
        ]);
        if (authResult.error) throw authResult.error;
        if (!authResult.data.user) throw new Error('Sign in again to use your CV builder.');
        if (profileResult.error) throw profileResult.error;
        if (cvResult.error) throw cvResult.error;
        const loadedProfile = (profileResult.data || {}) as LearnerProfile;
        if (!active) return;
        setProfile(loadedProfile);
        setName(loadedProfile.display_name?.trim() || authResult.data.user.user_metadata?.name || authResult.data.user.email?.split('@')[0] || '');
        setEmail(authResult.data.user.email || '');
        setDetails({
          ...emptyDetails,
          ...(cvResult.data || {}),
          summary: cvResult.data?.summary || loadedProfile.about_me || loadedProfile.personal_goal || '',
        });
        setError('');
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Your CV could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to save your CV.');
      const { error: saveError } = await supabase.from('learner_cv_details').upsert({
        user_id: authData.user.id,
        ...details,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (saveError) throw saveError;
      setMessage('Your CV details have been saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your CV could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-8 text-sm text-slate-600" role="status">Loading your profile and CV...</p>;

  const skills = [...new Set([...listOfStrings(profile.skills), ...listOfStrings(profile.skill_ratings)])];
  const certifications = listOfStrings(profile.certifications);
  const languages = listOfStrings(profile.languages);
  const education = [
    profile.highest_qualification,
    profile.field_of_study,
    profile.qualification_status === 'completed' ? 'Completed' : profile.qualification_status === 'in_progress' ? 'In progress' : '',
    profile.qualification_year ? String(profile.qualification_year) : '',
  ].filter(Boolean);
  const location = [profile.city, profile.province].filter(Boolean).join(', ');

  return (
    <section>
      <div className="mb-5 rounded-xl border border-slate-200 bg-sunshine-light/60 p-4">
        <p className="text-sm leading-6 text-slate-700">Your name, email, education, skills, languages, and location come from your account and learner profile. Update those details in <Link href="/app/profile" className="link">Your profile</Link>; add your phone number and work experience here.</p>
      </div>
      {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}
      {message && <p className="mb-4 text-sm text-emerald-dark" role="status">{message}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold text-midnight">Add CV details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="cv-phone" className="label">Phone number <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="cv-phone" type="tel" autoComplete="tel" maxLength={40} className="input" value={details.phone} onChange={(event) => setDetails((current) => ({ ...current, phone: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="cv-summary" className="label">Professional summary</label>
              <textarea id="cv-summary" rows={5} maxLength={1500} className="input resize-y" placeholder="A short introduction about your strengths, experience, and goals." value={details.summary} onChange={(event) => setDetails((current) => ({ ...current, summary: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="cv-experience" className="label">Work or volunteer experience</label>
              <textarea id="cv-experience" rows={8} maxLength={5000} className="input resize-y" placeholder={'Role — Organisation (dates)\nDescribe what you did and what you learned.'} value={details.experience} onChange={(event) => setDetails((current) => ({ ...current, experience: event.target.value }))} />
              <p className="mt-1 text-xs leading-5 text-slate-500">Include only experience you can verify. You can use one entry per paragraph.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={() => void save()} disabled={saving}>
              <Save size={16} aria-hidden="true" />{saving ? 'Saving...' : 'Save CV'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => window.print()}>
              <Printer size={16} aria-hidden="true" />Print / save as PDF
            </button>
          </div>
        </div>

        <article id="cv-print" className="min-h-[40rem] rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-9" aria-label="CV preview">
          <header className="border-b-2 border-sunshine pb-5">
            <h2 className="text-3xl font-bold text-black">{name || 'Your name'}</h2>
            {profile.target_role && <p className="mt-1 text-lg font-medium text-slate-700">{profile.target_role}</p>}
            <p className="mt-2 text-sm text-slate-600">{[email, details.phone, location].filter(Boolean).join(' · ') || 'Add contact details in your profile.'}</p>
          </header>
          {details.summary.trim() && <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-black">Profile</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{details.summary}</p>
          </section>}
          {education.length > 0 && <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-black">Education</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{education.join(' · ')}</p>
          </section>}
          {details.experience.trim() && <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-black">Experience</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{details.experience}</p>
          </section>}
          {skills.length > 0 && <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-black">Skills</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{skills.join(' · ')}</p>
          </section>}
          {certifications.length > 0 && <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-black">Certificates</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{certifications.join(' · ')}</p>
          </section>}
          {languages.length > 0 && <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-black">Languages</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{languages.join(' · ')}</p>
          </section>}
          {skills.length === 0 && !details.experience.trim() && education.length === 0 && <p className="mt-8 text-sm leading-6 text-slate-500">Your profile details will appear here as you add them.</p>}
        </article>
      </div>
    </section>
  );
}
