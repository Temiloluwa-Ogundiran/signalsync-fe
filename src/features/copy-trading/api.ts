import apiClient, { withAuth } from "@/lib/api/client";
import type {
  CopyAccountPolicy,
  CopyActivity,
  CopyRoute,
  CopyTradingSettings,
  CopyTargetAccount,
  CopyRouteInput,
  TelegramAuth,
  TelegramConnection,
  TelegramDialog,
  TelegramSource,
} from "./types";

export const copyTradingApi = {
  listTargetAccounts: async (token?: string): Promise<CopyTargetAccount[]> => {
    const { data } = await apiClient.get<CopyTargetAccount[]>(
      "/accounts",
      withAuth(token),
    );
    return data.filter(
      (account) => !account.is_archived && account.connection_state === "ready",
    );
  },

  getSettings: async (token?: string): Promise<CopyTradingSettings> => {
    const { data } = await apiClient.get<CopyTradingSettings>(
      "/copy-trading/settings",
      withAuth(token),
    );
    return data;
  },

  updateSettings: async (
    isPaused: boolean,
    token?: string,
  ): Promise<CopyTradingSettings> => {
    const { data } = await apiClient.patch<CopyTradingSettings>(
      "/copy-trading/settings",
      { is_paused: isPaused },
      withAuth(token),
    );
    return data;
  },

  listRoutes: async (token?: string): Promise<CopyRoute[]> => {
    const { data } = await apiClient.get<CopyRoute[]>(
      "/copy-trading/routes",
      withAuth(token),
    );
    return data;
  },

  listAccountPolicies: async (token?: string): Promise<CopyAccountPolicy[]> => {
    const { data } = await apiClient.get<CopyAccountPolicy[]>(
      "/copy-trading/account-policies",
      withAuth(token),
    );
    return data;
  },

  updateAccountPolicy: async (
    accountId: string,
    payload: { max_lot?: string; is_paused?: boolean },
    token?: string,
  ): Promise<CopyAccountPolicy> => {
    const { data } = await apiClient.patch<CopyAccountPolicy>(
      `/copy-trading/account-policies/${accountId}`,
      payload,
      withAuth(token),
    );
    return data;
  },

  listActivity: async (token?: string): Promise<CopyActivity[]> => {
    const { data } = await apiClient.get<CopyActivity[]>(
      "/copy-trading/activity",
      { ...withAuth(token), params: { limit: 50 } },
    );
    return data;
  },

  listConnections: async (token?: string): Promise<TelegramConnection[]> =>
    (await apiClient.get<TelegramConnection[]>("/copy-trading/telegram/connections", withAuth(token))).data,
  startPhoneAuth: async (phone: string, token?: string): Promise<TelegramAuth> =>
    (await apiClient.post<TelegramAuth>("/copy-trading/telegram/auth/phone", { phone }, withAuth(token))).data,
  startQrAuth: async (token?: string): Promise<TelegramAuth> =>
    (await apiClient.post<TelegramAuth>("/copy-trading/telegram/auth/qr", {}, withAuth(token))).data,
  getAuth: async (authId: string, token?: string): Promise<TelegramAuth> =>
    (await apiClient.get<TelegramAuth>(`/copy-trading/telegram/auth/${authId}`, withAuth(token))).data,
  submitCode: async (authId: string, code: string, token?: string): Promise<TelegramAuth> =>
    (await apiClient.post<TelegramAuth>(`/copy-trading/telegram/auth/${authId}/code`, { code }, withAuth(token))).data,
  submitPassword: async (authId: string, password: string, token?: string): Promise<TelegramAuth> =>
    (await apiClient.post<TelegramAuth>(`/copy-trading/telegram/auth/${authId}/password`, { password }, withAuth(token))).data,
  disconnect: async (connectionId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/copy-trading/telegram/connections/${connectionId}`, withAuth(token));
  },
  pauseConnection: async (connectionId: string, isPaused: boolean, token?: string): Promise<TelegramConnection> =>
    (await apiClient.patch<TelegramConnection>(`/copy-trading/telegram/connections/${connectionId}`, { is_paused: isPaused }, withAuth(token))).data,
  listDialogs: async (connectionId: string, token?: string): Promise<TelegramDialog[]> =>
    (await apiClient.get<TelegramDialog[]>(`/copy-trading/telegram/connections/${connectionId}/dialogs`, withAuth(token))).data,
  listSources: async (token?: string): Promise<TelegramSource[]> =>
    (await apiClient.get<TelegramSource[]>("/copy-trading/sources", withAuth(token))).data,
  createSource: async (payload: Omit<TelegramSource, "id" | "state" | "unsupported_reason" | "is_paused" | "profile">, token?: string): Promise<TelegramSource> =>
    (await apiClient.post<TelegramSource>("/copy-trading/sources", payload, withAuth(token))).data,
  pauseSource: async (sourceId: string, isPaused: boolean, token?: string): Promise<TelegramSource> =>
    (await apiClient.patch<TelegramSource>(`/copy-trading/sources/${sourceId}/pause`, { is_paused: isPaused }, withAuth(token))).data,
  deleteSource: async (sourceId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/copy-trading/sources/${sourceId}`, withAuth(token));
  },
  revealActivityRaw: async (eventId: string, token?: string): Promise<{ raw_message: string | null }> =>
    (await apiClient.get<{ raw_message: string | null }>(`/copy-trading/activity/${eventId}/raw`, withAuth(token))).data,
  createRoute: async (payload: CopyRouteInput, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>("/copy-trading/routes", payload, withAuth(token))).data,
  activateRoute: async (routeId: string, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>(`/copy-trading/routes/${routeId}/activate`, {}, withAuth(token))).data,
  pauseRoute: async (routeId: string, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>(`/copy-trading/routes/${routeId}/pause`, {}, withAuth(token))).data,
  resumeRoute: async (routeId: string, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>(`/copy-trading/routes/${routeId}/resume`, {}, withAuth(token))).data,
  emergency: async (payload: { action: string; scope: string; scope_id?: string; confirmation: string }, token?: string) =>
    (await apiClient.post("/copy-trading/emergency", payload, withAuth(token))).data,
};
