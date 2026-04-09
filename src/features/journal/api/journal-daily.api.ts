import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalCreateMessagePayload,
  JournalDailyResponse,
  JournalMessage,
} from "../types";

export const journalDailyApi = {
  getDay: async (
    accountId: string,
    tradingDate: string,
    includeMessages = true,
    token?: string,
  ): Promise<JournalDailyResponse> => {
    const { data } = await apiClient.get<JournalDailyResponse>(
      `/journal/daily/${accountId}/${tradingDate}`,
      {
        ...withAuth(token),
        params: {
          include_messages: includeMessages,
        },
      },
    );
    return data;
  },

  createDayMessage: async (
    dailyJournalId: string,
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
      `/journal/daily/${dailyJournalId}/messages`,
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
