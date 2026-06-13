import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalCreateMessagePayload,
  JournalMessage,
  JournalOpenPositionListResponse,
  JournalReviewedAtResponse,
  JournalTradeListResponse,
} from "../types";

export const journalTradesApi = {
  listByDay: async (
    accountId: string,
    tradingDate: string,
    includeManual?: boolean,
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
          include_manual: includeManual !== undefined ? includeManual : undefined,
        },
      },
    );

    return data;
  },

  listRecent: async (
    accountId: string,
    fromDate: string,
    toDate: string,
    cursorOrLimit?: string | number,
    includeManual?: boolean,
    token?: string,
  ): Promise<JournalTradeListResponse> => {
    const cursor =
      typeof cursorOrLimit === "string" ? cursorOrLimit : undefined;
    const limit =
      typeof cursorOrLimit === "number" ? cursorOrLimit : 100;
    const { data } = await apiClient.get<JournalTradeListResponse>("/journal/trades", {
      ...withAuth(token),
      params: {
        account_id: accountId,
        from_date: fromDate,
        to_date: toDate,
        limit,
        cursor,
        include_manual: includeManual !== undefined ? includeManual : undefined,
      },
    });

    return data;
  },

  listOpenPositions: async (
    accountId: string,
    limit = 50,
    token?: string,
  ): Promise<JournalOpenPositionListResponse> => {
    const { data } = await apiClient.get<JournalOpenPositionListResponse>(
      "/journal/trades/positions",
      {
        ...withAuth(token),
        params: {
          account_id: accountId,
          limit,
        },
      },
    );

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
    options?: { signal?: AbortSignal },
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
        signal: options?.signal,
        headers: {
          ...withAuth(token).headers,
          "Content-Type": null,
        },
      },
    );

    return data;
  },

  markTradeReviewed: async (
    tradeId: string,
    token?: string,
  ): Promise<JournalReviewedAtResponse> => {
    const { data } = await apiClient.post<JournalReviewedAtResponse>(
      `/journal/trades/${tradeId}/review`,
      undefined,
      withAuth(token),
    );
    return data;
  },
};
