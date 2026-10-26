export type PassportVisibility = {
  name: boolean;
  headline: boolean;
  summary: boolean;
  skills: boolean;
  experience: boolean;
  projects: boolean;
  education: boolean;
  certifications: boolean;
  email: boolean;
};

export type PassportSkill = {
  name: string;
  level: number | null;
  evidence_note: string;
};

export type PassportExperience = {
  area: string;
  months: number | null;
  detail: string;
};

export type PassportProject = {
  title: string;
  description: string;
  url: string;
};

export type PassportEducation = {
  qualification: string;
  field: string;
  year: string;
  status: string;
};

export type PassportCertification = {
  name: string;
  issuer: string;
  year: string;
};

export type SkillsPassportData = {
  display_name: string;
  headline: string;
  summary: string;
  email: string;
  skills: PassportSkill[];
  experience: PassportExperience[];
  projects: PassportProject[];
  education: PassportEducation[];
  certifications: PassportCertification[];
  visibility: PassportVisibility;
};

export const defaultPassportVisibility: PassportVisibility = {
  name: false,
  headline: false,
  summary: false,
  skills: false,
  experience: false,
  projects: false,
  education: false,
  certifications: false,
  email: false,
};

export function textValue(value: unknown, maxLength = 1000): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function passportFromProfile(profileValue: unknown): SkillsPassportData {
  const profile = recordValue(profileValue);
  const skillsSource = arrayValue(profile.skill_ratings).length ? profile.skill_ratings : profile.skills;
  const skills = arrayValue(skillsSource).flatMap((item): PassportSkill[] => {
    if (typeof item === 'string') {
      return item.trim() ? [{ name: item.trim().slice(0, 120), level: null, evidence_note: '' }] : [];
    }
    const skill = recordValue(item);
    const name = textValue(skill.name, 120);
    if (!name) return [];
    return [{
      name,
      level: typeof skill.level === 'number' && skill.level >= 1 && skill.level <= 5 ? skill.level : null,
      evidence_note: textValue(skill.evidence_note, 240),
    }];
  }).slice(0, 30);
  const experience = arrayValue(profile.experience_by_area).flatMap((item): PassportExperience[] => {
    const entry = recordValue(item);
    const area = textValue(entry.area, 120);
    return area ? [{ area, months: typeof entry.months === 'number' ? entry.months : null, detail: '' }] : [];
  }).slice(0, 20);
  const education: PassportEducation[] = textValue(profile.highest_qualification) ? [{
    qualification: textValue(profile.highest_qualification, 120),
    field: textValue(profile.field_of_study, 120),
    year: profile.qualification_year ? String(profile.qualification_year).slice(0, 4) : '',
    status: profile.qualification_status === 'completed' ? 'Completed' : profile.qualification_status === 'in_progress' ? 'In progress' : '',
  }] : [];
  const certifications = arrayValue(profile.certifications).flatMap((item): PassportCertification[] => {
    const name = textValue(item, 180);
    return name ? [{ name, issuer: '', year: '' }] : [];
  }).slice(0, 20);

  return {
    display_name: textValue(profile.display_name, 80),
    headline: textValue(profile.target_role, 120),
    summary: textValue(profile.about_me, 700),
    email: '',
    skills,
    experience,
    projects: [],
    education,
    certifications,
    visibility: { ...defaultPassportVisibility },
  };
}

export function normalizePassportData(value: unknown): SkillsPassportData {
  const data = recordValue(value);
  const visibility = recordValue(data.visibility);
  const skills = arrayValue(data.skills).flatMap((item): PassportSkill[] => {
    const entry = recordValue(item);
    const name = textValue(entry.name, 120);
    return name ? [{
      name,
      level: typeof entry.level === 'number' && entry.level >= 1 && entry.level <= 5 ? entry.level : null,
      evidence_note: textValue(entry.evidence_note, 240),
    }] : [];
  }).slice(0, 30);
  const experience = arrayValue(data.experience).flatMap((item): PassportExperience[] => {
    const entry = recordValue(item);
    const area = textValue(entry.area, 120);
    return area ? [{
      area,
      months: typeof entry.months === 'number' && entry.months >= 0 ? Math.min(entry.months, 600) : null,
      detail: textValue(entry.detail, 600),
    }] : [];
  }).slice(0, 20);
  const projects = arrayValue(data.projects).flatMap((item): PassportProject[] => {
    const entry = recordValue(item);
    const title = textValue(entry.title, 120);
    return title ? [{ title, description: textValue(entry.description, 800), url: textValue(entry.url, 500) }] : [];
  }).slice(0, 12);
  const education = arrayValue(data.education).flatMap((item): PassportEducation[] => {
    const entry = recordValue(item);
    const qualification = textValue(entry.qualification, 120);
    return qualification ? [{
      qualification,
      field: textValue(entry.field, 120),
      year: textValue(entry.year, 4),
      status: textValue(entry.status, 40),
    }] : [];
  }).slice(0, 15);
  const certifications = arrayValue(data.certifications).flatMap((item): PassportCertification[] => {
    const entry = recordValue(item);
    const name = textValue(entry.name, 180);
    return name ? [{ name, issuer: textValue(entry.issuer, 120), year: textValue(entry.year, 4) }] : [];
  }).slice(0, 20);

  return {
    display_name: textValue(data.display_name, 80),
    headline: textValue(data.headline, 120),
    summary: textValue(data.summary, 700),
    email: textValue(data.email, 200),
    skills,
    experience,
    projects,
    education,
    certifications,
    visibility: Object.fromEntries(Object.keys(defaultPassportVisibility).map((key) => [key, visibility[key] === true])) as unknown as PassportVisibility,
  };
}

export function hasVisiblePassportContent(data: SkillsPassportData): boolean {
  return Boolean(
    (data.visibility.headline && data.headline)
    || (data.visibility.summary && data.summary)
    || (data.visibility.skills && data.skills.length)
    || (data.visibility.experience && data.experience.length)
    || (data.visibility.projects && data.projects.length)
    || (data.visibility.education && data.education.length)
    || (data.visibility.certifications && data.certifications.length),
  );
}
