import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalCreateMessagePayload,
  JournalMessage,
  JournalTradeListResponse,
} from "../types";

export const journalTradesApi = {
  listByDay: async (
    accountId: string,
    tradingDate: string,
    token?: string,
  ): Promise<JournalTradeListResponse> => {
    const { data } = await apiClient.get<JournalTradeListResponse>(
      "/journal/trades",
      {
        ...withAuth(token),
        params: {
          account_id: accountId,
          from_date: tradingDate,
          to_date: tradingDate,
          limit: 200,
        },
      },
    );

    return data;
  },

  listRecent: async (
    accountId: string,
    fromDate: string,
    toDate: string,
    limit: number,
    token?: string,
  ): Promise<JournalTradeListResponse> => {
    const { data } = await apiClient.get<JournalTradeListResponse>("/journal/trades", {
      ...withAuth(token),
      params: {
        account_id: accountId,
        from_date: fromDate,
        to_date: toDate,
        limit,
      },
    });

    return data;
  },

  getTradeJournalMessages: async (
    tradeId: string,
    token?: string,
  ): Promise<JournalMessage[]> => {
    const { data } = await apiClient.get<JournalMessage[]>(
      `/journal/trades/${tradeId}/journal`,
      withAuth(token),
    );
    return data;
  },

  createTradeMessage: async (
    tradeId: string,
    payload: JournalCreateMessagePayload,
    token?: string,
  ): Promise<JournalMessage> => {
    const body = new FormData();
    const messageType =
      payload.messageType ??
      (payload.file?.type.startsWith("image/")
        ? "image"
        : payload.file?.type.startsWith("audio/")
          ? "voice"
          : "text");

    body.append("message_type", messageType);
    if (payload.content) {
      body.append("content", payload.content);
    }
    if (payload.file) {
      body.append("file", payload.file);
    }

    const { data } = await apiClient.post<JournalMessage>(
      `/journal/trades/${tradeId}/messages`,
      body,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  },
};
