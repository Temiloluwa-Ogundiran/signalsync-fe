import apiClient, { withAuth } from "@/lib/api/client";
import type { AdminAffiliatePage, AdminAffiliateSettings, AdminOverview, AdminSystem, AdminUserDetail, AdminUserPage, AuditPage, PlatformRole } from "./types";

export const adminApi = {
  overview: async (token?: string) =>
    (await apiClient.get<AdminOverview>("/admin/overview", withAuth(token))).data,
  users: async (token: string | undefined, params: Record<string, string>) =>
    (await apiClient.get<AdminUserPage>("/admin/users", { ...withAuth(token), params })).data,
  user: async (token: string | undefined, id: string) =>
    (await apiClient.get<AdminUserDetail>(`/admin/users/${id}`, withAuth(token))).data,
  suspend: async (token: string | undefined, id: string, reason: string) =>
    apiClient.post(`/admin/users/${id}/suspend`, { reason }, withAuth(token)),
  restore: async (token: string | undefined, id: string) =>
    apiClient.post(`/admin/users/${id}/restore`, {}, withAuth(token)),
  revokeSessions: async (token: string | undefined, id: string) =>
    apiClient.post(`/admin/users/${id}/revoke-sessions`, {}, withAuth(token)),
  role: async (token: string | undefined, id: string, role: PlatformRole, reason: string) =>
    apiClient.put(`/admin/users/${id}/role`, { role, reason }, withAuth(token)),
  system: async (token?: string) =>
    (await apiClient.get<AdminSystem>("/admin/system", withAuth(token))).data,
  audit: async (token?: string) =>
    (await apiClient.get<AuditPage>("/admin/audit", withAuth(token))).data,
  affiliates: async (token?: string) =>
    (await apiClient.get<AdminAffiliatePage>("/admin/affiliates", withAuth(token))).data,
  affiliateSettings: async (token?: string) =>
    (await apiClient.get<AdminAffiliateSettings>("/admin/affiliates/settings", withAuth(token))).data,
  updateAffiliateSettings: async (token: string | undefined, payload: {
    default_commission_rate: string;
    commission_hold_days: number;
    recurring_months: number;
    minimum_payout: string;
    clear_individual_overrides: boolean;
    reason: string;
  }) => (await apiClient.put<AdminAffiliateSettings>("/admin/affiliates/settings", payload, withAuth(token))).data,
  updateAffiliateRate: async (token: string | undefined, userId: string, payload: { commission_rate: string | null; reason: string }) =>
    apiClient.put(`/admin/affiliates/${userId}/rate`, payload, withAuth(token)),
};
