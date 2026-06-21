import apiClient, { withAuth } from "@/lib/api/client";
import type {
  EnableGuardInput,
  GuardAccount,
  GuardConnectableAccount,
  GuardMonitor,
  GuardPersonalInput,
  GuardRuleSpecInput,
  GuardRulesView,
} from "./types";

/** All calls route through the existing axios client → /api/proxy (Bearer injected server-side). */
export const guardApi = {
  listAccounts: async (token?: string): Promise<GuardAccount[]> => {
    const { data } = await apiClient.get<GuardAccount[]>(
      "/guard/accounts",
      withAuth(token),
    );
    return data;
  },

  /** Connected TradingAccounts the user could enable Guard on (ready + not archived). */
  listConnectableAccounts: async (
    token?: string,
  ): Promise<GuardConnectableAccount[]> => {
    const { data } = await apiClient.get<GuardConnectableAccount[]>(
      "/accounts",
      withAuth(token),
    );
    return data
      .filter((a) => !a.is_archived && a.connection_state === "ready")
      .map((a) => ({
        id: a.id,
        display_name: a.display_name,
        broker_name: a.broker_name,
        broker_login: a.broker_login,
        connection_state: a.connection_state,
        is_archived: a.is_archived,
      }));
  },

  getAccount: async (id: string, token?: string): Promise<GuardAccount> => {
    const { data } = await apiClient.get<GuardAccount>(
      `/guard/accounts/${id}`,
      withAuth(token),
    );
    return data;
  },

  enable: async (
    payload: EnableGuardInput,
    token?: string,
  ): Promise<GuardAccount> => {
    const { data } = await apiClient.post<GuardAccount>(
      "/guard/accounts",
      payload,
      withAuth(token),
    );
    return data;
  },

  update: async (
    id: string,
    payload: Partial<{
      rule_spec: GuardRuleSpecInput;
      personal: GuardPersonalInput | null;
      contract_text: string | null;
      enabled: boolean;
      size: number;
    }>,
    token?: string,
  ): Promise<GuardAccount> => {
    const { data } = await apiClient.patch<GuardAccount>(
      `/guard/accounts/${id}`,
      payload,
      withAuth(token),
    );
    return data;
  },

  remove: async (id: string, token?: string): Promise<void> => {
    await apiClient.delete(`/guard/accounts/${id}`, withAuth(token));
  },

  /** The fat awareness-dashboard payload — one call. */
  getMonitor: async (id: string, token?: string): Promise<GuardMonitor> => {
    const { data } = await apiClient.get<GuardMonitor>(
      `/guard/accounts/${id}/monitor`,
      withAuth(token),
    );
    return data;
  },

  getRules: async (id: string, token?: string): Promise<GuardRulesView> => {
    const { data } = await apiClient.get<GuardRulesView>(
      `/guard/accounts/${id}/rules`,
      withAuth(token),
    );
    return data;
  },
};
