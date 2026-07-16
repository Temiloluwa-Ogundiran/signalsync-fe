import apiClient, { withAuth } from "@/lib/api/client";
import type { AdminOverview, AdminSystem, AdminUserDetail, AdminUserPage, AuditPage, PlatformRole } from "./types";

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
};
