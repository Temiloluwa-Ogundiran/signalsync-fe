import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAccount,
  JournalAccountConnectPayload,
  JournalAccountSyncResult,
} from "../types";

export const journalAccountApi = {
  connectAccount: async (
    payload: JournalAccountConnectPayload,
    token?: string,
  ): Promise<JournalAccount> => {
    const { data } = await apiClient.post<JournalAccount>(
      "/accounts",
      payload,
      withAuth(token),
    );

    return data;
  },

  listAccounts: async (token?: string): Promise<JournalAccount[]> => {
    const { data } = await apiClient.get<JournalAccount[]>(
      "/accounts",
      withAuth(token),
    );

    return data;
  },

  syncAccount: async (
    accountId: string,
    token?: string,
  ): Promise<JournalAccountSyncResult> => {
    const { data } = await apiClient.post<JournalAccountSyncResult>(
      `/accounts/${accountId}/sync`,
      null,
      withAuth(token),
    );

    return data;
  },
};
