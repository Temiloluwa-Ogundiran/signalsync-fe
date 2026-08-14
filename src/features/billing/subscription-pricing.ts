export type BillingPlan = "journal" | "copy";

export function normalizeCopyAccountCount(accountCount: number): number {
  return Math.min(10, Math.max(1, Math.trunc(accountCount)));
}

export function copyMonthlyPrice(accountCount: number): number {
  const safeCount = normalizeCopyAccountCount(accountCount);
  return 30 + (safeCount - 1) * 20;
}

export function planRequest(plan: BillingPlan, accountCount: number) {
  return {
    plan,
    copy_accounts:
      plan === "copy"
        ? normalizeCopyAccountCount(accountCount)
        : 1,
  };
}
