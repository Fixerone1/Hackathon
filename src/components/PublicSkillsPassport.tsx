'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Printer, ShieldCheck } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';
import { getSupabase } from '@/lib/supabase';

type PublicSkill = { name: string; level?: number; evidence_note?: string };
type PublicExperience = { area: string; months?: number; detail?: string };
type PublicProject = { title: string; description?: string; url?: string };
type PublicEducation = { qualification: string; field?: string; year?: number | string; status?: string };
type PublicCertification = { name: string };
type PublicPassportData = {
  display_name?: string;
  headline?: string;
  summary?: string;
  skills: PublicSkill[];
  experience: PublicExperience[];
  projects: PublicProject[];
  education: PublicEducation[];
  certifications: PublicCertification[];
  email?: string;
};

function safeExternalUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function parsePassport(value: unknown): PublicPassportData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const strings = (key: string) => typeof data[key] === 'string' ? data[key] as string : undefined;
  const objects = <T,>(key: string): T[] => Array.isArray(data[key]) ? data[key] as T[] : [];
  return {
    display_name: strings('display_name'),
    headline: strings('headline'),
    summary: strings('summary'),
    skills: objects<PublicSkill>('skills').filter((item) => typeof item?.name === 'string'),
    experience: objects<PublicExperience>('experience').filter((item) => typeof item?.area === 'string'),
    projects: objects<PublicProject>('projects').filter((item) => typeof item?.title === 'string'),
    education: objects<PublicEducation>('education').filter((item) => typeof item?.qualification === 'string'),
    certifications: objects<PublicCertification>('certifications').filter((item) => typeof item?.name === 'string'),
    email: strings('email'),
  };
}

export function PublicSkillsPassport() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [passport, setPassport] = useState<PublicPassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    setPassport(null);
    setUnavailable(false);

    if (!token) {
      setUnavailable(true);
      setLoading(false);
      return () => { active = false; };
    }

    async function loadPassport() {
      try {
        const { data, error } = await getSupabase().rpc('get_public_skills_passport', { p_share_token: token });
        if (error) throw error;
        const parsed = parsePassport(data);
        if (active) {
          setPassport(parsed);
          setUnavailable(!parsed);
        }
      } catch {
        if (active) setUnavailable(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    void loadPassport();
    return () => { active = false; };
  }, [token]);

  const skills = passport?.skills || [];
  const experience = passport?.experience || [];
  const projects = passport?.projects || [];
  const education = passport?.education || [];
  const certifications = passport?.certifications || [];

  return (
    <PublicShell>
      <main id="passport-print" className="mx-auto min-h-[60vh] max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-600" role="status">Loading Skills Passport...</p>
        ) : unavailable || !passport ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card sm:p-8">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sunshine-light text-midnight"><ShieldCheck size={22} aria-hidden="true" /></span>
            <h1 className="mt-4 text-2xl font-bold text-black">This Skills Passport is unavailable</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">The link may have expired, been turned off, or been copied incorrectly. Ask the learner for a current link.</p>
          </section>
        ) : (
          <>
            <header className="rounded-2xl border border-slate-200 bg-sunshine p-5 text-center shadow-card sm:p-8">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-midnight"><BriefcaseBusiness size={22} aria-hidden="true" /></span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-black">Ukukhanya · Skills Passport</p>
              <h1 className="mt-2 break-words text-3xl font-bold leading-tight text-black sm:text-4xl">{passport.display_name || 'Learner portfolio'}</h1>
              {passport.headline && <p className="mt-2 text-base font-semibold text-black/75 sm:text-lg">{passport.headline}</p>}
              {passport.summary && <p className="mx-auto mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-black/80 sm:text-base">{passport.summary}</p>}
              <button type="button" onClick={() => window.print()} className="btn-secondary mt-5 min-h-10 bg-white/80 px-3 print:hidden"><Printer size={15} aria-hidden="true" />Print or save as PDF</button>
            </header>

            <div className="mt-5 space-y-5">
              {skills.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="public-skills-heading">
                  <h2 id="public-skills-heading" className="text-lg font-bold text-black">Skills and examples</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {skills.map((skill, index) => (
                      <article key={`${skill.name}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-semibold text-slate-900">{skill.name}</h3>
                          {typeof skill.level === 'number' && <span className="text-xs text-slate-500">Self-rated {skill.level}/5</span>}
                        </div>
                        {skill.evidence_note && <p className="mt-2 text-sm leading-6 text-slate-600">{skill.evidence_note}</p>}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {projects.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="public-projects-heading">
                  <h2 id="public-projects-heading" className="text-lg font-bold text-black">Projects and work samples</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {projects.map((project, index) => {
                      const url = safeExternalUrl(project.url);
                      return (
                        <article key={`${project.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <h3 className="font-semibold text-slate-900">{project.title}</h3>
                          {project.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.description}</p>}
                          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-flex min-h-10 items-center gap-1 text-sm">View work sample <ArrowUpRight size={15} aria-hidden="true" /></a>}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {experience.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="public-experience-heading">
                  <h2 id="public-experience-heading" className="text-lg font-bold text-black">Experience</h2>
                  <ul className="mt-4 space-y-3">
                    {experience.map((item, index) => <li key={`${item.area}-${index}`} className="border-l-2 border-sunshine pl-4"><h3 className="font-semibold text-slate-900">{item.area}</h3>{typeof item.months === 'number' && <p className="mt-1 text-xs text-slate-500">About {item.months} months</p>}{item.detail && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.detail}</p>}</li>)}
                  </ul>
                </section>
              )}

              {education.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="public-education-heading">
                  <h2 id="public-education-heading" className="flex items-center gap-2 text-lg font-bold text-black"><GraduationCap size={20} aria-hidden="true" />Education</h2>
                  <ul className="mt-4 space-y-3">
                    {education.map((item, index) => <li key={`${item.qualification}-${index}`} className="rounded-xl bg-slate-50 p-4"><h3 className="font-semibold text-slate-900">{item.qualification}</h3><p className="mt-1 text-sm text-slate-600">{[item.field, item.status, item.year].filter(Boolean).join(' · ')}</p></li>)}
                  </ul>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="public-certificates-heading">
                  <h2 id="public-certificates-heading" className="text-lg font-bold text-black">Certificates and training</h2>
                  <ul className="mt-3 space-y-2">
                    {certifications.map((certificate, index) => <li key={`${certificate.name}-${index}`} className="rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">{certificate.name}</p><p className="mt-1 text-xs text-slate-500">Learner-reported · not independently verified</p></li>)}
                  </ul>
                </section>
              )}

              {passport.email && <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-6"><h2 className="font-bold text-black">Contact</h2><a href={`mailto:${encodeURIComponent(passport.email)}`} className="link mt-2 inline-flex min-h-10 items-center text-sm">{passport.email}</a></section>}

              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">This portfolio contains information selected and provided by the learner. Skills, experience, education, and certificates have not been independently verified by Ukukhanya. Please confirm qualifications and work samples with their issuers or owners where needed.</p>
            </div>
          </>
        )}
      </main>
    </PublicShell>
  );
}