'use client';

import { useEffect, useState } from 'react';

type SubjectResult = { name: string; mark: number | null };
type ProfileDraft = {
  highest_qualification: string;
  qualification_status: string;
  field_of_study: string;
  qualification_year: string;
  subjects_text: string;
  skills_text: string;
  experience_months: string;
  province: string;
  city: string;
  target_role: string;
  target_income_monthly: string;
  hours_available_per_week: string;
  employment_status: string;
  age_band: string;
  languages_text: string;
  drivers_license: string;
  willing_to_relocate: string;
  remote_ok: string;
  own_transport: string;
  computer_or_data_access: string;
};

type ProfileApiResponse = {
  profile: Record<string, unknown> & { subjects?: SubjectResult[]; skills?: string[]; languages?: string[] };
  nqf_level: number | null;
  strength: number;
  next_step: string;
};

const emptyProfile: ProfileDraft = {
  highest_qualification: '', qualification_status: '', field_of_study: '', qualification_year: '',
  subjects_text: '', skills_text: '', experience_months: '0', province: '', city: '', target_role: '',
  target_income_monthly: '', hours_available_per_week: '', employment_status: '', age_band: '',
  languages_text: '', drivers_license: '', willing_to_relocate: '', remote_ok: '', own_transport: '',
  computer_or_data_access: '',
};

const qualificationOptions = [
  'Below Grade 9', 'Grade 9', 'Grade 10', 'Grade 11', 'Matric', 'N6 certificate',
  'Diploma', "Bachelor's degree", 'Honours degree', "Master's degree", 'Doctorate',
];
const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga',
  'Northern Cape', 'North West', 'Western Cape',
];

function toDraft(profile: ProfileApiResponse['profile']): ProfileDraft {
  return {
    ...emptyProfile,
    ...profile,
    qualification_year: profile.qualification_year ? String(profile.qualification_year) : '',
    subjects_text: (profile.subjects || []).map((subject) => subject.mark === null ? subject.name : `${subject.name}: ${subject.mark}`).join('\n'),
    skills_text: (profile.skills || []).join(', '),
    languages_text: (profile.languages || []).join(', '),
    experience_months: String(profile.experience_months ?? 0),
    target_income_monthly: profile.target_income_monthly ? String(profile.target_income_monthly) : '',
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

  useEffect(() => {
    let active = true;
    fetch('/auth-api/profile', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Profile could not be loaded. Please sign in again.');
        return response.json() as Promise<ProfileApiResponse>;
      })
      .then((result) => {
        if (!active) return;
        setProfile(toDraft(result.profile));
        setStrength(result.strength);
        setNextStep(result.next_step);
      })
      .catch((caught: Error) => { if (active) setError(caught.message); })
      .finally(() => { if (active) setLoading(false); });
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
      highest_qualification: profile.highest_qualification,
      qualification_status: profile.qualification_status,
      field_of_study: profile.field_of_study,
      qualification_year: profile.qualification_year ? Number(profile.qualification_year) : null,
      subjects: parseSubjects(profile.subjects_text),
      skills: profile.skills_text.split(',').map((item) => item.trim()).filter(Boolean),
      experience_months: Number(profile.experience_months || 0),
      province: profile.province,
      city: profile.city,
      target_role: profile.target_role,
      target_income_monthly: profile.target_income_monthly ? Number(profile.target_income_monthly) : null,
      hours_available_per_week: profile.hours_available_per_week ? Number(profile.hours_available_per_week) : null,
      employment_status: profile.employment_status,
      age_band: profile.age_band,
      languages: profile.languages_text.split(',').map((item) => item.trim()).filter(Boolean),
      drivers_license: optionalBoolean(profile.drivers_license),
      willing_to_relocate: optionalBoolean(profile.willing_to_relocate),
      remote_ok: optionalBoolean(profile.remote_ok),
      own_transport: optionalBoolean(profile.own_transport),
      computer_or_data_access: optionalBoolean(profile.computer_or_data_access),
    };

    try {
      const response = await fetch('/auth-api/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as ProfileApiResponse & { detail?: string };
      if (!response.ok) throw new Error(result.detail || 'Profile could not be saved.');
      setProfile(toDraft(result.profile));
      setStrength(result.strength);
      setNextStep(result.next_step);
      setMessage('Profile saved. You can update it at any time.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'input';
  const selectClass = 'input';
  const title = ['Qualification', 'Goal', 'Location & details'][step];

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600" role="status">Loading your profile...</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-6">
        <div>
          <p className="eyebrow">Your information</p>
          <h1 className="mt-1 text-3xl font-semibold text-midnight">Build your learner profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Start with three essentials. Add more when you are ready. We do not ask for an ID number, bank details, or photos.</p>
        </div>
        <div className="min-w-40">
          <div className="mb-2 flex justify-between text-xs font-medium text-slate-600"><span>Profile strength</span><span>{strength}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength}>
            <div className="h-full bg-emerald transition-[width]" style={{ width: `${strength}%` }} />
          </div>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_16rem]">
        <section aria-labelledby="step-heading">
          <ol className="mb-7 grid grid-cols-3 border-b border-slate-200" aria-label="Profile setup steps">
            {['Qualification', 'Goal', 'Location'].map((label, index) => (
              <li key={label}>
                <button type="button" onClick={() => setStep(index)} aria-current={step === index ? 'step' : undefined}
                  className={`w-full border-b-2 px-2 pb-3 text-left text-xs font-semibold sm:text-sm ${step === index ? 'border-emerald text-midnight' : 'border-transparent text-slate-500'}`}>
                  <span className="mr-2 text-emerald-dark">0{index + 1}</span>{label}
                </button>
              </li>
            ))}
          </ol>

          <h2 id="step-heading" className="mb-5 text-xl font-semibold text-midnight">{title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {step === 0 && <>
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
                <label htmlFor="age-band" className="label">Age range <span className="font-normal text-slate-500">(optional)</span></label>
                <select id="age-band" className={selectClass} value={profile.age_band} onChange={(event) => update('age_band', event.target.value)}>
                  <option value="">Prefer not to say</option><option value="under_18">Under 18</option><option value="18_24">18–24</option><option value="25_34">25–34</option><option value="35_plus">35+</option>
                </select>
              </div>
              <div>
                <label htmlFor="hours" className="label">Hours available per week <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="hours" type="number" min="0" max="168" className={inputClass} value={profile.hours_available_per_week} onChange={(event) => update('hours_available_per_week', event.target.value)} />
              </div>
              <div>
                <label htmlFor="target-income" className="label">Target monthly income (R) <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="target-income" type="number" min="0" className={inputClass} value={profile.target_income_monthly} onChange={(event) => update('target_income_monthly', event.target.value)} />
              </div>
            </>}

            {step === 2 && <>
              <div>
                <label htmlFor="province" className="label">Province</label>
                <select id="province" className={selectClass} value={profile.province} onChange={(event) => update('province', event.target.value)}>
                  <option value="">Choose a province</option>{provinces.map((province) => <option key={province}>{province}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="label">City or town <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="city" className={inputClass} maxLength={100} value={profile.city} onChange={(event) => update('city', event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="skills" className="label">Skills <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="skills" className={inputClass} placeholder="For example, customer service, Excel" value={profile.skills_text} onChange={(event) => update('skills_text', event.target.value)} />
              </div>
              <div>
                <label htmlFor="experience" className="label">Relevant experience (months) <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="experience" type="number" min="0" max="600" className={inputClass} value={profile.experience_months} onChange={(event) => update('experience_months', event.target.value)} />
              </div>
              <div>
                <label htmlFor="languages" className="label">Languages <span className="font-normal text-slate-500">(optional)</span></label>
                <input id="languages" className={inputClass} placeholder="For example, English, isiZulu" value={profile.languages_text} onChange={(event) => update('languages_text', event.target.value)} />
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
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button type="button" className="btn-secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button>
            <div className="flex gap-2">
              {step < 2 ? <button type="button" className="btn-primary" onClick={() => setStep((current) => Math.min(2, current + 1))}>Continue</button> : null}
              <button type="button" className="btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
            </div>
          </div>
        </section>

        <aside className="border-t border-slate-200 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
          <h2 className="font-semibold text-midnight">What your profile improves</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">As verified opportunities are connected, these details can help check stated requirements more accurately.</p>
          <p className="mt-5 border-l-2 border-emerald pl-3 text-sm leading-6 text-slate-700">{nextStep}</p>
          <p className="mt-5 text-xs leading-5 text-slate-500">This demo has no verified opportunity listings yet. It will not show or invent matches.</p>
        </aside>
      </div>
    </div>
  );
}
