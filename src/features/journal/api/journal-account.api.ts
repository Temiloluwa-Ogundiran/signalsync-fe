import apiClient, { withAuth } from "@/lib/api/client";
import type { JournalAccount, JournalAccountConnectPayload } from "../types";

export const journalAccountApi = {
  connectAccount: async (
    payload: JournalAccountConnectPayload,
    token?: string,
  ): Promise<JournalAccount> => {
    const { data } = await apiClient.post<JournalAccount>(
      "/journal/accounts",
      payload,
      withAuth(token),
    );

    return data;
  },

  listAccounts: async (token?: string): Promise<JournalAccount[]> => {
    const { data } = await apiClient.get<JournalAccount[]>(
      "/journal/accounts",
      withAuth(token),
    );

    return data;
  },
};
