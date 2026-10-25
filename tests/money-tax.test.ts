import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateSouthAfricanTakeHome, estimateStipendTakeHome } from '../src/lib/money/tax';

const under65 = { period: 'monthly' as const, ageGroup: 'under65' as const };

test('estimates the requested monthly salary examples', () => {
  const cases = [
    [8_000, 0, 7_920],
    [15_000, 1_215, 13_635],
    [30_000, 3_915, 25_785],
    [60_000, 14_736.08, 44_663.92],
    [150_000, 51_357.75, 98_465.13],
  ] as const;
  for (const [gross, paye, net] of cases) {
    const result = estimateSouthAfricanTakeHome({ ...under65, grossCents: gross * 100 });
    assert.equal(result.monthlyPayeCents, paye * 100, `PAYE at R${gross.toLocaleString('en-ZA')}`);
    assert.equal(result.monthlyNetCents, net * 100, `net pay at R${gross.toLocaleString('en-ZA')}`);
  }
});

test('applies the listed tax bracket boundaries and marginal rates', () => {
  const atFirstCeiling = estimateSouthAfricanTakeHome({
    grossCents: 24_510_000,
    period: 'annual',
    ageGroup: 'under65',
  });
  const oneRandAbove = estimateSouthAfricanTakeHome({
    grossCents: 24_510_100,
    period: 'annual',
    ageGroup: 'under65',
  });
  assert.equal(atFirstCeiling.marginalRate, 0.18);
  assert.equal(oneRandAbove.marginalRate, 0.26);
  assert.equal(atFirstCeiling.taxableIncomeCents, 24_510_000);
  assert.equal(oneRandAbove.taxableIncomeCents, 24_510_100);
});

test('caps UIF, applies medical credits, and caps retirement deductions', () => {
  const cappedUif = estimateSouthAfricanTakeHome({ ...under65, grossCents: 2_000_000 });
  assert.equal(cappedUif.monthlyUifCents, 17_712);
  const medical = estimateSouthAfricanTakeHome({
    ...under65,
    grossCents: 3_000_000,
    medicalAidMembers: 3,
  });
  assert.equal(medical.monthlyMedicalCreditCents, 100_600);
  const retirement = estimateSouthAfricanTakeHome({
    ...under65,
    grossCents: 15_000_000,
    retirementContributionCents: 5_000_000,
  });
  assert.equal(retirement.annualRetirementDeductionCents, 35_000_000);
});

test('keeps stipend UIF wording as a contract-check hint without assuming an exemption', () => {
  const result = estimateStipendTakeHome({ ...under65, grossCents: 1_000_000, isStipend: true });
  assert.equal(result.uifStipendHint, true);
  assert.equal(result.monthlyUifCents, 10_000);
});

test('rejects invalid pay amounts and dependants', () => {
  assert.throws(() => estimateSouthAfricanTakeHome({ ...under65, grossCents: -1 }), RangeError);
  assert.throws(() => estimateSouthAfricanTakeHome({ ...under65, grossCents: 1_000_000, medicalAidMembers: 21 }), RangeError);
});
