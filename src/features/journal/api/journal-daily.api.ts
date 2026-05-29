import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAdjacentTradedDatesResponse,
  JournalCreateMessagePayload,
  JournalDailyResponse,
  JournalMessage,
  JournalReviewedAtResponse,
} from "../types";

export const journalDailyApi = {
  getDay: async (
    accountId: string,
    tradingDate: string,
    includeMessages = true,
    includeManual?: boolean,
    token?: string,
  ): Promise<JournalDailyResponse> => {
    const { data } = await apiClient.get<JournalDailyResponse>(
      `/journal/daily/${accountId}/${tradingDate}`,
      {
        ...withAuth(token),
        params: {
          include_messages: includeMessages,
          include_manual: includeManual !== undefined ? includeManual : undefined,
        },
      },
    );
    return data;
  },

  getAdjacentTradedDates: async (
    accountId: string,
    tradingDate: string,
    token?: string,
  ): Promise<JournalAdjacentTradedDatesResponse> => {
    const { data } = await apiClient.get<JournalAdjacentTradedDatesResponse>(
      `/journal/daily/${accountId}/adjacent-traded-dates`,
      {
        ...withAuth(token),
        params: { trading_date: tradingDate },
      },
    );
    return data;
  },

  markDayReviewed: async (
    dailyJournalId: string,
    token?: string,
  ): Promise<JournalReviewedAtResponse> => {
    const { data } = await apiClient.post<JournalReviewedAtResponse>(
      `/journal/daily/${dailyJournalId}/review`,
      undefined,
      withAuth(token),
    );
    return data;
  },

  createDayMessage: async (
    dailyJournalId: string,
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
      `/journal/daily/${dailyJournalId}/messages`,
      body,
      {
        ...withAuth(token),
        signal: options?.signal,
        headers: {
          ...withAuth(token).headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  },
};
