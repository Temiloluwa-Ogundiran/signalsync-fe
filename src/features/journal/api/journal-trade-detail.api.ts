import apiClient, { withAuth } from "@/lib/api/client";
import type { Setup, TradeNote } from "../types";

export const journalTradeDetailApi = {
  // --- Per-trade note (plain text) ---
  getTradeNote: async (tradeId: string, token?: string): Promise<TradeNote> => {
    const { data } = await apiClient.get<TradeNote>(
      `/journal/trades/${tradeId}/note`,
      withAuth(token)
    );
    return data;
  },

  saveTradeNote: async (
    tradeId: string,
    noteHtml: string | null,
    token?: string
  ): Promise<TradeNote> => {
    const { data } = await apiClient.put<TradeNote>(
      `/journal/trades/${tradeId}/note`,
      { note_html: noteHtml },
      withAuth(token)
    );
    return data;
  },

  // --- Per-trade setup assignment ---
  updateTradeSetup: async (
    tradeId: string,
    setup: string | null,
    token?: string
  ): Promise<{ setup: string | null }> => {
    const { data } = await apiClient.put<{ setup: string | null }>(
      `/journal/trades/${tradeId}/setup`,
      { setup },
      withAuth(token)
    );
    return data;
  },

  // --- Setups list (flat playbook names) ---
  listSetups: async (token?: string): Promise<Setup[]> => {
    const { data } = await apiClient.get<Setup[]>(
      "/journal/setups",
      withAuth(token)
    );
    return data;
  },

  createSetup: async (name: string, token?: string): Promise<Setup> => {
    const { data } = await apiClient.post<Setup>(
      "/journal/setups",
      { name },
      withAuth(token)
    );
    return data;
  },

  deleteSetup: async (setupId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/journal/setups/${setupId}`, withAuth(token));
  },

  reorderSetups: async (ids: string[], token?: string): Promise<void> => {
    await apiClient.put("/journal/setups/reorder", { ids }, withAuth(token));
  },
};
