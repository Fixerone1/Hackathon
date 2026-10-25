export const opportunityCategories = [
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Learnership / internship' },
  { value: 'bursary', label: 'Bursary / scholarship' },
  { value: 'training', label: 'Training programme' },
  { value: 'enterprise', label: 'Enterprise support' },
] as const;

export const southAfricanProvinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga',
  'Northern Cape', 'North West', 'Western Cape',
] as const;

export const nqfLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type OpportunityCategory = (typeof opportunityCategories)[number]['value'];
export type OpportunityStatus = 'draft' | 'published';
export type LearnerOpportunityAction = 'saved' | 'applied';

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  summary: string;
  source_name: string;
  source_url: string;
  banner_image_url: string | null;
  location: string;
  provinces: string[];
  remote_ok: boolean;
  minimum_nqf_level: number | null;
  required_skills: string[];
  shift_types: string[];
  salary_min_monthly: number | null;
  salary_max_monthly: number | null;
  closing_date: string | null;
  verified_at: string;
  status: OpportunityStatus;
  created_at: string;
};

export function normalizeOpportunity(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    provinces: Array.isArray(opportunity.provinces) ? opportunity.provinces : [],
    required_skills: Array.isArray(opportunity.required_skills) ? opportunity.required_skills : [],
    shift_types: Array.isArray(opportunity.shift_types) ? opportunity.shift_types : [],
    salary_min_monthly: typeof opportunity.salary_min_monthly === 'number' ? opportunity.salary_min_monthly : null,
    salary_max_monthly: typeof opportunity.salary_max_monthly === 'number' ? opportunity.salary_max_monthly : null,
  };
}

export type OpportunityProfile = {
  target_role?: string | null;
  highest_qualification?: string | null;
  qualification_status?: string | null;
  qualification_year?: number | null;
  field_of_study?: string | null;
  subjects?: unknown;
  skills?: unknown;
  skill_ratings?: unknown;
  experience_months?: number | null;
  experience_by_area?: unknown;
  province?: string | null;
  city?: string | null;
  nqf_level?: number | null;
  languages?: unknown;
  certifications?: unknown;
  work_authorization?: string | null;
  availability_start_date?: string | null;
  shift_preferences?: unknown;
  hours_available_per_week?: number | null;
  target_income_monthly?: number | null;
  target_income_monthly_max?: number | null;
  employment_status?: string | null;
  drivers_license?: boolean | null;
  own_transport?: boolean | null;
  willing_to_relocate?: boolean | null;
  remote_ok?: boolean | null;
  computer_or_data_access?: boolean | null;
};

export type OpportunityMatch = {
  opportunity: Opportunity;
  score: number | null;
  reasons: string[];
  cautions: string[];
};

function words(value: string): string[] {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function profileSkills(profile: OpportunityProfile): string[] {
  const skills = Array.isArray(profile.skills)
    ? profile.skills.filter((item): item is string => typeof item === 'string')
    : [];
  const ratings = Array.isArray(profile.skill_ratings)
    ? profile.skill_ratings.flatMap((item) => {
      if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return [];
      return [item.name];
    })
    : [];
  const certifications = Array.isArray(profile.certifications)
    ? profile.certifications.filter((item): item is string => typeof item === 'string')
    : [];
  return [...new Set([...skills, ...ratings, ...certifications].map((skill) => skill.trim()).filter(Boolean))];
}

function includesPhrase(haystack: string, phrase: string): boolean {
  const normalizedHaystack = ` ${words(haystack).join(' ')} `;
  const normalizedPhrase = words(phrase).join(' ');
  return normalizedPhrase.length > 0 && normalizedHaystack.includes(` ${normalizedPhrase} `);
}

export function matchOpportunity(opportunity: Opportunity, profile: OpportunityProfile): OpportunityMatch {
  const reasons: string[] = [];
  const cautions: string[] = [];
  const signals: Array<{ weight: number; fit: number }> = [];
  const searchableText = `${opportunity.title} ${opportunity.summary} ${opportunity.required_skills.join(' ')}`;
  const targetRole = profile.target_role?.trim();
  const skills = profileSkills(profile);
  const province = profile.province?.trim();
  const nqfLevel = typeof profile.nqf_level === 'number' ? profile.nqf_level : null;
  const learnerShifts = Array.isArray(profile.shift_preferences)
    ? profile.shift_preferences.filter((item): item is string => typeof item === 'string')
    : [];

  if (targetRole) {
    const roleMatches = includesPhrase(searchableText, targetRole);
    signals.push({ weight: 30, fit: roleMatches ? 1 : 0 });
    if (roleMatches) reasons.push(`Related to your target: ${targetRole}`);
  }

  if (skills.length && opportunity.required_skills.length > 0) {
    const matchedRequirements = opportunity.required_skills.filter((required) => skills.some((skill) => includesPhrase(required, skill) || includesPhrase(skill, required)));
    signals.push({ weight: 35, fit: matchedRequirements.length / opportunity.required_skills.length });
    const matchedSkills = skills.filter((skill) => opportunity.required_skills.some((required) => includesPhrase(required, skill) || includesPhrase(skill, required)));
    if (matchedSkills.length) reasons.push(`Skill overlap: ${matchedSkills.join(', ')}`);
  }

  if (province) {
    const locationMatches = opportunity.provinces.length === 0
      || opportunity.provinces.some((item) => item.toLocaleLowerCase() === province.toLocaleLowerCase())
      || opportunity.remote_ok;
    signals.push({ weight: 20, fit: locationMatches ? 1 : 0 });
    if (locationMatches) reasons.push(opportunity.remote_ok ? 'Remote work is listed as available' : `Available in ${province}`);
    else cautions.push(`This listing is for ${opportunity.provinces.join(', ')}; your profile says ${province}`);
  }

  if (opportunity.minimum_nqf_level !== null && nqfLevel !== null) {
    const meetsStatedLevel = nqfLevel >= opportunity.minimum_nqf_level;
    signals.push({ weight: 15, fit: meetsStatedLevel ? 1 : 0 });
    if (meetsStatedLevel) reasons.push('Your profile meets the stated minimum NQF level');
    else cautions.push(`The listing states a minimum NQF level of ${opportunity.minimum_nqf_level}; your profile records level ${nqfLevel}`);
  }

  if (learnerShifts.length > 0 && opportunity.shift_types.length > 0) {
    const shiftMatches = learnerShifts.includes('flexible')
      || opportunity.shift_types.includes('flexible')
      || learnerShifts.some((shift) => opportunity.shift_types.includes(shift));
    signals.push({ weight: 15, fit: shiftMatches ? 1 : 0 });
    if (shiftMatches) reasons.push('The listed shifts match your availability');
    else cautions.push(`The listing mentions ${opportunity.shift_types.join(', ')} shifts; your preferred shifts are ${learnerShifts.join(', ')}`);
  }

  const hasLearnerSalary = typeof profile.target_income_monthly === 'number' || typeof profile.target_income_monthly_max === 'number';
  const hasListingSalary = opportunity.salary_min_monthly !== null || opportunity.salary_max_monthly !== null;
  if (hasLearnerSalary && hasListingSalary) {
    const learnerMin = profile.target_income_monthly ?? 0;
    const learnerMax = profile.target_income_monthly_max ?? Number.POSITIVE_INFINITY;
    const listingMin = opportunity.salary_min_monthly ?? 0;
    const listingMax = opportunity.salary_max_monthly ?? Number.POSITIVE_INFINITY;
    const salaryOverlaps = learnerMax >= listingMin && listingMax >= learnerMin;
    signals.push({ weight: 15, fit: salaryOverlaps ? 1 : 0 });
    if (salaryOverlaps) reasons.push('The stated salary overlaps your target range');
    else cautions.push('The stated salary is outside your target range; check whether the details are negotiable');
  }

  const totalWeight = signals.reduce((total, signal) => total + signal.weight, 0);
  const score = signals.length >= 2 && totalWeight
    ? Math.round(signals.reduce((total, signal) => total + signal.weight * signal.fit, 0) / totalWeight * 100)
    : null;

  if (opportunity.minimum_nqf_level !== null && nqfLevel === null) {
    cautions.push(`Check the stated minimum NQF level (${opportunity.minimum_nqf_level}) against your qualification`);
  }
  if (!reasons.length && score !== null) reasons.push('Review the listing requirements against your profile');

  return { opportunity, score, reasons, cautions };
}

export function categoryLabel(category: OpportunityCategory): string {
  return opportunityCategories.find((item) => item.value === category)?.label || category;
}

export function opportunityCoverageLabel(provinces: string[]): string {
  const matchesAllProvinces = southAfricanProvinces.every((province) => provinces.includes(province));
  return provinces.length === 0 || matchesAllProvinces ? 'Nationwide' : provinces.join(', ');
}

export function isValidWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}
