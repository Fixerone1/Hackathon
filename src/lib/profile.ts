export type ProfileRecord = {
  highest_qualification?: string;
  field_of_study?: string;
  subjects?: unknown[];
  skills?: string[];
  skill_ratings?: unknown[];
  experience_months?: number;
  province?: string;
  target_role?: string;
};

export const qualificationNqfLevels: Record<string, number> = {
  'Below Grade 9': 1,
  'Grade 9': 1,
  'Grade 10': 2,
  'Grade 11': 3,
  Matric: 4,
  'N6 certificate': 5,
  Diploma: 6,
  "Bachelor's degree": 7,
  'Honours degree': 8,
  "Master's degree": 9,
  Doctorate: 10,
};

export function profileStrength(profile: ProfileRecord): number {
  const completed = [
    Boolean(profile.highest_qualification),
    Boolean(profile.field_of_study),
    Boolean(profile.subjects?.length),
    Boolean(profile.skills?.length || profile.skill_ratings?.length),
    (profile.experience_months || 0) > 0,
    Boolean(profile.province),
    Boolean(profile.target_role),
  ];
  return Math.round(completed.filter(Boolean).length * 100 / completed.length);
}

export function profileNextStep(profile: ProfileRecord): string {
  if (!profile.highest_qualification) return 'Add your highest qualification to begin your profile.';
  if (!profile.subjects?.length && ['Matric', 'Grade 10', 'Grade 11'].includes(profile.highest_qualification)) {
    return 'Add your subjects to clarify eligibility for future opportunities.';
  }
  if (!profile.province) return 'Add your province to identify relevant local opportunities.';
  if (!profile.target_role) return 'Add a target role to make your profile more useful.';
  if (!profile.skills?.length && !profile.skill_ratings?.length) return 'Add your skills to improve future opportunity matching.';
  return 'Your profile is ready for comparison with verified opportunities.';
}
