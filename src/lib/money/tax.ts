import { taxTables2026_27 } from './tax-tables-2026-27';

export type PayPeriod = 'monthly' | 'annual' | 'weekly' | 'hourly';
export type AgeGroup = 'under65' | 'age65to74' | 'age75plus';

export type TaxEstimateInput = {
  grossCents: number;
  period: PayPeriod;
  hoursPerWeek?: number;
  ageGroup: AgeGroup;
  retirementContributionCents?: number;
  medicalAidMembers?: number;
};

export type TaxEstimate = {
  annualGrossCents: number;
  monthlyGrossCents: number;
  annualRetirementDeductionCents: number;
  monthlyRetirementDeductionCents: number;
  taxableIncomeCents: number;
  annualTaxBeforeCreditsCents: number;
  monthlyPayeCents: number;
  monthlyUifCents: number;
  monthlyNetCents: number;
  annualRebateCents: number;
  monthlyMedicalCreditCents: number;
  effectiveTaxRate: number;
  marginalRate: number;
  uifStipendHint: boolean;
};

const MAX_GROSS_CENTS = 1_000_000_000;

function validateMoney(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_GROSS_CENTS) {
    throw new RangeError(`${label} must be a whole-cent amount between R0 and R10,000,000.`);
  }
}

function annualise(grossCents: number, period: PayPeriod, hoursPerWeek: number): number {
  const annual = period === 'annual' ? grossCents
    : period === 'weekly' ? grossCents * 52
      : period === 'hourly' ? grossCents * hoursPerWeek * 52
        : grossCents * 12;
  if (!Number.isSafeInteger(annual) || annual > MAX_GROSS_CENTS * 52) {
    throw new RangeError('The annualised income is above the supported estimate limit.');
  }
  return annual;
}

function annualTax(taxableCents: number): { taxCents: number; marginalRate: number } {
  const bracket = taxTables2026_27.brackets.find(({ ceilingCents }) => taxableCents <= ceilingCents)
    || taxTables2026_27.brackets[taxTables2026_27.brackets.length - 1];
  const lowerBoundCents = taxableCents <= taxTables2026_27.brackets[0].ceilingCents
    ? 0
    : taxTables2026_27.brackets[taxTables2026_27.brackets.indexOf(bracket) - 1].ceilingCents;
  const baseTaxCents = bracket.baseTaxCents;
  const taxCents = taxableCents <= lowerBoundCents
    ? 0
    : baseTaxCents + Math.round((taxableCents - lowerBoundCents) * bracket.marginalRate);
  return { taxCents, marginalRate: taxableCents === 0 ? 0 : bracket.marginalRate };
}

export function estimateSouthAfricanTakeHome(input: TaxEstimateInput): TaxEstimate {
  validateMoney(input.grossCents, 'Gross pay');
  const retirementInputCents = input.retirementContributionCents ?? 0;
  validateMoney(retirementInputCents, 'Retirement contribution');
  const hours = input.hoursPerWeek ?? 0;
  if (!['monthly', 'annual', 'weekly', 'hourly'].includes(input.period)) throw new TypeError('Choose a valid pay period.');
  if (input.period === 'hourly' && (!Number.isFinite(hours) || hours <= 0 || hours > 168)) {
    throw new RangeError('Weekly hours must be more than 0 and no more than 168.');
  }
  const dependants = input.medicalAidMembers ?? 0;
  if (!Number.isInteger(dependants) || dependants < 0 || dependants > 20) {
    throw new RangeError('Medical aid dependants must be a whole number from 0 to 20.');
  }
  if (!['under65', 'age65to74', 'age75plus'].includes(input.ageGroup)) throw new TypeError('Choose a valid age group.');

  const annualGrossCents = annualise(input.grossCents, input.period, hours);
  const annualRetirementInputCents = input.period === 'annual' ? retirementInputCents : retirementInputCents * 12;
  const annualRetirementDeductionCents = Math.min(
    annualRetirementInputCents,
    Math.round(annualGrossCents * taxTables2026_27.retirementDeductionRate),
    taxTables2026_27.retirementDeductionCapCents,
  );
  const taxableIncomeCents = Math.max(0, annualGrossCents - annualRetirementDeductionCents);
  const { taxCents: grossTaxCents, marginalRate } = annualTax(taxableIncomeCents);
  const ageRebateCents = input.ageGroup === 'age75plus'
    ? taxTables2026_27.rebatesCents.primary + taxTables2026_27.rebatesCents.secondary + taxTables2026_27.rebatesCents.tertiary
    : input.ageGroup === 'age65to74'
      ? taxTables2026_27.rebatesCents.primary + taxTables2026_27.rebatesCents.secondary
      : taxTables2026_27.rebatesCents.primary;
  const thresholdCents = taxTables2026_27.annualThresholdCents[input.ageGroup];
  const annualRebateCents = Math.min(grossTaxCents, ageRebateCents);
  const annualTaxAfterRebateCents = taxableIncomeCents <= thresholdCents
    ? 0
    : Math.max(0, grossTaxCents - ageRebateCents);
  const monthlyMedicalCreditCents = dependants === 0 ? 0
    : taxTables2026_27.medicalCreditsMonthlyCents.main
      + (dependants >= 2 ? taxTables2026_27.medicalCreditsMonthlyCents.firstDependant : 0)
      + Math.max(0, dependants - 2) * taxTables2026_27.medicalCreditsMonthlyCents.eachAdditional;
  const monthlyPayableTaxCents = Math.max(0, Math.round(annualTaxAfterRebateCents / 12) - monthlyMedicalCreditCents);
  const monthlyGrossCents = Math.round(annualGrossCents / 12);
  const monthlyRetirementDeductionCents = Math.round(annualRetirementDeductionCents / 12);
  const monthlyUifCents = Math.min(monthlyGrossCents, taxTables2026_27.uifMonthlyEarningsCeilingCents)
    * taxTables2026_27.uifRate;
  const monthlyUifRoundedCents = Math.round(monthlyUifCents);
  return {
    annualGrossCents,
    monthlyGrossCents,
    annualRetirementDeductionCents,
    monthlyRetirementDeductionCents,
    taxableIncomeCents,
    annualTaxBeforeCreditsCents: annualTaxAfterRebateCents,
    monthlyPayeCents: monthlyPayableTaxCents,
    monthlyUifCents: monthlyUifRoundedCents,
    monthlyNetCents: monthlyGrossCents - monthlyPayableTaxCents - monthlyUifRoundedCents - monthlyRetirementDeductionCents,
    annualRebateCents,
    monthlyMedicalCreditCents,
    effectiveTaxRate: monthlyGrossCents > 0 ? monthlyPayableTaxCents / monthlyGrossCents : 0,
    marginalRate,
    uifStipendHint: false,
  };
}

export function estimateStipendTakeHome(input: TaxEstimateInput & { isStipend: boolean }): TaxEstimate {
  const estimate = estimateSouthAfricanTakeHome(input);
  return { ...estimate, uifStipendHint: input.isStipend };
}

export function formatRand(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new TypeError('Currency values must be represented as integer cents.');
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseRandToCents(value: string): number {
  const normalized = value.replace(/[\s,]/g, '');
  if (!/^\d{1,8}(?:\.\d{0,2})?$/.test(normalized)) throw new TypeError('Enter a non-negative amount with up to two decimal places.');
  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  validateMoney(cents, 'Amount');
  return cents;
}
