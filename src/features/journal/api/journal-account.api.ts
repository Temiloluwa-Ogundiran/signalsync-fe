import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAccount,
  JournalAccountConnectPayload,
  JournalAccountSyncResult,
  Mt5ServerSearchItem,
} from "../types";

export const journalAccountApi = {
  connectAccount: async (
    payload: JournalAccountConnectPayload,
    token?: string,
  ): Promise<JournalAccount> => {
    const { data } = await apiClient.post<JournalAccount>(
      "/accounts",
      payload,
      {
        ...withAuth(token),
        timeout: 0,
      },
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

  searchMt5Servers: async (
    query: string,
    token?: string,
  ): Promise<Mt5ServerSearchItem[]> => {
    const { data } = await apiClient.get<Mt5ServerSearchItem[]>(
      "/accounts/mt5-servers",
      {
        ...withAuth(token),
        params: { q: query, limit: 25 },
      },
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

  disconnectAccount: async (accountId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/accounts/${accountId}`, withAuth(token));
  },

  deleteAccount: async (accountId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/accounts/${accountId}/purge`, withAuth(token));
  },

  unarchiveAccount: async (
    accountId: string,
    token?: string,
  ): Promise<JournalAccount> => {
    const { data } = await apiClient.post<JournalAccount>(
      `/accounts/${accountId}/unarchive`,
      {},
      withAuth(token),
    );
    return data;
  },

  updateAccount: async (
    accountId: string,
    displayName: string,
    token?: string,
  ): Promise<JournalAccount> => {
    const { data } = await apiClient.patch<JournalAccount>(
      `/accounts/${accountId}`,
      { display_name: displayName },
      withAuth(token),
    );
    return data;
  },

  enableTraderAccess: async (
    accountId: string,
    traderPassword: string,
    token?: string,
  ): Promise<JournalAccount> => {
    const { data } = await apiClient.post<JournalAccount>(
      `/accounts/${accountId}/trader-access`,
      { trader_password: traderPassword },
      withAuth(token),
    );
    return data;
  },
};
