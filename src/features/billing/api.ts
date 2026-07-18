import apiClient, { withAuth } from "@/lib/api/client";
import type { BillingPlan } from "./subscription-pricing";

export type BillingStatus = "active" | "past_due" | "unpaid" | "canceled";

export interface Subscription {
  plan: BillingPlan | null;
  status: BillingStatus | null;
  has_journal_access: boolean;
  has_copy_access: boolean;
  copy_account_limit: number;
  current_period_end: string | null;
  grace_ends_at: string | null;
  cancel_at_period_end: boolean;
  pending_plan: BillingPlan | null;
  pending_copy_account_limit: number | null;
  pending_effective_at: string | null;
}

export interface CheckoutResult {
  action: "checkout" | "updated" | "scheduled";
  checkout_url: string | null;
  subscription: Subscription;
}

export async function getSubscription(token?: string): Promise<Subscription> {
  return (
    await apiClient.get<Subscription>("/billing/me", withAuth(token))
  ).data;
}

export async function startCheckout(
  payload: { plan: BillingPlan; copy_accounts: number },
  token?: string,
): Promise<CheckoutResult> {
  return (
    await apiClient.post<CheckoutResult>(
      "/billing/checkout",
      payload,
      withAuth(token),
    )
  ).data;
}

export async function cancelSubscription(token?: string) {
  return (
    await apiClient.delete<{
      message: string;
      subscription: Subscription;
    }>("/billing/subscription", withAuth(token))
  ).data;
}

