export type BudgetAmounts = {
  rentCents: number;
  transportCents: number;
  foodCents: number;
  airtimeCents: number;
  familySupportCents: number;
  debtRepaymentsCents: number;
  subscriptionsCents: number;
};

export function calculateMonthlyBudget(netTakeHomeCents: number, budget: BudgetAmounts) {
  const needsCents = budget.rentCents + budget.transportCents + budget.foodCents
    + budget.airtimeCents + budget.familySupportCents;
  const wantsCents = budget.subscriptionsCents;
  const debtCents = budget.debtRepaymentsCents;
  const allocatedCents = needsCents + wantsCents + debtCents;
  const surplusCents = netTakeHomeCents - allocatedCents;
  return {
    needsCents,
    wantsCents,
    debtCents,
    allocatedCents,
    surplusCents,
    shortfallCents: Math.max(0, -surplusCents),
    needsShare: netTakeHomeCents > 0 ? needsCents / netTakeHomeCents : 0,
    needsOver60Percent: netTakeHomeCents > 0 && needsCents / netTakeHomeCents > 0.6,
  };
}
