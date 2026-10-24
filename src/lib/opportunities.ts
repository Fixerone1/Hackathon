export const opportunityCategories = [
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Learnership / internship' },
  { value: 'bursary', label: 'Bursary / scholarship' },
  { value: 'training', label: 'Training programme' },
  { value: 'enterprise', label: 'Enterprise support' },
] as const;

export type OpportunityCategory = (typeof opportunityCategories)[number]['value'];
export type OpportunityStatus = 'draft' | 'published' | 'withdrawn';
export type LearnerOpportunityAction = 'saved' | 'applied';

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  summary: string;
  source_name: string;
  source_url: string;
  location: string;
  provinces: string[];
  remote_ok: boolean;
  minimum_nqf_level: number | null;
  required_skills: string[];
  closing_date: string | null;
  verified_at: string;
  status: OpportunityStatus;
  created_at: string;
};

export type OpportunityProfile = {
  target_role?: string | null;
  highest_qualification?: string | null;
  field_of_study?: string | null;
  subjects?: unknown;
  skills?: unknown;
  skill_ratings?: unknown;
  experience_months?: number | null;
  province?: string | null;
  nqf_level?: number | null;
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
  return [...new Set([...skills, ...ratings].map((skill) => skill.trim()).filter(Boolean))];
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

export function isValidWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
