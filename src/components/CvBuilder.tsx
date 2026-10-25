'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Download, FileText, Printer, Sparkles } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import {
  buildCvOutput,
  cvReadinessLine,
  cvDocx,
  cvPlainText,
  cvSections,
  emptyCvData,
  keywordMatch,
  prefillCvData,
  type CvData,
  type CvSection,
  type CvProfileSeed,
} from '@/lib/cv-builder';
import { southAfricanProvinces } from '@/lib/opportunities';

type FieldName = keyof CvData;

type FieldProps = {
  data: CvData;
  name: FieldName;
  label: string;
  hint?: string;
  placeholder?: string;
  optional?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'tel' | 'email' | 'url' | 'number' | 'date';
  maxLength?: number;
  setData: (name: FieldName, value: string) => void;
};

function Field({
  data, name, label, hint, placeholder, optional, multiline, rows = 3, type = 'text', maxLength, setData,
}: FieldProps) {
  const id = `cv-${name}`;
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={id} className="label">
          {label} {optional && <span className="font-normal text-slate-500">(optional)</span>}
        </label>
        {optional && <button type="button" className="shrink-0 text-xs font-semibold text-slate-500 underline underline-offset-2" onClick={() => setData(name, '')}>Skip for now</button>}
      </div>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          maxLength={maxLength}
          className="input resize-y"
          placeholder={placeholder}
          value={data[name]}
          onChange={(event) => setData(name, event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          maxLength={maxLength}
          className="input"
          placeholder={placeholder}
          value={data[name]}
          onChange={(event) => setData(name, event.target.value)}
        />
      )}
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

type ChoiceProps = {
  data: CvData;
  name: FieldName;
  label: string;
  options: string[];
  optional?: boolean;
  hint?: string;
  setData: (name: FieldName, value: string) => void;
};

function Choice({ data, name, label, options, optional, hint, setData }: ChoiceProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={`cv-${name}`} className="label">
          {label} {optional && <span className="font-normal text-slate-500">(optional)</span>}
        </label>
        {optional && <button type="button" className="shrink-0 text-xs font-semibold text-slate-500 underline underline-offset-2" onClick={() => setData(name, '')}>Skip for now</button>}
      </div>
      <select id={`cv-${name}`} className="input" value={data[name]} onChange={(event) => setData(name, event.target.value)}>
        <option value="">Choose {optional ? 'if relevant' : 'one'}</option>
        {data[name] && !options.includes(data[name]) && <option value={data[name]}>{data[name]}</option>}
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

type CheckboxSetProps = {
  data: CvData;
  name: FieldName;
  label: string;
  options: string[];
  hint?: string;
  setData: (name: FieldName, value: string) => void;
};

function CheckboxSet({ data, name, label, options, hint, setData }: CheckboxSetProps) {
  const selected = data[name].split('\n').filter(Boolean);
  return (
    <fieldset>
      <legend className="label">
        {label} <span className="font-normal text-slate-500">(optional)</span>
        <button type="button" className="ml-2 text-xs font-semibold text-slate-500 underline underline-offset-2" onClick={() => setData(name, '')}>Skip for now</button>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-sunshine-dark"
              checked={selected.includes(option)}
              onChange={(event) => setData(name, (event.target.checked
                ? [...selected, option]
                : selected.filter((item) => item !== option)).join('\n'))}
            />
            {option}
          </label>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </fieldset>
  );
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(name: string) {
  const safeName = name.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return `${safeName || 'Learner'}-CV`;
}

function profileName(authUser: { user_metadata?: Record<string, unknown>; email?: string }) {
  const metadataName = authUser.user_metadata?.name ?? authUser.user_metadata?.full_name;
  return typeof metadataName === 'string' ? metadataName : authUser.email?.split('@')[0] || '';
}

export function CvBuilder() {
  const [data, setData] = useState<CvData>(emptyCvData);
  const [section, setSection] = useState<CvSection>('Role');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState('');
  const [error, setError] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  const [draftKind, setDraftKind] = useState<'summary' | 'review' | 'coverLetter' | 'bursaryStatement' | ''>('');
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveVersion = useRef(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = getSupabase();
        const [authResult, profileResult, cvResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('learner_profiles').select('*').maybeSingle(),
          supabase.from('learner_cv_details').select('phone,summary,experience,professional_title,education,projects,achievements,website,cv_data').maybeSingle(),
        ]);
        if (authResult.error) throw authResult.error;
        if (!authResult.data.user) throw new Error('Sign in again to use your CV builder.');
        if (profileResult.error) throw profileResult.error;
        if (cvResult.error) throw cvResult.error;
        if (!active) return;
        const profile = (profileResult.data || {}) as CvProfileSeed;
        const legacy = cvResult.data as Record<string, unknown> | null;
        setData(prefillCvData(
          legacy?.cv_data,
          profile,
          { name: profile.display_name || profileName(authResult.data.user), email: authResult.data.user.email || '' },
          legacy,
        ));
        setError('');
        setLoaded(true);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Your CV could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const persist = useCallback(async (next: CvData) => {
    const supabase = getSupabase();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('Sign in again to save your CV.');
    const { error: saveError } = await supabase.from('learner_cv_details').upsert({
      user_id: authData.user.id,
      cv_data: next,
      phone: next.phone,
      summary: next.summary,
      experience: next.formalExperience,
      professional_title: next.role || next.headline,
      education: next.schoolDetails,
      projects: next.projects,
      achievements: next.awards,
      website: next.linkedin,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (saveError) throw saveError;
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const version = ++saveVersion.current;
    const timeout = window.setTimeout(() => {
      setSaveState('Saving changes…');
      const save = saveQueue.current.catch(() => undefined).then(() => persist(data));
      saveQueue.current = save;
      void save.then(() => {
        if (version !== saveVersion.current) return;
        setSaveState('All changes saved');
        setError('');
      }).catch((caught: unknown) => {
        if (version !== saveVersion.current) return;
        setSaveState('');
        setError(caught instanceof Error ? caught.message : 'Your CV changes could not be saved.');
      });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [data, loaded, persist]);

  const setField = (name: FieldName, value: string) => {
    setData((current) => {
      const updated = { ...current, [name]: value };
      if (name === 'role' && (!current.headline || current.headline === current.role)) updated.headline = value;
      return updated;
    });
    setSaveState('Unsaved changes');
    setError('');
    setAiFeedback('');
  };

  const plainText = useMemo(() => cvPlainText(data), [data]);
  const aiReviewText = useMemo(() => buildCvOutput({
    ...data,
    referencesDisplay: 'Available on request',
    showCredentialIds: '',
  })
    .filter((item) => item.title !== 'Work readiness' && item.title !== 'References')
    .map((item) => `${item.title}\n${item.body}`)
    .join('\n\n')
    .slice(0, 6500), [data]);
  const match = useMemo(() => keywordMatch(data), [data]);
  const completeness = useMemo(() => {
    const checks = [
      Boolean(data.role.trim()),
      Boolean(data.opportunityTypes.trim()),
      Boolean(data.fullName.trim()),
      Boolean(data.phone.trim()),
      Boolean(data.email.trim()),
      Boolean(data.workStatus.trim() && data.availableFrom.trim() && data.licenceCode.trim()),
      Boolean(data.headline.trim() || data.summary.trim()),
      Boolean(data.strongestEvidence.trim()),
      Boolean(data.formalExperience.trim() || data.informalExperienceDetails.trim()),
      Boolean(data.schoolDetails.trim() || data.postSchoolEducation.trim()),
      Boolean(data.technicalSkills.trim() || data.softwareSkills.trim()),
      Boolean(data.skillProof.trim()),
      Boolean(data.languages.trim()),
    ];
    return Math.round(checks.filter(Boolean).length * 100 / checks.length);
  }, [data]);

  async function aiRequest(kind: 'cv-summary' | 'cv-review' | 'cv-cover-letter' | 'cv-bursary-statement', payload: unknown) {
    setAiBusy(true);
    setError('');
    setAiFeedback('');
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, payload }),
      });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok || !result.text) throw new Error(result.error || 'AI assistance is unavailable.');
      setAiFeedback(result.text);
      if (kind === 'cv-summary') setShowAiReview(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'AI assistance is unavailable.');
    } finally {
      setAiBusy(false);
    }
  }

  async function generateSummary() {
    setDraftKind('summary');
    await aiRequest('cv-summary', {
      role: data.role,
      strongestEvidence: data.strongestEvidence,
      achievements: [data.proudAchievementOne, data.proudAchievementTwo].filter(Boolean),
      careerDirection: data.careerDirection,
      skills: [data.technicalSkills, data.softwareSkills, data.workplaceSkills].filter(Boolean).map((value) => value.slice(0, 700)),
      experience: [data.formalExperience, data.informalExperienceDetails].filter(Boolean).map((value) => value.slice(0, 1500)),
      education: [data.schoolDetails, data.postSchoolEducation].filter(Boolean).map((value) => value.slice(0, 1000)),
    });
  }

  async function draftCoverLetter() {
    setDraftKind('coverLetter');
    setShowAiReview(true);
    await aiRequest('cv-cover-letter', {
      role: data.role,
      advert: data.advert.slice(0, 2500),
      summary: data.summary.slice(0, 1000),
      experience: [data.primaryDuties, data.primaryOutcome, data.formalExperience, data.informalExperienceDetails].join('\n').slice(0, 3500),
      education: [data.schoolDetails, data.postSchoolEducation].join('\n').slice(0, 1000),
      skills: [data.technicalSkills, data.softwareSkills].join('\n').slice(0, 1000),
    });
  }

  async function draftBursaryStatement() {
    setDraftKind('bursaryStatement');
    setShowAiReview(true);
    await aiRequest('cv-bursary-statement', {
      role: data.role,
      strongestEvidence: data.strongestEvidence.slice(0, 1000),
      achievements: [data.proudAchievementOne, data.proudAchievementTwo].filter(Boolean),
      education: [data.schoolDetails, data.postSchoolEducation].join('\n').slice(0, 1500),
      goals: data.careerDirection.slice(0, 500),
      projects: data.projects.slice(0, 1000),
    });
  }

  function reviewChecks() {
    const allOutput = plainText.toLowerCase();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const phone = data.phone.replace(/[\s()-]/g, '');
    const phoneValid = /^(?:0[1-8]\d{8}|\+27[1-8]\d{8})$/.test(phone);
    const keywordsOkay = !data.advert.trim() || match.total === 0 || match.matched / match.total >= 0.7;
    const experienceLines = [
      ...data.primaryDuties.split('\n'),
      data.primaryMetric,
      data.primaryOutcome,
      ...data.formalExperience.split('\n'),
      ...data.informalExperienceDetails.split('\n'),
    ].map((line) => line.trim()).filter((line) => line.length > 12);
    const quantifiedCount = experienceLines.filter((line) => /\d/.test(line)).length;
    const expiredYears = [...data.certificates.matchAll(/\b(?:expires?|expiry)\s*:?\s*((?:19|20)\d{2})\b/gi)]
      .map((entry) => Number(entry[1]))
      .filter((year) => year < new Date().getFullYear());
    const privateTerms = /\b(?:id number|date of birth|street address|marital status|bank account)\b/i.test(allOutput);
    const words = plainText.split(/\s+/).filter(Boolean).length;
    const experienceYears = Number((data.formalExperience.match(/(\d+)\s+years?/i) || [])[1] || 0);
    return [
      { label: 'Target role and contact details', pass: Boolean(data.role.trim() && data.opportunityTypes.trim() && data.fullName.trim() && emailValid && phoneValid && data.town.trim() && data.province.trim()), note: 'Add your target role and opportunity type, full name, valid email and South African phone number, town, and province.' },
      { label: 'Work readiness', pass: Boolean(data.workStatus.trim() && data.availableFrom.trim() && data.licenceCode.trim()), note: 'Add right-to-work status, availability, and a licence choice (including “None” if applicable). These details are only printed when you choose them.' },
      { label: 'CV length', pass: words <= (experienceYears < 5 ? 800 : 1200), note: 'Keep an early-career CV near one page and other CVs to two pages.' },
      { label: 'Dates and chronology', pass: /\b(19|20)\d{2}\b/.test(data.primaryWorkDates + data.formalExperience + data.schoolDetails + data.postSchoolEducation), note: 'Add years or month/year dates, newest experience first, and explain any career breaks.' },
      { label: 'Evidence and numbers', pass: experienceLines.length > 0 && quantifiedCount / experienceLines.length >= 0.5, note: 'Aim for at least half of experience bullets to include a real quantity or measurable result. Never invent metrics.' },
      { label: 'Action-led wording', pass: !/responsible for/i.test(data.primaryDuties + data.formalExperience + data.informalExperienceDetails), note: 'Start experience bullets with action verbs and replace “responsible for”.' },
      { label: 'Job-ad keywords', pass: keywordsOkay, note: data.advert ? `Matched ${match.matched} of ${match.total} likely keywords. Missing: ${match.missing.slice(0, 8).join(', ') || 'none detected'}.` : 'Paste an advert to check relevant keywords.' },
      { label: 'Spelling and consistency', pass: false, note: 'Review manually in South African English; check consistent dates and past/present tense.' },
      { label: 'ATS-friendly layout', pass: true, note: 'The CV uses one column, standard section headings, selectable text, and no photo.' },
      { label: 'Privacy check', pass: !privateTerms, note: 'Do not include an ID number, birth date, or street address in CV text.' },
      { label: 'References', pass: data.referencesDisplay !== 'Show permitted reference contacts' || (data.referenceOnePermission === 'Yes' && data.referenceTwoPermission === 'Yes'), note: 'Only print reference contact details after getting their permission.' },
      { label: 'Certificate expiry', pass: expiredYears.length === 0, note: expiredYears.length ? `Review expired credential dates: ${[...new Set(expiredYears)].join(', ')}.` : 'Check that every certificate and licence is still current.' },
      { label: 'File name', pass: Boolean(data.fullName.trim()), note: `Download as ${safeFilename(data.fullName)}.pdf.` },
    ];
  }

  function renderSection() {
    switch (section) {
      case 'Role':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">What are you applying for?</h3>
          <Field data={data} name="role" label="Job, learnership, or internship title" placeholder="e.g. Admin Clerk, Junior Developer, Retail Assistant" hint="This sets the CV headline and helps focus the skills and advert check." maxLength={120} setData={setField} />
          <Field data={data} name="advert" label="Paste the job advert" optional multiline rows={7} maxLength={5000} placeholder="Paste the job description here. This is used to identify keywords on this device." hint="The advert is saved with your private CV data. Only the AI summary/review buttons send their stated fields to the configured AI provider." setData={setField} />
          <CheckboxSet data={data} name="opportunityTypes" label="Type of opportunity" options={['Full-time', 'Part-time', 'Learnership', 'Internship', 'Apprenticeship', 'Graduate programme', 'Contract', 'Freelance']} setData={setField} />
          <Choice data={data} name="industry" label="Industry" optional options={['Retail / hospitality', 'Admin / office', 'Call centre / BPO', 'IT / tech', 'Finance / accounting', 'Construction / trades / engineering', 'Security', 'Healthcare / care work', 'Education / teaching', 'Driving / logistics', 'Creative / media', 'Agriculture / manufacturing', 'Entrepreneur / self-employed', 'Other']} setData={setField} />
          <Choice data={data} name="cvType" label="How will you use this CV?" optional options={['General job search (master CV)', 'Tailored to one specific job']} setData={setField} />
        </div>;
      case 'Contact':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">How can an employer contact you?</h3>
          <Field data={data} name="fullName" label="Full name" maxLength={120} hint="Use the name shown on your qualifications. Only letters, spaces, and hyphens are needed." setData={setField} />
          <Field data={data} name="phone" label="Mobile number" type="tel" maxLength={40} placeholder="0XX XXX XXXX or +27 XX XXX XXXX" hint="Keep your phone available and voicemail set up." setData={setField} />
          <Choice data={data} name="whatsapp" label="Is WhatsApp available on this number?" optional options={['Yes', 'No']} setData={setField} />
          <Field data={data} name="email" label="Email address" type="email" maxLength={254} hint="A name-based address is easiest for employers to recognise." setData={setField} />
          <Field data={data} name="town" label="Suburb or town" maxLength={100} hint="Do not enter your street address." setData={setField} />
          <Choice data={data} name="province" label="Province" options={[...southAfricanProvinces]} setData={setField} />
          <Field data={data} name="linkedin" label="LinkedIn URL" optional type="url" maxLength={300} placeholder="https://www.linkedin.com/in/..." setData={setField} />
          <Field data={data} name="portfolio" label="Portfolio, GitHub, Behance, or website" optional multiline maxLength={1000} placeholder="Add a public URL. One link per line." setData={setField} />
          <Choice data={data} name="contactPreference" label="Preferred contact method" optional options={['Phone call', 'WhatsApp', 'Email']} hint="Used only to help you prepare; it is not printed." setData={setField} />
        </div>;
      case 'Readiness':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Work-readiness details</h3>
          <p className="rounded-lg bg-sunshine-light/60 p-3 text-sm leading-6 text-slate-700">Only share details relevant to the job. These are optional; salary and screening answers are never printed. Do not enter an ID number.</p>
          <Choice data={data} name="workStatus" label="Right to work in South Africa" options={['South African citizen', 'Permanent resident', 'Valid work permit', 'Prefer not to say']} hint="This appears on the CV only if you choose to enter it." setData={setField} />
          {data.workStatus === 'Valid work permit' && <Field data={data} name="workPermitExpiry" label="Work permit expiry date" optional type="date" setData={setField} />}
          <Choice data={data} name="availableFrom" label="When can you start?" options={['Immediately', 'Within 1 month', 'Within 2 months', 'Within 3 months', 'Other / notice period']} setData={setField} />
          {data.availableFrom === 'Other / notice period' &&           <Field data={data} name="noticePeriod" label="Notice period" optional maxLength={100} placeholder="e.g. 4 weeks" setData={setField} />}
          <Choice data={data} name="licenceCode" label="Driver's licence" optional options={['None', 'Learner’s licence', 'Code A / A1', 'Code B', 'Code EB', 'Code C1', 'Code C', 'Code EC1', 'Code EC', 'Other']} setData={setField} />
          <Choice data={data} name="transport" label="Do you have reliable transport?" optional options={['Yes', 'No']} setData={setField} />
          <Choice data={data} name="relocate" label="Are you willing to relocate?" optional options={['Yes', 'No']} setData={setField} />
          {data.relocate === 'Yes' && <CheckboxSet data={data} name="relocateProvinces" label="Where could you relocate?" options={[...southAfricanProvinces]} setData={setField} />}
          <Field data={data} name="travel" label="Travel availability" optional maxLength={300} placeholder="e.g. Local travel, nationwide, no regular travel" setData={setField} />
          <CheckboxSet data={data} name="shifts" label="Shifts you can work" options={['Daytime', 'Evenings', 'Night shifts', 'Weekends', 'Public holidays', 'Flexible']} setData={setField} />
          <CheckboxSet data={data} name="workModes" label="Work arrangement" options={['On-site', 'Hybrid', 'Remote']} setData={setField} />
          <Choice data={data} name="checkConsent" label="Comfortable with a role-required criminal-record or credit check?" optional options={['Yes', 'No', 'Prefer not to say']} hint="Private preparation only; never displayed on the CV." setData={setField} />
          <Field data={data} name="salaryRange" label="Expected salary or stipend (private)" optional maxLength={100} placeholder="Optional range in Rands" hint="Saved privately for your preparation and never included in CV exports." setData={setField} />
        </div>;
      case 'Profile':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Headline and professional profile</h3>
          <Field data={data} name="headline" label="Headline" placeholder="e.g. Entry-level IT Support Technician · NQF 4" maxLength={90} hint="A few words under your name. Tailor it to the job title." setData={setField} />
          <Field data={data} name="strongestEvidence" label="What is your strongest qualification or experience?" multiline maxLength={1000} placeholder="Name your qualification or experience and why it is relevant." setData={setField} />
          <Field data={data} name="proudAchievementOne" label="Achievement you are proud of (include a number if possible)" optional maxLength={300} placeholder="e.g. Helped 20 learners improve their computer skills" setData={setField} />
          <Field data={data} name="proudAchievementTwo" label="Another achievement (include a number if possible)" optional maxLength={300} placeholder="e.g. Raised R2,000 for a community project" setData={setField} />
          <Field data={data} name="careerDirection" label="What do you want to do next and where do you want to grow?" multiline maxLength={500} placeholder="Describe your next step and what you hope to learn." setData={setField} />
          <Field data={data} name="summary" label="Professional summary" multiline rows={5} maxLength={1500} placeholder="Write 3–4 factual sentences. Avoid generic claims; include role, proof, strengths, and goal." hint="AI can draft a suggestion from selected CV facts. Review and edit it before accepting." setData={setField} />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary min-h-10" onClick={() => void generateSummary()} disabled={aiBusy}>
              <Sparkles size={16} aria-hidden="true" />{aiBusy ? 'Drafting…' : 'Suggest a summary'}
            </button>
            <span className="text-xs leading-5 text-slate-500">Only role, experience, education, skills and achievement facts above are sent to the AI provider when you choose this.</span>
          </div>
          {showAiReview && aiFeedback && draftKind === 'summary' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-midnight">Suggested summary — check every detail before using</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{aiFeedback}</p>
              <button type="button" className="btn-secondary mt-3 min-h-10" onClick={() => setField('summary', aiFeedback)}>Use this draft</button>
            </div>
          )}
        </div>;
      case 'Experience':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Work and experience of any kind</h3>
          <p className="text-sm leading-6 text-slate-600">Add your most relevant or recent role here. You can add other roles in the additional experience box below. Work volume and outcomes are separate so your CV can show evidence without inventing claims.</p>
          <Field data={data} name="primaryJobTitle" label="Job title" optional maxLength={120} placeholder="Use the title from your contract if you have one." setData={setField} />
          <Field data={data} name="primaryEmployer" label="Employer or organisation" optional maxLength={160} setData={setField} />
          <Field data={data} name="primaryWorkLocation" label="City or town" optional maxLength={100} setData={setField} />
          <Choice data={data} name="primaryEmploymentType" label="Employment type" optional options={['Full-time', 'Part-time', 'Contract', 'Casual', 'Internship', 'Learnership', 'Self-employed', 'Volunteer']} setData={setField} />
          <Field data={data} name="primaryWorkDates" label="Start and end month/year" optional maxLength={80} placeholder="e.g. Jan 2024 – Mar 2025, or Jan 2025 – Present" hint="Use chronological dates and do not set a start date in the future." setData={setField} />
          <Field data={data} name="primaryDuties" label="What were your main duties?" optional multiline maxLength={1500} placeholder={'One duty per line. Start with an action verb: served, built, organised, trained...'} setData={setField} />
          <Field data={data} name="primaryMetric" label="How many people, items, or tasks did you handle?" optional maxLength={120} placeholder="e.g. 40 customers or 12 support tickets" hint="Use a number only if you can support it." setData={setField} />
          <Field data={data} name="primaryFrequency" label="How often or how quickly?" optional maxLength={100} placeholder="e.g. per shift, per week, within 24 hours" setData={setField} />
          <Field data={data} name="primaryOutcome" label="What improved because of your work?" optional multiline maxLength={700} placeholder="A result you can explain in an interview. Add a number if you know it." setData={setField} />
          <Choice data={data} name="primaryLeadership" label="Did you lead, train, or supervise anyone?" optional options={['No', 'Yes — add the number and what you led below']} setData={setField} />
          {data.primaryLeadership.startsWith('Yes') && <Field data={data} name="primaryLeadershipDetails" label="Who or how many did you lead/train?" optional maxLength={200} placeholder="e.g. Trained 2 new team members" setData={setField} />}
          <Field data={data} name="primaryTools" label="Tools, systems, or software used" optional maxLength={500} placeholder="e.g. Excel, POS, CRM, Canva" setData={setField} />
          <Field data={data} name="primaryRecognition" label="Awards, recognition, or promotion" optional maxLength={500} setData={setField} />
          <Choice data={data} name="managerContactPermission" label="May the employer contact your manager?" optional options={['Yes', 'No', 'Ask me first']} hint="Preparation only; this answer is not printed." setData={setField} />
          <Field data={data} name="formalExperience" label="Paid work, internships, or learnerships" optional multiline rows={8} maxLength={5000} placeholder={'Job title — Employer, town (Mon YYYY – Mon YYYY)\nEmployment type: Full-time / part-time / contract / casual / internship / learnership\nDuties: Start each with an action verb.\nHow many/how often: e.g. 40 customers per shift.\nResult: What improved because of your work?\nTools, recognition, leadership, manager contact permission.'} hint="Use newest role first. Give one role per block, include dates, action verbs, quantities and real outcomes. Private reason for leaving is not printed." setData={setField} />
          <Field data={data} name="leavingReasons" label="Reason for leaving (private preparation only)" optional multiline maxLength={500} placeholder="Use this to prepare an interview response. This is never printed." setData={setField} />
          <Field data={data} name="informalExperienceTypes" label="Experience types to include" optional multiline maxLength={500} placeholder="Choose any that apply: volunteering, family business, informal/side work, school or campus leadership, projects, caring responsibilities, job shadowing." setData={setField} />
          <Field data={data} name="informalExperienceDetails" label="Describe your other experience" optional multiline rows={6} maxLength={4000} placeholder={'Role — Organisation or activity (dates)\nWhat you did, who benefited, how often, team/customer numbers, tools, and result.'} hint="This can include family-business help, tutoring, hair or car-wash services, school leadership, personal projects, or community work. Include caring responsibilities only if you choose." setData={setField} />
          <Choice data={data} name="careerBreak" label="How would you like to explain a career break longer than six months?" optional options={['Studying or training', 'Job-seeking', 'Caring for family', 'Volunteering', 'Career break', 'Other', 'Skip']} hint="Only include a neutral explanation if you want. Personal health details are not needed." setData={setField} />
          {data.careerBreak && data.careerBreak !== 'Skip' &&           <Field data={data} name="careerBreakNote" label="Optional neutral explanation to include" optional maxLength={300} placeholder="e.g. Career break: job-seeking and short courses" setData={setField} />}
          <p className="rounded-lg bg-sunshine-light/60 p-3 text-sm leading-6 text-slate-700">No paid experience yet? That is okay. Projects, volunteering, informal work, school leadership, and community contributions can demonstrate your strengths.</p>
        </div>;
      case 'Education':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Education and training</h3>
          <Choice data={data} name="schoolGrade" label="Highest school grade or school qualification" options={['Grade 9', 'Grade 10', 'Grade 11', 'Matric (NSC)', 'IEB', 'Cambridge', 'Other']} setData={setField} />
          <Field data={data} name="schoolDetails" label="School qualification, school/institution, town, and year" maxLength={1500} placeholder="e.g. National Senior Certificate — Example High School, Durban (2024)" setData={setField} />
          <Choice data={data} name="matricPass" label="Matric pass type" optional options={['Bachelor', 'Diploma', 'Higher Certificate', 'NSC pass', 'Not applicable']} setData={setField} />
          <Field data={data} name="subjects" label="Subjects and final marks" optional multiline maxLength={1500} placeholder={'Mathematics: 72%\nEnglish: 65%\nMathematical Literacy: 80%'} hint="One subject per line. Include marks only when accurate and relevant." setData={setField} />
          <Choice data={data} name="matricPlan" label="If you have not finished matric, what are you doing about it?" optional options={['Second-chance programme', 'Rewriting', 'Equivalent qualification', 'Not yet', 'Not applicable']} setData={setField} />
          <Field data={data} name="postSchoolEducation" label="Post-school qualifications and training" optional multiline rows={6} maxLength={2500} placeholder={'Qualification — Institution (TVET / university / college / SETA / online)\nNQF level (1–10) · status · start/finish year\nAverage/distinction, relevant modules or final-year project'} hint="One qualification per block. Your profile qualification is prefilled. Do not enter your student number." setData={setField} />
          <Field data={data} name="educationQualification" label="Qualification name" optional maxLength={150} placeholder="e.g. National Certificate: Business Studies" setData={setField} />
          <Field data={data} name="educationInstitution" label="Institution" optional maxLength={150} setData={setField} />
          <Choice data={data} name="educationInstitutionType" label="Institution type" optional options={['TVET', 'University', 'University of Technology', 'Private college', 'SETA / learnership', 'Online', 'Other']} setData={setField} />
          <Choice data={data} name="educationNqfLevel" label="NQF level" optional options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']} hint="Examples: NQF 4 = matric; NQF 5 = Higher Certificate; NQF 6 = Diploma; NQF 7 = Bachelor's." setData={setField} />
          <Choice data={data} name="educationStatus" label="Qualification status" optional options={['Completed', 'In progress', 'Incomplete']} setData={setField} />
          <Field data={data} name="educationYears" label="Year started and finished (or expected)" optional maxLength={40} placeholder="e.g. 2023–2025" setData={setField} />
          <Field data={data} name="educationResults" label="Average, distinction, or result note" optional maxLength={300} placeholder="Include only strong, accurate results." setData={setField} />
          <Field data={data} name="educationModules" label="Relevant modules or final-year project" optional maxLength={500} setData={setField} />
          <Choice data={data} name="qualificationCheck" label="Have you checked whether your qualification is registered and can provide your certificate?" optional options={['Yes', 'No', 'Not applicable', 'Prefer not to say']} hint="Private checklist only; not included in the CV." setData={setField} />
        </div>;
      case 'Certificates':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Certifications and licences</h3>
          <Field data={data} name="certificates" label="Certificates, licences, and short courses" optional multiline rows={6} maxLength={2000} placeholder={'Certificate — Issuer (year; expiry if any; in progress if applicable)\nFirst Aid Level 1 — Provider (2025; expires 2027)'} hint="Add one per line. Check expiry dates before including a licence." setData={setField} />
          <Field data={data} name="professionalRegistration" label="Professional body registration" optional maxLength={300} placeholder="e.g. SACE, HPCSA, ECSA, SAICA, SANC" setData={setField} />
          <CheckboxSet data={data} name="safetyCompliance" label="Safety or compliance training" options={['PSIRA', 'First Aid', 'Fire fighting', 'Food handling', 'Working at heights', 'Other']} setData={setField} />
          <Field data={data} name="credentialIds" label="Credential ID or verification links" optional multiline maxLength={1000} placeholder="Optional IDs or links; stored privately." hint="Not printed unless you explicitly choose to show them below. Avoid adding government ID or student numbers." setData={setField} />
          <Choice data={data} name="showCredentialIds" label="Include credential IDs/links on the CV?" optional options={['Yes', 'No']} setData={setField} />
        </div>;
      case 'Skills':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Skills and evidence</h3>
          <Field data={data} name="technicalSkills" label="Technical and job skills" optional multiline maxLength={1000} placeholder="One per line. Aim for 6–12 skills relevant to this role." hint="Prefilled from your learner profile when available." setData={setField} />
          <Field data={data} name="softwareSkills" label="Software and tools, with level" optional multiline maxLength={1000} placeholder={'Microsoft Excel — Good\nGoogle Workspace — Advanced\nPOS — Basic'} hint="Prefilled from your profile skills where available." setData={setField} />
          <Field data={data} name="skillProof" label="Where have you used your top three skills?" optional multiline maxLength={1500} placeholder="Give one short example for each skill, linked to an experience, project, or course." setData={setField} />
          <CheckboxSet data={data} name="workplaceSkills" label="Workplace skills" options={['Customer service', 'Communication', 'Teamwork', 'Problem solving', 'Time management', 'Leadership', 'Adaptability', 'Attention to detail', 'Initiative', 'Resilience']} setData={setField} />
          <Field data={data} name="workplaceExamples" label="Give examples that prove your workplace skills" optional multiline maxLength={1500} placeholder="Add one specific example for each skill you selected." setData={setField} />
          <Field data={data} name="typingNumeracy" label="Typing speed, numeracy, or digital level" optional maxLength={200} placeholder="e.g. 45 WPM · confident with percentages · intermediate digital skills" setData={setField} />
          <Field data={data} name="skillGaps" label="Job-ad skills you are still learning" optional multiline maxLength={1000} placeholder="List gaps honestly and what you are doing to build each skill." hint="Do not claim skills you do not yet have." setData={setField} />
        </div>;
      case 'Languages':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Languages</h3>
          <Field data={data} name="languages" label="Languages and level" optional multiline rows={6} maxLength={1000} placeholder={'isiZulu — Home language\nEnglish — Fluent\nSesotho — Conversational'} hint="Include only languages you can use at the level stated. Your profile languages are prefilled." setData={setField} />
          <p className="text-sm leading-6 text-slate-600">If a role needs it, you may separately note reading, writing, and speaking ability.</p>
        </div>;
      case 'Achievements':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Achievements, awards, and leadership</h3>
          <Field data={data} name="awards" label="Awards, scholarships, bursaries, or competitions" optional multiline maxLength={1500} placeholder="Title — Issuer (year): brief detail or result." setData={setField} />
          <Field data={data} name="leadership" label="Leadership roles" optional multiline maxLength={1000} placeholder="Role — Group (years): who or what you led and what changed." setData={setField} />
          <Field data={data} name="publications" label="Publications, speeches, or presentations" optional multiline maxLength={1000} placeholder="Title or event (year): topic and audience." setData={setField} />
          <Field data={data} name="sportsArts" label="Sports, arts, or culture achievements" optional multiline maxLength={1000} placeholder="Activity — level or recognition (year)." setData={setField} />
        </div>;
      case 'Community':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Volunteering and community</h3>
          <Field data={data} name="volunteering" label="Community or volunteer roles not already in experience" optional multiline rows={6} maxLength={1500} placeholder={'Role — Organisation (dates)\nHours per week · tasks · people helped, funds raised, or events run'} hint="Avoid duplicating an entry already included in Experience." setData={setField} />
        </div>;
      case 'Projects':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Projects and portfolio</h3>
          <Field data={data} name="projects" label="Project name, link, your role, tools, and result" optional multiline rows={7} maxLength={2500} placeholder={'Project — your role (year)\nGoal and what you contributed · tools used · measurable result\nPublic link, if available'} hint="Useful for IT, design, media, engineering, coursework, and personal projects." setData={setField} />
        </div>;
      case 'Role details':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Details relevant to {data.industry || 'your industry'}</h3>
          <p className="text-sm leading-6 text-slate-600">Add only relevant, accurate details. Your industry choice shows prompts; there is no need to answer every suggestion.</p>
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {data.industry === 'Retail / hospitality' && 'Consider till/POS and cash handling, stock-taking, weekend/shift availability, and food-handling certificates.'}
            {data.industry === 'Admin / office' && 'Consider typing speed, Microsoft Office, records or filing, Pastel/Sage/Xero, reception, and minute-taking.'}
            {data.industry === 'Call centre / BPO' && 'Consider languages, typing speed, headset experience, quality scores, targets, and shift flexibility.'}
            {data.industry === 'IT / tech' && 'Consider languages/frameworks, GitHub, projects, certifications, and hardware/software focus.'}
            {data.industry === 'Finance / accounting' && 'Consider Pastel/Sage/Xero/SAP, tax/VAT/payroll experience, and professional registration.'}
            {data.industry === 'Construction / trades / engineering' && 'Consider trade tests, Red Seal, SHEQ/safety, machinery, ECSA status, and site experience.'}
            {data.industry === 'Security' && 'Consider PSIRA grade, firearm competency where applicable, and shift availability. Keep sensitive registration numbers private.'}
            {data.industry === 'Healthcare / care work' && 'Consider SANC/HPCSA registration, First Aid/CPR, and caregiving experience. Do not include private medical details.'}
            {data.industry === 'Education / teaching' && 'Consider SACE registration, subjects/phases, practical teaching hours, and extra-mural activities.'}
            {data.industry === 'Driving / logistics' && 'Consider licence code, PrDP, years driving, vehicle types, and relevant driving experience.'}
            {data.industry === 'Creative / media' && 'Consider portfolio links, Adobe/Canva/Figma tools, social channels, and audience or engagement results.'}
            {data.industry === 'Agriculture / manufacturing' && 'Consider machinery, forklift, hygiene/HACCP training, and seasonal availability.'}
            {data.industry === 'Entrepreneur / self-employed' && 'Consider products/services, customers, revenue range (optional), CIPC registration, and business results.'}
            {!data.industry && 'Choose an industry in the Role section to see tailored prompts.'}
          </div>
          <Field data={data} name="industryDetails" label="Relevant industry-specific details" optional multiline rows={7} maxLength={1500} placeholder="Only add information that is accurate and relevant to this role." setData={setField} />
        </div>;
      case 'References':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">References</h3>
          <p className="rounded-lg bg-sunshine-light/60 p-3 text-sm leading-6 text-slate-700">Ask each person for permission before sharing their contact details. A manager, teacher, or supervisor is usually more useful than a friend. The default CV output says “Available on request”.</p>
          <Field data={data} name="referenceOne" label="Reference 1: name, title, organisation, relationship, phone, and email" optional multiline maxLength={1000} placeholder="Add details only after asking permission." setData={setField} />
          <Choice data={data} name="referenceOnePermission" label="Reference 1 has given permission?" optional options={['Yes', 'No']} setData={setField} />
          <Field data={data} name="referenceTwo" label="Reference 2: name, title, organisation, relationship, phone, and email" optional multiline maxLength={1000} placeholder="Add details only after asking permission." setData={setField} />
          <Choice data={data} name="referenceTwoPermission" label="Reference 2 has given permission?" optional options={['Yes', 'No']} setData={setField} />
          <Choice data={data} name="referencesDisplay" label="What should appear on your CV?" options={['Available on request', 'Show permitted reference contacts']} setData={setField} />
        </div>;
      case 'Extras':
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Optional extras</h3>
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">This builder does not collect a photo, ID number, date of birth, gender, race, religion, marital status, home street address, bank details, children, or health information. These details are not needed for a standard CV and can introduce privacy and bias risks.</p>
          <Field data={data} name="interests" label="Relevant interests" optional maxLength={300} placeholder="One line, only if it adds something useful for this role." setData={setField} />
          <Choice data={data} name="declaration" label="Add a declaration that the information is true?" optional options={['Yes', 'No']} setData={setField} />
          <Field data={data} name="coverLetter" label="Cover letter draft" optional multiline rows={8} maxLength={4000} placeholder="Create or edit a separate cover letter. It is not included in the CV." setData={setField} />
          <button type="button" className="btn-secondary min-h-10" onClick={() => void draftCoverLetter()} disabled={aiBusy}>
            <Sparkles size={16} aria-hidden="true" />{aiBusy ? 'Drafting…' : 'Suggest a cover letter'}
          </button>
          <Field data={data} name="bursaryStatement" label="Bursary or learnership personal statement" optional multiline rows={7} maxLength={3000} placeholder="Create or edit a separate statement. It is not included in the CV." setData={setField} />
          <button type="button" className="btn-secondary min-h-10" onClick={() => void draftBursaryStatement()} disabled={aiBusy}>
            <Sparkles size={16} aria-hidden="true" />{aiBusy ? 'Drafting…' : 'Suggest a personal statement'}
          </button>
          {showAiReview && aiFeedback && (draftKind === 'coverLetter' || draftKind === 'bursaryStatement') && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-midnight">AI draft — review and edit before use</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{aiFeedback}</p>
              <button type="button" className="btn-secondary mt-3 min-h-10" onClick={() => {
                if (draftKind === 'coverLetter' || draftKind === 'bursaryStatement') setField(draftKind, aiFeedback);
              }}>Use this draft</button>
            </div>
          )}
          <p className="text-xs leading-5 text-slate-500">When selected, AI receives only relevant role, CV facts, goals, and (for a cover letter) the job advert. Salary, screening answers, contact details, and references are not sent.</p>
          <p className="text-sm leading-6 text-slate-600">Your CV answers are private to your account.</p>
        </div>;
      case 'Review': {
        const checks = reviewChecks();
        return <div className="space-y-5">
          <h3 className="text-lg font-bold text-midnight">Final review</h3>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-midnight">CV completeness</p>
              <span className="rounded-full bg-sunshine-light px-3 py-1 text-sm font-bold text-midnight">{completeness}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sunshine-dark transition-all" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          <ul className="space-y-2">
            {checks.map((check) => (
              <li key={check.label} className="rounded-lg border border-slate-200 p-3">
                <p className={`text-sm font-semibold ${check.pass ? 'text-emerald-800' : 'text-amber-800'}`}>{check.pass ? '✓' : 'Check'} · {check.label}</p>
                {!check.pass && <p className="mt-1 text-sm leading-5 text-slate-600">{check.note}</p>}
              </li>
            ))}
          </ul>
          {data.advert && <p className="text-sm text-slate-600">Local keyword comparison: {match.matched} / {match.total} potential advert terms ({match.total ? Math.round(match.matched * 100 / match.total) : 0}%). This is a basic word check, not an eligibility assessment.</p>}
          <div className="flex flex-wrap gap-3 print:hidden">
            <button type="button" className="btn-secondary min-h-10" onClick={() => {
              setDraftKind('review');
              setShowAiReview(true);
              void aiRequest('cv-review', { cv: aiReviewText, advert: data.advert.slice(0, 2000) });
            }} disabled={aiBusy}>
              <Sparkles size={16} aria-hidden="true" />{aiBusy ? 'Reviewing…' : 'Get AI feedback'}
            </button>
            <button type="button" className="btn-secondary min-h-10" onClick={() => download(`${safeFilename(data.fullName)}.txt`, new Blob([plainText], { type: 'text/plain;charset=utf-8' }))}>
              <FileText size={16} aria-hidden="true" />Download plain text
            </button>
            <button type="button" className="btn-secondary min-h-10" onClick={() => download(`${safeFilename(data.fullName)}.docx`, cvDocx(data))}>
              <Download size={16} aria-hidden="true" />Download Word document
            </button>
            <button type="button" className="btn-primary min-h-10" onClick={() => {
              const title = document.title;
              document.title = safeFilename(data.fullName);
              window.print();
              document.title = title;
            }}>
              <Printer size={16} aria-hidden="true" />Print / save as PDF
            </button>
          </div>
          {showAiReview && aiFeedback && draftKind === 'review' && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-midnight">AI feedback — verify before using</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{aiFeedback}</p>
          </div>}
          <p className="text-xs leading-5 text-slate-500">AI feedback sends a limited CV excerpt (excluding contact details, readiness, and references) and up to 2,000 characters of the advert to the configured AI provider when selected.</p>
        </div>;
      }
    }
  }

  if (loading) return <p className="py-8 text-sm text-slate-600" role="status">Loading your profile and CV...</p>;

  const sectionIndex = cvSections.indexOf(section);
  const preview = buildCvOutput(data);

  return (
    <section>
      <div className="mb-5 rounded-xl border border-slate-200 bg-sunshine-light/60 p-4">
        <p className="text-sm leading-6 text-slate-700">Your account and learner profile prefill available details. Complete only the sections that fit the role; changes save automatically. Update profile information in <Link href="/app/profile" className="link">Your profile</Link>.</p>
        <p className="mt-2 text-xs text-slate-600" aria-live="polite">{saveState || 'Your CV is private to your account.'}</p>
      </div>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(19rem,0.82fr)_minmax(0,1.18fr)]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {sectionIndex + 1} of {cvSections.length}</p>
                <h2 className="mt-1 text-xl font-bold text-midnight">{section}</h2>
              </div>
              <span className="text-sm font-semibold text-slate-600">{completeness}% complete</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sunshine-dark transition-all" style={{ width: `${((sectionIndex + 1) / cvSections.length) * 100}%` }} />
            </div>
            <div className="mt-5">{renderSection()}</div>
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                className="btn-secondary min-h-10"
                disabled={sectionIndex === 0}
                onClick={() => setSection(cvSections[sectionIndex - 1])}
              >
                <ArrowLeft size={16} aria-hidden="true" />Back
              </button>
              <button
                type="button"
                className="btn-primary min-h-10"
                disabled={sectionIndex === cvSections.length - 1}
                onClick={() => setSection(cvSections[sectionIndex + 1])}
              >
                Next<ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <nav aria-label="CV sections" className="flex flex-wrap gap-2">
            {cvSections.map((item, index) => (
              <button
                key={item}
                type="button"
                aria-current={section === item ? 'step' : undefined}
                onClick={() => setSection(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${section === item ? 'border-black bg-sunshine-light text-black' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {index + 1}. {item}
              </button>
            ))}
          </nav>
        </div>

        <article id="cv-print" className="min-h-[40rem] rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-9" aria-label="CV preview">
          <header className="border-b-2 border-black pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Curriculum vitae</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-black">{data.fullName || 'Your name'}</h2>
            {(data.headline || data.role) && <p className="mt-1 text-lg font-medium text-slate-700">{data.headline || data.role}</p>}
            <p className="mt-3 text-sm leading-6 text-slate-600">{[data.email, [data.phone, data.whatsapp === 'Yes' ? 'WhatsApp' : ''].filter(Boolean).join(' '), [data.town, data.province].filter(Boolean).join(', '), data.linkedin, data.portfolio].filter(Boolean).join(' · ') || 'Add contact details to your CV.'}</p>
            {cvReadinessLine(data) && <p className="mt-2 text-xs leading-5 text-slate-600">{cvReadinessLine(data)}</p>}
          </header>
          {preview.map((item) => (
            <section key={item.title} className="mt-5 break-inside-avoid">
              <h3 className="border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">{item.title}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{item.body}</p>
            </section>
          ))}
          {preview.length === 0 && <p className="mt-8 text-sm leading-6 text-slate-500">Complete a section to see your CV preview here.</p>}
        </article>
      </div>
    </section>
  );
}
