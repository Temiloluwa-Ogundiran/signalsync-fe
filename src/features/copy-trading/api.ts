import apiClient, { withAuth } from "@/lib/api/client";
import type {
  CopyAccountPolicy,
  CopyActivity,
  CopyRoute,
  CopyTradingSettings,
  CopyTargetAccount,
} from "./types";

export const copyTradingApi = {
  listTargetAccounts: async (token?: string): Promise<CopyTargetAccount[]> => {
    const { data } = await apiClient.get<CopyTargetAccount[]>(
      "/accounts",
      withAuth(token),
    );
    return data.filter(
      (account) => !account.is_archived && account.connection_state === "ready",
    );
  },

  getSettings: async (token?: string): Promise<CopyTradingSettings> => {
    const { data } = await apiClient.get<CopyTradingSettings>(
      "/copy-trading/settings",
      withAuth(token),
    );
    return data;
  },

  updateSettings: async (
    isPaused: boolean,
    token?: string,
  ): Promise<CopyTradingSettings> => {
    const { data } = await apiClient.patch<CopyTradingSettings>(
      "/copy-trading/settings",
      { is_paused: isPaused },
      withAuth(token),
    );
    return data;
  },

  listRoutes: async (token?: string): Promise<CopyRoute[]> => {
    const { data } = await apiClient.get<CopyRoute[]>(
      "/copy-trading/routes",
      withAuth(token),
    );
    return data;
  },

  listAccountPolicies: async (token?: string): Promise<CopyAccountPolicy[]> => {
    const { data } = await apiClient.get<CopyAccountPolicy[]>(
      "/copy-trading/account-policies",
      withAuth(token),
    );
    return data;
  },

  updateAccountPolicy: async (
    accountId: string,
    payload: { max_lot?: string; is_paused?: boolean },
    token?: string,
  ): Promise<CopyAccountPolicy> => {
    const { data } = await apiClient.patch<CopyAccountPolicy>(
      `/copy-trading/account-policies/${accountId}`,
      payload,
      withAuth(token),
    );
    return data;
  },

  listActivity: async (token?: string): Promise<CopyActivity[]> => {
    const { data } = await apiClient.get<CopyActivity[]>(
      "/copy-trading/activity",
      { ...withAuth(token), params: { limit: 50 } },
    );
    return data;
  },
};
