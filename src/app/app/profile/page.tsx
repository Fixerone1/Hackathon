'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { profileNextStep, profileStrength, qualificationNqfLevels } from '@/lib/profile';
import { southAfricanProvinces } from '@/lib/opportunities';

type SubjectResult = { name: string; mark: number | null };
type SkillRating = { name: string; level: number; source: 'self_reported'; evidence_note: string };
type ExperienceEntry = { area: string; months: number };
type PlannedOpportunity = {
  opportunity_id: string;
  status: 'saved' | 'applied';
  scheduled_apply_date: string | null;
  opportunities: { id: string; title: string; organization: string; source_url: string; closing_date: string | null };
};

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(value: string): Date {
  return new Date(`${value}T12:00:00`);
}
type ProfileDraft = {
  display_name: string;
  pronouns: string;
  about_me: string;
  personal_goal: string;
  interests_text: string;
  highest_qualification: string;
  qualification_status: string;
  field_of_study: string;
  qualification_year: string;
  subjects_text: string;
  skills_text: string;
  experience_by_area_text: string;
  province: string;
  city: string;
  target_role: string;
  target_income_monthly: string;
  target_income_monthly_max: string;
  hours_available_per_week: string;
  employment_status: string;
  languages_text: string;
  drivers_license: string;
  willing_to_relocate: string;
  remote_ok: string;
  own_transport: string;
  computer_or_data_access: string;
  work_authorization: string;
  availability_start_date: string;
  shift_preferences: string[];
  certifications_text: string;
};

type ProfileApiResponse = {
  profile: Record<string, unknown> & {
    subjects?: SubjectResult[];
    skills?: string[];
    skill_ratings?: SkillRating[];
    experience_by_area?: ExperienceEntry[];
    languages?: string[];
    shift_preferences?: string[];
    certifications?: string[];
  };
  nqf_level: number | null;
  strength: number;
  next_step: string;
};

const emptyProfile: ProfileDraft = {
  display_name: '', pronouns: '', about_me: '', personal_goal: '', interests_text: '',
  highest_qualification: '', qualification_status: '', field_of_study: '', qualification_year: '',
  subjects_text: '', skills_text: '', experience_by_area_text: '', province: '', city: '', target_role: '',
  target_income_monthly: '', target_income_monthly_max: '', hours_available_per_week: '', employment_status: '',
  languages_text: '', drivers_license: '', willing_to_relocate: '', remote_ok: '', own_transport: '',
  computer_or_data_access: '', work_authorization: '', availability_start_date: '',
  shift_preferences: [], certifications_text: '',
};

const qualificationOptions = [
  'Below Grade 9', 'Grade 9', 'Grade 10', 'Grade 11', 'Matric', 'N6 certificate',
  'Diploma', "Bachelor's degree", 'Honours degree', "Master's degree", 'Doctorate',
];
function toDraft(profile: ProfileApiResponse['profile']): ProfileDraft {
  return {
    ...emptyProfile,
    ...profile,
    interests_text: Array.isArray(profile.interests) ? profile.interests.filter((item): item is string => typeof item === 'string').join(', ') : '',
    shift_preferences: profile.shift_preferences || [],
    certifications_text: (profile.certifications || []).join('\n'),
    qualification_year: profile.qualification_year ? String(profile.qualification_year) : '',
    subjects_text: (profile.subjects || []).map((subject) => subject.mark === null ? subject.name : `${subject.name}: ${subject.mark}`).join('\n'),
    skills_text: profile.skill_ratings?.length
      ? profile.skill_ratings.map((skill) => `${skill.name}: ${skill.level}${skill.evidence_note ? ` | ${skill.evidence_note}` : ''}`).join('\n')
      : (profile.skills || []).join('\n'),
    experience_by_area_text: (profile.experience_by_area || []).map((entry) => `${entry.area}: ${entry.months}`).join('\n'),
    languages_text: (profile.languages || []).join(', '),
    target_income_monthly: profile.target_income_monthly ? String(profile.target_income_monthly) : '',
    target_income_monthly_max: profile.target_income_monthly_max ? String(profile.target_income_monthly_max) : '',
    hours_available_per_week: profile.hours_available_per_week ? String(profile.hours_available_per_week) : '',
    drivers_license: profile.drivers_license === null ? '' : String(profile.drivers_license),
    willing_to_relocate: profile.willing_to_relocate === null ? '' : String(profile.willing_to_relocate),
    remote_ok: profile.remote_ok === null ? '' : String(profile.remote_ok),
    own_transport: profile.own_transport === null ? '' : String(profile.own_transport),
    computer_or_data_access: profile.computer_or_data_access === null ? '' : String(profile.computer_or_data_access),
  } as ProfileDraft;
}

function parseSubjects(value: string): SubjectResult[] {
  return value.split(/[\n,]/).map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const match = entry.match(/^(.*?)(?:\s*:\s*(\d{1,3}))?$/);
    return { name: match?.[1]?.trim() || entry, mark: match?.[2] ? Number(match[2]) : null };
  }).filter((subject) => subject.name.length > 0 && (subject.mark === null || subject.mark <= 100));
}

function parseSkillRatings(value: string): SkillRating[] {
  return value.split('\n').map((entry) => entry.trim()).filter(Boolean).flatMap((entry) => {
    const match = entry.match(/^(.+?):\s*([1-5])(?:\s*\|\s*(.{0,240}))?$/);
    return match ? [{ name: match[1].trim(), level: Number(match[2]), source: 'self_reported' as const, evidence_note: match[3]?.trim() || '' }] : [];
  });
}

function parseExperience(value: string): ExperienceEntry[] {
  return value.split('\n').map((entry) => entry.trim()).filter(Boolean).flatMap((entry) => {
    const match = entry.match(/^(.+?):\s*(\d{1,3})$/);
    return match ? [{ area: match[1].trim(), months: Number(match[2]) }] : [];
  }).filter((entry) => entry.months <= 600);
}

function optionalBoolean(value: string): boolean | null {
  return value === '' ? null : value === 'true';
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const [step, setStep] = useState(0);
  const [strength, setStrength] = useState(0);
  const [nextStep, setNextStep] = useState('Start with your qualification to build your profile.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [plannedOpportunities, setPlannedOpportunities] = useState<PlannedOpportunity[]>([]);
  const [plannerDates, setPlannerDates] = useState<Record<string, string>>({});
  const [plannerBusyId, setPlannerBusyId] = useState('');
  const [plannerError, setPlannerError] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(() => localDateKey(new Date()));

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const supabase = getSupabase();
        const [{ data, error }, plannerResult] = await Promise.all([
          supabase.from('learner_profiles').select('*').maybeSingle(),
          supabase.from('learner_opportunity_actions').select('opportunity_id,status,scheduled_apply_date,opportunities!inner(id,title,organization,source_url,closing_date)'),
        ]);
        if (error) throw error;
        const savedProfile = (data || {}) as ProfileApiResponse['profile'];
        if (!active) return;
        setProfile(toDraft(savedProfile));
        setStrength(profileStrength(savedProfile));
        setNextStep(profileNextStep(savedProfile));
        if (plannerResult.error) {
          setPlannerError(plannerResult.error.message);
        } else {
          const savedActions = (plannerResult.data || []) as unknown as PlannedOpportunity[];
          setPlannedOpportunities(savedActions);
          setPlannerDates(Object.fromEntries(savedActions.map((action) => [action.opportunity_id, action.scheduled_apply_date || ''])));
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Profile could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  function update<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile() {
    setSaving(true);
    setError('');
    setMessage('');
    const payload = {
      display_name: profile.display_name.trim(),
      pronouns: profile.pronouns.trim(),
      about_me: profile.about_me.trim(),
      personal_goal: profile.personal_goal.trim(),
      interests: profile.interests_text.split(/[,\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 20),
      highest_qualification: profile.highest_qualification,
      qualification_status: profile.qualification_status,
      field_of_study: profile.field_of_study,
      qualification_year: profile.qualification_year ? Number(profile.qualification_year) : null,
      subjects: parseSubjects(profile.subjects_text),
      skills: parseSkillRatings(profile.skills_text).map((skill) => skill.name),
      skill_ratings: parseSkillRatings(profile.skills_text),
      experience_by_area: parseExperience(profile.experience_by_area_text),
      experience_months: parseExperience(profile.experience_by_area_text).reduce((total, entry) => total + entry.months, 0),
      province: profile.province,
      city: profile.city,
      target_role: profile.target_role,
      target_income_monthly: profile.target_income_monthly ? Number(profile.target_income_monthly) : null,
      target_income_monthly_max: profile.target_income_monthly_max ? Number(profile.target_income_monthly_max) : null,
      hours_available_per_week: profile.hours_available_per_week ? Number(profile.hours_available_per_week) : null,
      employment_status: profile.employment_status,
      languages: profile.languages_text.split(',').map((item) => item.trim()).filter(Boolean),
      drivers_license: optionalBoolean(profile.drivers_license),
      willing_to_relocate: optionalBoolean(profile.willing_to_relocate),
      remote_ok: optionalBoolean(profile.remote_ok),
      own_transport: optionalBoolean(profile.own_transport),
      computer_or_data_access: optionalBoolean(profile.computer_or_data_access),
      work_authorization: profile.work_authorization,
      availability_start_date: profile.availability_start_date || null,
      shift_preferences: profile.shift_preferences,
      certifications: profile.certifications_text.split('\n').map((item) => item.trim()).filter(Boolean),
    };

    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to save your profile.');
      const profileData = {
        user_id: authData.user.id,
        ...payload,
        nqf_level: qualificationNqfLevels[profile.highest_qualification] ?? null,
      };
      const { error: saveError } = await supabase.from('learner_profiles').upsert(profileData, { onConflict: 'user_id' });
      if (saveError) throw saveError;
      const savedProfile = payload as ProfileApiResponse['profile'];
      setProfile(toDraft(savedProfile));
      setStrength(profileStrength(savedProfile));
      setNextStep(profileNextStep(savedProfile));
      setMessage('Profile saved. You can update it at any time.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function savePlannerDate(opportunityId: string) {
    setPlannerBusyId(opportunityId);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to update your application planner.');
      const { error: saveError } = await supabase.from('learner_opportunity_actions').update({
        scheduled_apply_date: plannerDates[opportunityId] || null,
      }).eq('user_id', authData.user.id).eq('opportunity_id', opportunityId);
      if (saveError) throw saveError;
      setPlannedOpportunities((current) => current.map((item) => item.opportunity_id === opportunityId
        ? { ...item, scheduled_apply_date: plannerDates[opportunityId] || null }
        : item));
      setMessage('Your application reminder was saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your application reminder could not be saved.');
    } finally {
      setPlannerBusyId('');
    }
  }

  const todayKey = localDateKey(new Date());
  const savedPlans = plannedOpportunities.filter((item) => item.status === 'saved');
  const overduePlans = savedPlans.filter((item) => item.scheduled_apply_date && item.scheduled_apply_date < todayKey);
  const dueTodayPlans = savedPlans.filter((item) => item.scheduled_apply_date === todayKey);
  const upcomingPlans = savedPlans.filter((item) => item.scheduled_apply_date && item.scheduled_apply_date > todayKey);
  const calendarEvents = plannedOpportunities.flatMap((item) => {
    const events: Array<{ id: string; date: string; title: string; kind: 'return' | 'closing' }> = [];
    if (item.status === 'saved' && item.scheduled_apply_date) {
      events.push({ id: `${item.opportunity_id}-return`, date: item.scheduled_apply_date, title: item.opportunities.title, kind: 'return' });
    }
    if (item.status === 'saved' && item.opportunities.closing_date) {
      events.push({ id: `${item.opportunity_id}-closing`, date: item.opportunities.closing_date, title: item.opportunities.title, kind: 'closing' });
    }
    return events;
  });
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const monthOffset = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const selectedDayEvents = calendarEvents.filter((event) => event.date === selectedCalendarDay);

  const inputClass = 'input';
  const selectClass = 'input';
  const title = ['About you & learning', 'Goals', 'Experience & location'][step];

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 sm:px-6 lg:px-8" role="status">Loading your profile...</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <header className="mb-7 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-sunshine p-5 shadow-card sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="eyebrow">Your information</p>
          <h1 className="page-title mt-2">Build your learner profile</h1>
          <p className="page-description text-black/75">Start with three essentials. Add more when you are ready. We do not ask for an ID number, bank details, or photos.</p>
        </div>
        <div className="w-full rounded-xl bg-sunshine-light p-3 sm:w-48 sm:shrink-0">
          <div className="mb-2 flex justify-between text-xs font-medium text-slate-600"><span>Profile strength</span><span>{strength}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength}>
            <div className="h-full bg-sunshine-dark transition-[width]" style={{ width: `${strength}%` }} />
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,0.85fr)] xl:gap-8">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-surface p-4 shadow-card sm:p-6" aria-labelledby="step-heading">
          <ol className="mb-7 grid grid-cols-3 border-b border-slate-200" aria-label="Profile setup steps">
            {['About you', 'Goals', 'Experience'].map((label, index) => (
              <li key={label}>
                <button type="button" onClick={() => setStep(index)} aria-current={step === index ? 'step' : undefined}
                  className={`w-full border-b-2 px-1 pb-3 text-left text-xs font-semibold sm:px-2 sm:text-sm ${step === index ? 'border-sunshine-dark text-midnight' : 'border-transparent text-slate-500'}`}>
                  <span className="mr-1 text-emerald-dark sm:mr-2">0{index + 1}</span>{label}
                </button>
              </li>
            ))}
          </ol>

          <h2 id="step-heading" className="mb-5 text-xl font-semibold text-midnight">{title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {step === 0 && <>
              <div className="sm:col-span-2 rounded-2xl border border-sunshine bg-sunshine-light/50 p-4 sm:p-5">
                <h3 className="font-bold text-midnight">Make this profile yours</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Share only what feels useful. These details are optional, private to your account, and can be changed or cleared whenever you want.</p>
              </div>
              <div>
                <label htmlFor="display-name" className="label">What should we call you? <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="display-name" className={inputClass} maxLength={80} autoComplete="nickname" placeholder="Your preferred name" value={profile.display_name} onChange={(event) => update('display_name', event.target.value)} />
              </div>
              <div>
                <label htmlFor="pronouns" className="label">Pronouns <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="pronouns" className={inputClass} maxLength={50} placeholder="For example, she/her" value={profile.pronouns} onChange={(event) => update('pronouns', event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="about-me" className="label">A little about you <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="about-me" rows={3} maxLength={600} className={inputClass} placeholder="What would you like people supporting your journey to know about you?" value={profile.about_me} onChange={(event) => update('about_me', event.target.value)} />
              </div>
              <div>
                <label htmlFor="qualification" className="label">Highest qualification</label>
                <select id="qualification" className={selectClass} value={profile.highest_qualification} onChange={(event) => update('highest_qualification', event.target.value)}>
                  <option value="">Choose a qualification</option>
                  {qualificationOptions.map((qualification) => <option key={qualification}>{qualification}</option>)}
                </select>
                {profile.highest_qualification && <p className="mt-1 text-xs text-slate-500">South African NQF level: {profile.highest_qualification === 'Below Grade 9' || profile.highest_qualification === 'Grade 9' ? 1 : profile.highest_qualification === 'Grade 10' ? 2 : profile.highest_qualification === 'Grade 11' ? 3 : profile.highest_qualification === 'Matric' ? 4 : profile.highest_qualification === 'N6 certificate' ? 5 : profile.highest_qualification === 'Diploma' ? 6 : profile.highest_qualification === "Bachelor's degree" ? 7 : profile.highest_qualification === 'Honours degree' ? 8 : profile.highest_qualification === "Master's degree" ? 9 : 10}</p>}
              </div>
              <div>
                <label htmlFor="qualification-status" className="label">Status</label>
                <select id="qualification-status" className={selectClass} value={profile.qualification_status} onChange={(event) => update('qualification_status', event.target.value)}>
                  <option value="">Choose status</option><option value="in_progress">In progress</option><option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="field-of-study" className="label">Field of study <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="field-of-study" className={inputClass} maxLength={120} value={profile.field_of_study} onChange={(event) => update('field_of_study', event.target.value)} />
              </div>
              <div>
                <label htmlFor="qualification-year" className="label">Year completed or expected <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="qualification-year" type="number" min="1950" max="2100" className={inputClass} value={profile.qualification_year} onChange={(event) => update('qualification_year', event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="subjects" className="label">Subjects and marks <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="subjects" rows={3} className={inputClass} placeholder={'Mathematics: 72\nEnglish: 65\nMathematical Literacy: 80'} value={profile.subjects_text} onChange={(event) => update('subjects_text', event.target.value)} />
                <p className="mt-1 text-xs text-slate-500">One per line. Use “Subject: mark” when known.</p>
              </div>
            </>}

            {step === 1 && <>
              <div className="sm:col-span-2">
                <label htmlFor="personal-goal" className="label">What matters most to you right now? <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="personal-goal" rows={3} maxLength={600} className={inputClass} placeholder="For example, get into college, support my family, or test a side-business idea" value={profile.personal_goal} onChange={(event) => update('personal_goal', event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="interests" className="label">Interests and strengths <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="interests" rows={2} maxLength={500} className={inputClass} placeholder="For example, music, coding, helping people, sport, design" value={profile.interests_text} onChange={(event) => update('interests_text', event.target.value)} />
                <p className="mt-1 text-xs text-slate-500">Separate interests with commas. This is for your personal profile and won’t change eligibility decisions.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="target-role" className="label">What kind of role or field interests you?</label>
                <input id="target-role" className={inputClass} maxLength={120} placeholder="For example, IT support" value={profile.target_role} onChange={(event) => update('target_role', event.target.value)} />
              </div>
              <div>
                <label htmlFor="employment-status" className="label">Current situation</label>
                <select id="employment-status" className={selectClass} value={profile.employment_status} onChange={(event) => update('employment_status', event.target.value)}>
                  <option value="">Choose one</option><option value="unemployed">Looking for work</option><option value="student">Studying</option><option value="employed_looking">Working and looking</option><option value="self_employed">Self-employed</option>
                </select>
              </div>
              <div>
                <label htmlFor="hours" className="label">Hours available per week <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="hours" type="number" min="0" max="168" className={inputClass} value={profile.hours_available_per_week} onChange={(event) => update('hours_available_per_week', event.target.value)} />
              </div>
              <div>
                <label htmlFor="target-income" className="label">Minimum target monthly income (R) <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="target-income" type="number" min="0" className={inputClass} value={profile.target_income_monthly} onChange={(event) => update('target_income_monthly', event.target.value)} />
              </div>
              <div>
                <label htmlFor="target-income-max" className="label">Maximum target monthly income (R) <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="target-income-max" type="number" min="0" className={inputClass} value={profile.target_income_monthly_max} onChange={(event) => update('target_income_monthly_max', event.target.value)} />
                <p className="mt-1 text-xs leading-5 text-slate-500">Leave either amount blank if you do not want to share a range.</p>
              </div>
              <div>
                <label htmlFor="work-authorization" className="label">Right to work in South Africa <span className="font-normal text-slate-500">(optional)</span></label>
                <select id="work-authorization" className={selectClass} value={profile.work_authorization} onChange={(event) => update('work_authorization', event.target.value)}>
                  <option value="">Choose (optional)</option>
                  <option value="citizen">South African citizen</option>
                  <option value="permanent_resident">Permanent resident</option>
                  <option value="work_visa">I have a work visa</option>
                  <option value="unsure">I’m not sure</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <p className="mt-1 text-xs leading-5 text-slate-500">This is only for your application pack. Check the listing’s exact requirements.</p>
              </div>
              <div>
                <label htmlFor="availability-date" className="label">When could you start? <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="availability-date" type="date" className={inputClass} value={profile.availability_start_date} onChange={(event) => update('availability_start_date', event.target.value)} />
              </div>
              <fieldset className="sm:col-span-2">
                <legend className="label">Preferred shifts <span className="font-normal text-slate-500">(optional)</span></legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    ['day', 'Daytime'],
                    ['evening', 'Evenings'],
                    ['night', 'Night shifts'],
                    ['weekend', 'Weekends'],
                    ['flexible', 'Flexible'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-sunshine-dark"
                        checked={profile.shift_preferences.includes(value)}
                        onChange={(event) => update('shift_preferences', event.target.checked
                          ? [...profile.shift_preferences, value]
                          : profile.shift_preferences.filter((item) => item !== value))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>}

            {step === 2 && <>
              <div>
                <label htmlFor="province" className="label">Province</label>
                <select id="province" className={selectClass} value={profile.province} onChange={(event) => update('province', event.target.value)}>
                  <option value="">Choose a province</option>{southAfricanProvinces.map((province) => <option key={province}>{province}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="label">City or town <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="city" className={inputClass} maxLength={100} value={profile.city} onChange={(event) => update('city', event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="skills" className="label">Skills and self-rating <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="skills" rows={3} className={inputClass} placeholder={'Customer service: 3 | Helped at a community event\nSpreadsheet basics: 2'} value={profile.skills_text} onChange={(event) => update('skills_text', event.target.value)} />
                <p className="mt-1 text-xs text-slate-500">Rate each skill from 1 (learning) to 5 (confident). You may add a short example. These are self-reported.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="experience" className="label">Experience by area <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="experience" rows={3} className={inputClass} placeholder={'Customer service: 4\nRetail: 6'} value={profile.experience_by_area_text} onChange={(event) => update('experience_by_area_text', event.target.value)} />
                <p className="mt-1 text-xs text-slate-500">One area per line, followed by approximate months.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="certifications" className="label">Certificates and training <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="certifications" rows={3} className={inputClass} maxLength={1000} placeholder={'First aid certificate\nBasic computer skills course'} value={profile.certifications_text} onChange={(event) => update('certifications_text', event.target.value)} />
                <p className="mt-1 text-xs text-slate-500">Add one certificate or course per line. Do not enter document numbers.</p>
              </div>
              <div>
                <label htmlFor="languages" className="label">Languages and proficiency <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="languages" className={inputClass} placeholder="For example, English (fluent), isiZulu (conversational)" value={profile.languages_text} onChange={(event) => update('languages_text', event.target.value)} />
              </div>
              {([
                ['drivers_license', 'Do you have a driver’s licence?'],
                ['own_transport', 'Do you have access to transport?'],
                ['computer_or_data_access', 'Do you have regular computer or data access?'],
                ['willing_to_relocate', 'Would you consider relocating?'],
                ['remote_ok', 'Are you open to remote work?'],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label htmlFor={key} className="label">{label}</label>
                  <select id={key} className={selectClass} value={profile[key]} onChange={(event) => update(key, event.target.value)}>
                    <option value="">Not specified</option><option value="true">Yes</option><option value="false">No</option>
                  </select>
                </div>
              ))}
            </>}
          </div>

          {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="mt-5 text-sm text-emerald-dark" role="status">{message}</p>}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button>
            <div className="flex flex-col gap-2 sm:flex-row">
              {step < 2 ? <button type="button" className="btn-primary" onClick={() => setStep((current) => Math.min(2, current + 1))}>Continue</button> : null}
              <button type="button" className="btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
            </div>
          </div>
        </section>

        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card sm:p-6">
          <h2 className="font-semibold text-midnight">What your profile improves</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">As verified opportunities are connected, these details can help check stated requirements more accurately.</p>
          <p className="mt-5 border-l-2 border-sunshine-dark pl-3 text-sm leading-6 text-slate-700">{nextStep}</p>
          <Link href="/app/employment/opportunities" className="link mt-5 inline-flex text-sm">See verified opportunities</Link>
          <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Never store an ID/passport number here. Keep required documents ready to upload directly to an employer. Add references only when a specific application asks; do not store another person’s contact details here.</p>
        </aside>
      </div>

      <section className="mt-8 border-t border-slate-200 pt-7" aria-labelledby="application-planner-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Your next steps</p>
            <h2 id="application-planner-heading" className="mt-2 text-2xl font-semibold text-midnight">Application planner</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">See your return dates, closing dates, and what needs attention. Nothing is hidden when a date passes.</p>
          </div>
          <Link href="/app/employment/applications" className="link text-sm">View all saved applications</Link>
        </div>
        {plannerError ? (
          <p className="mt-4 border-y border-amber-300 py-4 text-sm leading-6 text-amber-900" role="alert">Your planner could not be loaded: {plannerError} Apply the latest Supabase migrations, then reload this page.</p>
        ) : plannedOpportunities.length === 0 ? (
          <div className="mt-4 border-y border-slate-200 py-5">
            <p className="font-medium text-midnight">Nothing in your planner yet</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Save an opportunity from your matches, then choose a date to return and apply.</p>
            <Link href="/app/employment/opportunities" className="link mt-3 inline-flex text-sm">Browse opportunities</Link>
          </div>
        ) : (
          <>
            <dl className="mt-5 grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">
              {[
                ['Overdue', overduePlans.length, 'text-red-800'],
                ['Due today', dueTodayPlans.length, 'text-amber-800'],
                ['Coming up', upcomingPlans.length, 'text-midnight'],
                ['Applied', plannedOpportunities.filter((item) => item.status === 'applied').length, 'text-emerald-800'],
              ].map(([label, count, color]) => (
                <div key={label} className="border-b border-r border-slate-200 px-3 py-3 last:border-r-0 sm:border-b-0">
                  <dt className="text-xs text-slate-500">{label}</dt><dd className={`mt-1 text-lg font-semibold ${color}`}>{count}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
              <section className="min-w-0" aria-label="Application calendar">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-semibold text-midnight"><CalendarDays size={17} aria-hidden="true" />{new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric' }).format(calendarMonth)}</h3>
                  <div className="flex gap-1">
                    <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Previous month" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={17} aria-hidden="true" /></button>
                    <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Next month" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={17} aria-hidden="true" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 border-l border-t border-slate-200" role="grid" aria-label="Application dates">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="border-b border-r border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-semibold text-slate-500 sm:text-xs" role="columnheader">{day}</div>)}
                  {Array.from({ length: monthOffset }, (_, index) => <div key={`blank-${index}`} className="min-h-12 border-b border-r border-slate-200 bg-slate-50/50 sm:min-h-16" aria-hidden="true" />)}
                  {Array.from({ length: daysInMonth }, (_, index) => {
                    const date = localDateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index + 1));
                    const events = calendarEvents.filter((event) => event.date === date);
                    const selected = selectedCalendarDay === date;
                    return (
                      <button key={date} type="button" role="gridcell" aria-pressed={selected} aria-label={`${new Intl.DateTimeFormat('en-ZA', { dateStyle: 'full' }).format(dateFromKey(date))}${events.length ? `, ${events.length} planned items` : ''}`} onClick={() => setSelectedCalendarDay(date)}
                        className={`min-h-12 border-b border-r border-slate-200 p-1 text-left transition-colors sm:min-h-16 sm:p-2 ${selected ? 'bg-sunshine-light' : 'bg-white hover:bg-slate-50'}`}>
                        <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${date === todayKey ? 'bg-black font-bold text-white' : 'text-slate-700'}`}>{index + 1}</span>
                        {events.length > 0 && <span className="mt-1 block truncate text-[9px] font-semibold text-emerald-800 sm:text-[10px]">{events.length} item{events.length === 1 ? '' : 's'}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-600"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sunshine-dark" />Return date</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-700" />Closing date</span></div>
              </section>

              <section className="min-w-0 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0" aria-live="polite">
                <h3 className="font-semibold text-midnight">{new Intl.DateTimeFormat('en-ZA', { dateStyle: 'full' }).format(dateFromKey(selectedCalendarDay))}</h3>
                {selectedDayEvents.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">No saved return or closing dates on this day.</p> : (
                  <ul className="mt-2 divide-y divide-slate-200">
                    {selectedDayEvents.map((event) => <li key={event.id} className="py-3"><p className="text-[11px] font-semibold uppercase text-slate-500">{event.kind === 'return' ? 'Come back to apply' : 'Advert closes'}</p><p className="mt-1 text-sm font-medium text-midnight">{event.title}</p></li>)}
                  </ul>
                )}
              </section>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-midnight">Your saved opportunities</h3>
              <ul className="divide-y divide-slate-200 border-y border-slate-200">
                {plannedOpportunities.map((item) => {
                  const overdue = item.status === 'saved' && Boolean(item.scheduled_apply_date && item.scheduled_apply_date < todayKey);
                  const dueToday = item.status === 'saved' && item.scheduled_apply_date === todayKey;
                  const statusLabel = item.status === 'applied' ? 'Applied' : overdue ? 'Overdue' : dueToday ? 'Due today' : item.scheduled_apply_date ? 'Upcoming' : 'No return date';
                  const statusStyle = item.status === 'applied' ? 'bg-emerald-50 text-emerald-800' : overdue ? 'bg-red-50 text-red-800' : dueToday ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700';
                  return (
                    <li key={item.opportunity_id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-midnight">{item.opportunities.title}</h4><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle}`}>{statusLabel}</span></div>
                        <p className="mt-1 text-sm text-slate-600">{item.opportunities.organization}{item.scheduled_apply_date ? ` · Return ${new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${item.scheduled_apply_date}T00:00:00Z`))}` : ''}{item.opportunities.closing_date ? ` · Closes ${new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${item.opportunities.closing_date}T00:00:00Z`))}` : ''}</p>
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        {item.status === 'saved' && <>
                          <label className="text-xs font-medium text-slate-600" htmlFor={`planner-date-${item.opportunity_id}`}>
                            <span className="mb-1 block">Come back on</span>
                            <input id={`planner-date-${item.opportunity_id}`} type="date" className="input min-h-10" value={plannerDates[item.opportunity_id] || ''} onChange={(event) => setPlannerDates((current) => ({ ...current, [item.opportunity_id]: event.target.value }))} />
                          </label>
                          <button type="button" className="btn-secondary min-h-10" disabled={plannerBusyId === item.opportunity_id} onClick={() => void savePlannerDate(item.opportunity_id)}>{plannerBusyId === item.opportunity_id ? 'Saving...' : 'Save date'}</button>
                        </>}
                        <a href={item.opportunities.source_url} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-10" aria-label={`Open ${item.opportunities.title} application in a new tab`}><ExternalLink size={16} aria-hidden="true" /></a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
