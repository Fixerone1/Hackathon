export type MoneyConfidenceInputs = {
  salaryPlanCompleted: boolean;
  goalCreated: boolean;
  contributionWithin30Days: boolean;
  lessonsCompleted: number;
  totalLessons: number;
};

export function moneyConfidenceScore(input: MoneyConfidenceInputs): number {
  const lessonProgress = input.totalLessons > 0
    ? Math.min(1, Math.max(0, input.lessonsCompleted) / input.totalLessons)
    : 0;
  const score = (input.salaryPlanCompleted ? 30 : 0)
    + (input.goalCreated ? 25 : 0)
    + (input.contributionWithin30Days ? 25 : 0)
    + lessonProgress * 20;
  return Math.round(score);
}

export function economicMobilityScore(employment: number | null, money: number, growth: number | null): number | null {
  if (employment === null || growth === null) return null;
  const safeInputs = [employment, money, growth].every((value) => Number.isFinite(value) && value >= 0 && value <= 100);
  if (!safeInputs) throw new RangeError('Pillar scores must be between 0 and 100.');
  return Math.round(0.7 * employment + 0.15 * money + 0.15 * growth);
}
