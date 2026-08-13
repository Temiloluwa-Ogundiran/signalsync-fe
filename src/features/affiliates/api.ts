import apiClient, { withAuth } from "@/lib/api/client";

export type CommissionStatus = "pending" | "available" | "paid" | "reversed";

export interface AffiliateCommission {
  id: string;
  currency: string;
  commission_base: string;
  commission_rate: string;
  commission_amount: string;
  reversed_amount: string;
  status: CommissionStatus;
  release_at: string;
  created_at: string;
}

export interface AffiliateDashboard {
  code: string;
  referral_url: string;
  status: "active" | "suspended";
  effective_commission_rate: string;
  rate_source: "global" | "individual";
  referrals: number;
  paid_referrals: number;
  pending_balance: string;
  available_balance: string;
  paid_balance: string;
  minimum_payout: string;
  commission_hold_days: number;
  recurring_months: number;
  commissions: AffiliateCommission[];
}

export async function getAffiliateDashboard(token?: string) {
  return (await apiClient.get<AffiliateDashboard>("/affiliates/me", withAuth(token))).data;
}

export async function validateReferralCode(code: string) {
  return (await apiClient.get<{ valid: boolean }>("/affiliates/validate", { params: { code } })).data;
}
