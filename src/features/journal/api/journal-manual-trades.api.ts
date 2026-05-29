import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalTrade,
  ManualTradeCreatePayload,
  ManualTradeUpdatePayload,
} from "../types";

export const journalManualTradesApi = {
  create: async (
    accountId: string,
    payload: ManualTradeCreatePayload,
    token?: string
  ): Promise<JournalTrade> => {
    const { data } = await apiClient.post<JournalTrade>(
      "/journal/trades/manual",
      payload,
      {
        ...withAuth(token),
        params: {
          account_id: accountId,
        },
      }
    );
    return data;
  },

  update: async (
    tradeId: string,
    payload: ManualTradeUpdatePayload,
    token?: string
  ): Promise<JournalTrade> => {
    const { data } = await apiClient.patch<JournalTrade>(
      `/journal/trades/manual/${tradeId}`,
      payload,
      withAuth(token)
    );
    return data;
  },

  delete: async (
    tradeId: string,
    token?: string
  ): Promise<void> => {
    await apiClient.delete(
      `/journal/trades/manual/${tradeId}`,
      withAuth(token)
    );
  },
};
