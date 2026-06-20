import apiClient, { withAuth } from "@/lib/api/client";
import type {
  AiSession,
  AiSessionListResponse,
  AiSessionWithMessages,
  AiUsage,
  CoachRead,
} from "../types";

export const aiApi = {
  createSession: async (
    payload: {
      title?: string;
      context_type?: string;
      context_ref?: string;
      account_id?: string;
    },
    token?: string,
  ): Promise<AiSession> => {
    const { data } = await apiClient.post<AiSession>(
      "/ai/sessions",
      payload,
      withAuth(token),
    );
    return data;
  },

  listSessions: async (token?: string): Promise<AiSessionListResponse> => {
    const { data } = await apiClient.get<AiSessionListResponse>(
      "/ai/sessions",
      withAuth(token),
    );
    return data;
  },

  getSession: async (
    sessionId: string,
    token?: string,
  ): Promise<AiSessionWithMessages> => {
    const { data } = await apiClient.get<AiSessionWithMessages>(
      `/ai/sessions/${sessionId}`,
      withAuth(token),
    );
    return data;
  },

  deleteSession: async (sessionId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/ai/sessions/${sessionId}`, withAuth(token));
  },

  getSuggestions: async (token?: string): Promise<string[]> => {
    const { data } = await apiClient.get<{ prompts: string[] }>(
      "/ai/suggestions",
      withAuth(token),
    );
    return data.prompts;
  },

  getUsage: async (token?: string): Promise<AiUsage> => {
    const { data } = await apiClient.get<AiUsage>("/ai/usage", withAuth(token));
    return data;
  },

  getCoachRead: async (
    accountId: string,
    date: string,
    options?: { refresh?: boolean },
    token?: string,
  ): Promise<CoachRead> => {
    const { data } = await apiClient.get<CoachRead>("/ai/coach-read", {
      ...withAuth(token),
      params: { account_id: accountId, date, refresh: options?.refresh },
    });
    return data;
  },
};
