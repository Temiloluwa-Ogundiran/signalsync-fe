import apiClient, { withAuth } from "@/lib/api/client";
import type { JournalMessage } from "../types";

export const journalMessagesApi = {
  updateMessage: async (
    messageId: string,
    content: string,
    token?: string,
  ): Promise<JournalMessage> => {
    const { data } = await apiClient.patch<JournalMessage>(
      `/journal/messages/${messageId}`,
      { content },
      withAuth(token),
    );
    return data;
  },

  deleteMessage: async (
    messageId: string,
    token?: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/journal/messages/${messageId}`,
      withAuth(token),
    );
  },
};
