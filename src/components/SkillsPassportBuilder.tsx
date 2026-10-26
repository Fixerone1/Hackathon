'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Copy, Eye, LockKeyhole, Plus, Share2, Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import {
  hasVisiblePassportContent,
  normalizePassportData,
  passportFromProfile,
  type SkillsPassportData,
} from '@/lib/skills-passport';

const visibilityLabels = [
  ['name', 'Name'],
  ['headline', 'Role or headline'],
  ['summary', 'About me'],
  ['email', 'Contact email'],
] as const;

type PassportRow = {
  share_token: string;
  is_public: boolean;
  expires_at: string | null;
  public_data: unknown;
};

export function SkillsPassportBuilder() {
  const [data, setData] = useState<SkillsPassportData>(() => passportFromProfile(null));
  const [shareToken, setShareToken] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [expiry, setExpiry] = useState('30');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillEvidence, setSkillEvidence] = useState('');
  const [certificateName, setCertificateName] = useState('');
  const [certificateIssuer, setCertificateIssuer] = useState('');
  const [certificateYear, setCertificateYear] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPassport() {
      try {
        const supabase = getSupabase();
        const { data: authResult, error: authError } = await supabase.auth.getUser();
        if (authError || !authResult.user) throw new Error('Sign in again to build your Skills Passport.');

        const [profileResult, passportResult] = await Promise.all([
          supabase.from('learner_profiles').select('display_name,about_me,target_role,skill_ratings,skills,experience_by_area,highest_qualification,field_of_study,qualification_year,qualification_status,certifications').maybeSingle(),
          supabase.from('skills_passports').select('share_token,is_public,expires_at,public_data').maybeSingle(),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (passportResult.error) throw passportResult.error;
        if (!active) return;

        const saved = passportResult.data as PassportRow | null;
        setData(saved ? normalizePassportData(saved.public_data) : passportFromProfile(profileResult.data));
        if (saved) {
          const expired = Boolean(saved.expires_at && new Date(saved.expires_at).getTime() <= Date.now());
          setShareToken(expired ? crypto.randomUUID() : saved.share_token);
          setIsPublic(saved.is_public && !expired);
          if (saved.expires_at) {
            const remainingDays = Math.ceil((new Date(saved.expires_at).getTime() - Date.now()) / 86_400_000);
            setExpiry(remainingDays <= 10 ? '7' : '30');
          } else {
            setExpiry('never');
          }
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Your Skills Passport could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPassport();
    return () => { active = false; };
  }, []);

  function updateField(field: keyof SkillsPassportData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function toggleVisibility(key: keyof SkillsPassportData['visibility'], checked: boolean) {
    setData((current) => ({ ...current, visibility: { ...current.visibility, [key]: checked } }));
    if (key === 'email' && checked && !data.email) {
      void getSupabase().auth.getUser().then(({ data: authResult }) => {
        if (authResult.user?.email) updateField('email', authResult.user.email);
      });
    }
  }

  async function savePassport(publish: boolean) {
    setError('');
    setMessage('');
    if (publish && !consent) {
      setError('Confirm that you understand these selected details will be visible to anyone with the link.');
      return;
    }
    if (publish && !hasVisiblePassportContent(data)) {
      setError('Select at least one section with content before publishing. Name and email alone are not enough.');
      return;
    }
    if (publish && data.visibility.email && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('Enter a valid contact email or turn off public email sharing.');
      return;
    }
    if (new TextEncoder().encode(JSON.stringify(data)).byteLength > 45_000) {
      setError('This passport has reached its content limit. Remove some entries or shorten descriptions, then try again.');
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabase();
      const { data: authResult, error: authError } = await supabase.auth.getUser();
      if (authError || !authResult.user) throw new Error('Sign in again before saving your passport.');

      const nextToken = !publish && isPublic ? crypto.randomUUID() : shareToken || crypto.randomUUID();
      const expiresAt = !publish || expiry === 'never'
        ? null
        : new Date(Date.now() + Number(expiry) * 86_400_000).toISOString();
      const { error: saveError } = await supabase.from('skills_passports').upsert({
        user_id: authResult.user.id,
        share_token: nextToken,
        is_public: publish,
        expires_at: expiresAt,
        public_data: data,
      }, { onConflict: 'user_id' });
      if (saveError) throw saveError;

      setShareToken(nextToken);
      setIsPublic(publish);
      setConsent(false);
      setMessage(publish
        ? 'Your Skills Passport is live. Only the sections you selected are included.'
        : isPublic
          ? 'Saved privately. Your previous public link has been revoked.'
          : 'Private draft saved. Nothing is public yet.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your Skills Passport could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  function passportUrl() {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return `${window.location.origin}${basePath}/passport/?token=${encodeURIComponent(shareToken)}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(passportUrl());
      setMessage('Share link copied.');
      setError('');
    } catch {
      setError('Could not copy the link. Open the public preview and copy its address.');
    }
  }

  async function deletePassport() {
    if (!window.confirm('Delete your Skills Passport and permanently revoke its share link? This cannot be undone.')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authResult, error: authError } = await supabase.auth.getUser();
      if (authError || !authResult.user) throw new Error('Sign in again before deleting your passport.');
      const { error: deleteError } = await supabase.from('skills_passports').delete().eq('user_id', authResult.user.id);
      if (deleteError) throw deleteError;
      setShareToken('');
      setIsPublic(false);
      setConsent(false);
      setMessage('Your Skills Passport was deleted and its share link was revoked.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your Skills Passport could not be deleted.');
    } finally {
      setSaving(false);
    }
  }

  function addProject() {
    const title = projectTitle.trim();
    if (!title) {
      setError('Add a project title first.');
      return;
    }
    if (data.projects.length >= 12) {
      setError('A Skills Passport can include up to 12 projects.');
      return;
    }
    const url = projectUrl.trim();
    if (url) {
      try {
        if (new URL(url).protocol !== 'https:') throw new Error();
      } catch {
        setError('Project links must be valid HTTPS addresses.');
        return;
      }
    }
    setData((current) => ({
      ...current,
      projects: [...current.projects, { title, description: projectDescription.trim(), url }],
    }));
    setProjectTitle('');
    setProjectDescription('');
    setProjectUrl('');
    setError('');
  }

  function addSkill() {
    const name = skillName.trim();
    if (!name) {
      setError('Add a skill name first.');
      return;
    }
    if (data.skills.length >= 30) {
      setError('A Skills Passport can include up to 30 skills.');
      return;
    }
    setData((current) => ({
      ...current,
      skills: [...current.skills, { name, level: null, evidence_note: skillEvidence.trim() }],
    }));
    setSkillName('');
    setSkillEvidence('');
    setError('');
  }

  function addCertification() {
    const name = certificateName.trim();
    if (!name) {
      setError('Add a certificate or training name first.');
      return;
    }
    if (data.certifications.length >= 20) {
      setError('A Skills Passport can include up to 20 certificates or training entries.');
      return;
    }
    if (certificateYear && !/^\d{4}$/.test(certificateYear)) {
      setError('Enter the certificate year as four digits.');
      return;
    }
    setData((current) => ({
      ...current,
      certifications: [...current.certifications, { name, issuer: certificateIssuer.trim(), year: certificateYear }],
    }));
    setCertificateName('');
    setCertificateIssuer('');
    setCertificateYear('');
    setError('');
  }

  if (loading) return <p className="py-8 text-sm text-slate-600" role="status">Loading your Skills Passport...</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="passport-details-heading">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunshine-light text-midnight"><Share2 size={19} aria-hidden="true" /></span>
            <div>
              <h2 id="passport-details-heading" className="text-lg font-bold text-black">Build your portfolio</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Choose what to include. Nothing is shared until you publish and confirm your selection.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="passport-name" className="label">Name</label>
              <input id="passport-name" className="input" maxLength={80} value={data.display_name} onChange={(event) => updateField('display_name', event.target.value)} placeholder="Name you want employers to see" />
            </div>
            <div>
              <label htmlFor="passport-headline" className="label">Role or headline</label>
              <input id="passport-headline" className="input" maxLength={120} value={data.headline} onChange={(event) => updateField('headline', event.target.value)} placeholder="e.g. Junior designer | Customer service" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="passport-summary" className="label">Short professional introduction</label>
              <textarea id="passport-summary" className="input min-h-28" maxLength={700} rows={4} value={data.summary} onChange={(event) => updateField('summary', event.target.value)} placeholder="Describe the kind of work you want to do, what you bring, and a practical example. Keep it accurate and in your own words." />
              <p className="mt-1 text-xs text-slate-500">{data.summary.length}/700 characters</p>
            </div>
          </div>

          <fieldset className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-800">What can a link visitor see?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {visibilityLabels.map(([key, label]) => (
                <label key={key} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" className="h-4 w-4 accent-sunshine-dark" checked={data.visibility[key]} onChange={(event) => toggleVisibility(key, event.target.checked)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {data.visibility.email && (
              <div className="mt-3">
                <label htmlFor="passport-email" className="label">Email to show publicly</label>
                <input id="passport-email" type="email" autoComplete="email" maxLength={200} className="input" value={data.email} onChange={(event) => updateField('email', event.target.value)} />
              </div>
            )}
          </fieldset>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="passport-evidence-heading">
          <h2 id="passport-evidence-heading" className="text-lg font-bold text-black">Skills and experience evidence</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Examples help employers understand what you can do. Any ratings or experience here are learner-reported.</p>
          <label className="mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">
            <input type="checkbox" className="h-4 w-4 accent-sunshine-dark" checked={data.visibility.skills} onChange={(event) => toggleVisibility('skills', event.target.checked)} />
            Share these skills
          </label>
          {data.skills.length === 0 ? <p className="mt-3 text-sm text-slate-500">Add skills in your learner profile to show them here.</p> : (
                  <ul className="mt-3 space-y-2">
              {data.skills.map((skill, index) => (
                <li key={`${skill.name}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <label className="min-w-0 flex-1 text-xs font-medium text-slate-600">
                      Skill
                      <input maxLength={120} className="input mt-1 bg-white text-sm" value={skill.name} onChange={(event) => setData((current) => ({ ...current, skills: current.skills.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} />
                    </label>
                    <button type="button" className="mt-5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" aria-label={`Remove ${skill.name}`} onClick={() => setData((current) => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Example or evidence
                    <textarea rows={2} maxLength={240} className="input mt-1 min-h-16 bg-white text-sm" value={skill.evidence_note} onChange={(event) => setData((current) => ({ ...current, skills: current.skills.map((item, itemIndex) => itemIndex === index ? { ...item, evidence_note: event.target.value } : item) }))} placeholder="Describe when you used this skill" />
                  </label>
                  {skill.level && <p className="mt-2 text-xs text-slate-500">Self-rated {skill.level}/5</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label htmlFor="passport-skill-name" className="label">Add a skill</label>
              <input id="passport-skill-name" maxLength={120} className="input" value={skillName} onChange={(event) => setSkillName(event.target.value)} placeholder="e.g. Customer service" />
            </div>
            <div>
              <label htmlFor="passport-skill-evidence" className="label">Real example <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="passport-skill-evidence" maxLength={240} className="input" value={skillEvidence} onChange={(event) => setSkillEvidence(event.target.value)} placeholder="Where did you use it?" />
            </div>
            <button type="button" onClick={addSkill} className="btn-secondary min-h-11 px-3"><Plus size={16} aria-hidden="true" />Add skill</button>
          </div>
          <label className="mt-5 flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">
            <input type="checkbox" className="h-4 w-4 accent-sunshine-dark" checked={data.visibility.experience} onChange={(event) => toggleVisibility('experience', event.target.checked)} />
            Share experience areas
          </label>
          {data.experience.length === 0 ? <p className="mt-3 text-sm text-slate-500">Add experience in your learner profile to show it here.</p> : (
            <ul className="mt-3 space-y-2">
              {data.experience.map((item, index) => (
                <li key={`${item.area}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{item.area}</p>
                  {item.months !== null && <p className="mt-1 text-xs text-slate-500">About {item.months} months</p>}
                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    What did you do or contribute?
                    <textarea rows={2} maxLength={600} className="input mt-1 min-h-16 bg-white text-sm" value={item.detail} onChange={(event) => setData((current) => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, detail: event.target.value } : entry) }))} placeholder="Add a specific responsibility or outcome" />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="passport-projects-heading">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="passport-projects-heading" className="text-lg font-bold text-black">Projects and work samples</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Add school, community, personal, or paid work that demonstrates your contribution.</p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sunshine-light text-midnight"><Eye size={17} aria-hidden="true" /></span>
          </div>
          <label className="mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">
            <input type="checkbox" className="h-4 w-4 accent-sunshine-dark" checked={data.visibility.projects} onChange={(event) => toggleVisibility('projects', event.target.checked)} />
            Share my projects
          </label>
          {data.projects.length > 0 && (
            <ul className="mt-3 space-y-2">
              {data.projects.map((project, index) => (
                <li key={`${project.title}-${index}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{project.title}</p>
                    {project.description && <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.description}</p>}
                    {project.url && <p className="mt-1 break-all text-xs text-slate-500">{project.url}</p>}
                  </div>
                  <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" aria-label={`Remove ${project.title}`} onClick={() => setData((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={16} aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="project-title" className="label">Project title</label>
              <input id="project-title" maxLength={120} className="input" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="e.g. Community event flyer" />
            </div>
            <div>
              <label htmlFor="project-url" className="label">HTTPS link <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="project-url" type="url" maxLength={500} className="input" value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="project-description" className="label">What did you do, and what was the result?</label>
              <textarea id="project-description" rows={3} maxLength={800} className="input min-h-24" value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="Explain your contribution and the outcome. Do not include another person’s private information." />
            </div>
          </div>
          <button type="button" onClick={addProject} className="btn-secondary mt-3 min-h-10 px-3"><Plus size={16} aria-hidden="true" />Add project</button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="passport-qualifications-heading">
          <h2 id="passport-qualifications-heading" className="text-lg font-bold text-black">Education and training</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Only include details you want to share. Listed items are not independently verified by Beacon.</p>
          <label className="mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">
            <input type="checkbox" className="h-4 w-4 accent-sunshine-dark" checked={data.visibility.education} onChange={(event) => toggleVisibility('education', event.target.checked)} />
            Share education
          </label>
          {data.education.length > 0 && <ul className="mt-3 space-y-2">{data.education.map((item, index) => <li key={`${item.qualification}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-600">Qualification<input maxLength={120} className="input mt-1 bg-white text-sm" value={item.qualification} onChange={(event) => setData((current) => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, qualification: event.target.value } : entry) }))} /></label>
            <label className="text-xs font-medium text-slate-600">Field<input maxLength={120} className="input mt-1 bg-white text-sm" value={item.field} onChange={(event) => setData((current) => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, field: event.target.value } : entry) }))} /></label>
            <label className="text-xs font-medium text-slate-600">Status<input maxLength={40} className="input mt-1 bg-white text-sm" value={item.status} onChange={(event) => setData((current) => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, status: event.target.value } : entry) }))} /></label>
            <label className="text-xs font-medium text-slate-600">Year<input inputMode="numeric" maxLength={4} className="input mt-1 bg-white text-sm" value={item.year} onChange={(event) => setData((current) => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, year: event.target.value.replace(/\D/g, '').slice(0, 4) } : entry) }))} /></label>
          </li>)}</ul>}
          <label className="mt-5 flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">
            <input type="checkbox" className="h-4 w-4 accent-sunshine-dark" checked={data.visibility.certifications} onChange={(event) => toggleVisibility('certifications', event.target.checked)} />
            Share certificates and training
          </label>
          {data.certifications.length > 0 && <ul className="mt-3 space-y-2">{data.certifications.map((item, index) => <li key={`${item.name}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
            <label className="text-xs font-medium text-slate-600">Name<input maxLength={180} className="input mt-1 bg-white text-sm" value={item.name} onChange={(event) => setData((current) => ({ ...current, certifications: current.certifications.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry) }))} /></label>
            <label className="text-xs font-medium text-slate-600">Issuer<input maxLength={120} className="input mt-1 bg-white text-sm" value={item.issuer} onChange={(event) => setData((current) => ({ ...current, certifications: current.certifications.map((entry, entryIndex) => entryIndex === index ? { ...entry, issuer: event.target.value } : entry) }))} /></label>
            <label className="text-xs font-medium text-slate-600">Year<input inputMode="numeric" maxLength={4} className="input mt-1 bg-white text-sm" value={item.year} onChange={(event) => setData((current) => ({ ...current, certifications: current.certifications.map((entry, entryIndex) => entryIndex === index ? { ...entry, year: event.target.value.replace(/\D/g, '').slice(0, 4) } : entry) }))} /></label>
            <p className="text-xs text-slate-500 sm:col-span-3">Learner-reported · not independently verified</p>
          </li>)}</ul>}
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_auto] sm:items-end">
            <div><label htmlFor="certificate-name" className="label">Add certificate or training</label><input id="certificate-name" maxLength={180} className="input" value={certificateName} onChange={(event) => setCertificateName(event.target.value)} placeholder="e.g. First Aid Level 1" /></div>
            <div><label htmlFor="certificate-issuer" className="label">Issuer</label><input id="certificate-issuer" maxLength={120} className="input" value={certificateIssuer} onChange={(event) => setCertificateIssuer(event.target.value)} placeholder="Provider or organisation" /></div>
            <div><label htmlFor="certificate-year" className="label">Year</label><input id="certificate-year" inputMode="numeric" maxLength={4} className="input" value={certificateYear} onChange={(event) => setCertificateYear(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2026" /></div>
            <button type="button" onClick={addCertification} className="btn-secondary min-h-11 px-3"><Plus size={16} aria-hidden="true" />Add</button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="passport-sharing-heading">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunshine-light text-midnight"><LockKeyhole size={18} aria-hidden="true" /></span>
            <div>
              <h2 id="passport-sharing-heading" className="text-lg font-bold text-black">Share settings</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">A public link can be opened by anyone who has it. It stays private until you publish.</p>
            </div>
          </div>
          <label htmlFor="passport-expiry" className="label mt-4">Link expiry</label>
          <select id="passport-expiry" className="input max-w-sm" value={expiry} onChange={(event) => setExpiry(event.target.value)}>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="never">No expiry</option>
          </select>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sunshine-dark" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>I understand that anyone with the link can see the sections I selected, and I have checked this information before sharing it.</span>
          </label>
          {error && <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-800" role="alert">{error}</p>}
          {message && <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-800" role="status">{message}</p>}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" className="btn-secondary w-full sm:w-auto" disabled={saving} onClick={() => void savePassport(false)}>
              {saving ? 'Saving...' : isPublic ? 'Save privately and revoke link' : 'Save private draft'}
            </button>
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={saving} onClick={() => void savePassport(true)}>
              {saving ? 'Saving...' : isPublic ? 'Update public passport' : 'Publish my passport'}
            </button>
            {shareToken && <button type="button" className="btn-secondary min-h-10 w-full px-3 text-slate-700 sm:ml-auto sm:w-auto" disabled={saving} onClick={() => void deletePassport()}><Trash2 size={15} aria-hidden="true" />Delete passport</button>}
          </div>
          {isPublic && shareToken && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Your passport is public</p>
              <p className="mt-1 break-all text-xs text-slate-600">{passportUrl()}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn-secondary min-h-10 px-3" onClick={() => void copyLink()}><Copy size={15} aria-hidden="true" />Copy link</button>
                <Link href={`/passport?token=${encodeURIComponent(shareToken)}`} target="_blank" rel="noreferrer" className="btn-secondary min-h-10 px-3"><Eye size={15} aria-hidden="true" />Preview and print PDF</Link>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-500">Your address, phone number, birth date, income goals, work authorisation, private profile notes, and account ID are never included. Self-reported details are not verified credentials.</p>
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-36">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card" aria-labelledby="passport-preview-heading">
          <div className="bg-sunshine p-5 text-black sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide">Skills Passport preview</p>
            <h2 id="passport-preview-heading" className="mt-2 text-2xl font-bold">{data.visibility.name && data.display_name ? data.display_name : 'Your name'}</h2>
            {data.visibility.headline && data.headline && <p className="mt-1 text-sm font-medium text-black/75">{data.headline}</p>}
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            {data.visibility.summary && data.summary && <p className="text-sm leading-6 text-slate-700">{data.summary}</p>}
            {data.visibility.skills && data.skills.length > 0 && <div><h3 className="text-xs font-bold uppercase text-slate-500">Skills</h3><div className="mt-2 flex flex-wrap gap-2">{data.skills.map((skill, index) => <span key={`${skill.name}-${index}`} className="rounded-full bg-sunshine-light px-3 py-1 text-xs font-semibold text-slate-800">{skill.name}</span>)}</div></div>}
            {data.visibility.projects && data.projects.length > 0 && <div><h3 className="text-xs font-bold uppercase text-slate-500">Projects</h3><ul className="mt-2 space-y-2">{data.projects.map((project, index) => <li key={`${project.title}-${index}`} className="text-sm font-medium text-slate-800">{project.title}</li>)}</ul></div>}
            {!hasVisiblePassportContent(data) && <p className="text-sm leading-6 text-slate-500">Choose at least one section and add its content to build your shareable profile.</p>}
            <p className="border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">Skills, experience, and certificates are learner-reported unless an external issuer verifies them.</p>
          </div>
        </section>
        <Link href="/app/profile" className="link inline-flex text-sm">Edit your learner profile <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </aside>
    </div>
  );
}
