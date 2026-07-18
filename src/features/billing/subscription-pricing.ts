export type BillingPlan = "journal" | "copy";

export function copyMonthlyPrice(accountCount: number): number {
  const safeCount = Math.min(10, Math.max(1, Math.trunc(accountCount)));
  return 30 + (safeCount - 1) * 20;
}

export function planRequest(plan: BillingPlan, accountCount: number) {
  return {
    plan,
    copy_accounts:
      plan === "copy"
        ? Math.min(10, Math.max(1, Math.trunc(accountCount)))
        : 1,
  };
}
