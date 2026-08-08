import apiClient, { withAuth } from "@/lib/api/client";
import type {
  CopyAccountPolicy,
  CopyActivityFilters,
  CopyActivityPage,
  CopyLaunchReadiness,
  CopyRoute,
  CopyTradingSettings,
  CopyTradingConnection,
  CopyTradingConnectionInput,
  CopySystemHealth,
  CopyRouteInput,
  CopyExecutionLatency,
  CopySignalReview,
  CopyRoutePreview,
  TelegramAuth,
  TelegramConnection,
  TelegramDialog,
  TelegramSource,
} from "./types";

export const copyTradingApi = {
  listCopyConnections: async (token?: string): Promise<CopyTradingConnection[]> =>
    (await apiClient.get<CopyTradingConnection[]>("/copy-trading/connections", withAuth(token))).data,

  createCopyConnection: async (payload: CopyTradingConnectionInput, token?: string): Promise<CopyTradingConnection> =>
    (await apiClient.post<CopyTradingConnection>("/copy-trading/connections", payload, withAuth(token))).data,

  retryCopyConnection: async (connectionId: string, token?: string): Promise<CopyTradingConnection> =>
    (await apiClient.post<CopyTradingConnection>(`/copy-trading/connections/${connectionId}/retry`, {}, withAuth(token))).data,

  deleteCopyConnection: async (connectionId: string, token?: string): Promise<CopyTradingConnection> =>
    (await apiClient.delete<CopyTradingConnection>(`/copy-trading/connections/${connectionId}`, withAuth(token))).data,

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
    connectionId: string,
    payload: { max_lot?: string; is_paused?: boolean },
    token?: string,
  ): Promise<CopyAccountPolicy> => {
    const { data } = await apiClient.patch<CopyAccountPolicy>(
      `/copy-trading/account-policies/${connectionId}`,
      payload,
      withAuth(token),
    );
    return data;
  },

  listActivity: async (
    params: CopyActivityFilters = {},
    token?: string,
  ): Promise<CopyActivityPage> => {
    const { data } = await apiClient.get<CopyActivityPage>(
      "/copy-trading/activity",
      {
        ...withAuth(token),
        params: {
          limit: params.limit ?? 50,
          cursor: params.cursor,
          level: params.level,
          source_id: params.source_id,
          connection_id: params.connection_id,
          search: params.search,
        },
      },
    );
    return data;
  },

  getLatency: async (token?: string): Promise<CopyExecutionLatency> =>
    (await apiClient.get<CopyExecutionLatency>("/copy-trading/latency", withAuth(token))).data,

  listSignalReviews: async (token?: string): Promise<CopySignalReview[]> =>
    (await apiClient.get<CopySignalReview[]>("/copy-trading/signal-reviews", withAuth(token))).data,

  approveSignalReview: async (reviewId: string, conversationId: string, token?: string): Promise<CopySignalReview> =>
    (await apiClient.post<CopySignalReview>(`/copy-trading/signal-reviews/${reviewId}/approve`, { conversation_id: conversationId }, withAuth(token))).data,

  ignoreSignalReview: async (reviewId: string, token?: string): Promise<CopySignalReview> =>
    (await apiClient.post<CopySignalReview>(`/copy-trading/signal-reviews/${reviewId}/ignore`, {}, withAuth(token))).data,

  getHealth: async (token?: string): Promise<CopySystemHealth> =>
    (
      await apiClient.get<CopySystemHealth>(
        "/copy-trading/health",
        withAuth(token),
      )
    ).data,

  getLaunchReadiness: async (token?: string): Promise<CopyLaunchReadiness> =>
    (
      await apiClient.get<CopyLaunchReadiness>(
        "/copy-trading/launch-readiness",
        withAuth(token),
      )
    ).data,

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
  listDialogs: async (
    connectionId: string,
    token?: string,
    refresh = false,
  ): Promise<TelegramDialog[]> =>
    (
      await apiClient.get<TelegramDialog[]>(
        `/copy-trading/telegram/connections/${connectionId}/dialogs`,
        {
          ...withAuth(token),
          params: { refresh },
          timeout: refresh ? 10_000 : undefined,
        },
      )
    ).data,
  listSources: async (token?: string): Promise<TelegramSource[]> =>
    (await apiClient.get<TelegramSource[]>("/copy-trading/sources", withAuth(token))).data,
  createSource: async (payload: Omit<TelegramSource, "id" | "state" | "is_paused">, token?: string): Promise<TelegramSource> =>
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
  updateRoute: async (routeId: string, payload: Partial<CopyRouteInput>, token?: string): Promise<CopyRoute> =>
    (await apiClient.patch<CopyRoute>(`/copy-trading/routes/${routeId}`, payload, withAuth(token))).data,
  previewRoute: async (routeId: string, text: string, token?: string): Promise<CopyRoutePreview> =>
    (await apiClient.post<CopyRoutePreview>(`/copy-trading/routes/${routeId}/preview`, { text }, withAuth(token))).data,
  activateRoute: async (routeId: string, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>(`/copy-trading/routes/${routeId}/activate`, {}, withAuth(token))).data,
  pauseRoute: async (routeId: string, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>(`/copy-trading/routes/${routeId}/pause`, {}, withAuth(token))).data,
  resumeRoute: async (routeId: string, token?: string): Promise<CopyRoute> =>
    (await apiClient.post<CopyRoute>(`/copy-trading/routes/${routeId}/resume`, {}, withAuth(token))).data,
  deleteRoute: async (routeId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/copy-trading/routes/${routeId}`, withAuth(token));
  },
  emergency: async (payload: { action: string; scope: string; scope_id?: string; confirmation: string }, token?: string) =>
    (await apiClient.post("/copy-trading/emergency", payload, withAuth(token))).data,
};
