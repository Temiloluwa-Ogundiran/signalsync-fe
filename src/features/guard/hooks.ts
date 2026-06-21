import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { guardApi } from "./api";
import type {
  EnableGuardInput,
  GuardPersonalInput,
  GuardRuleSpecInput,
} from "./types";

export const GUARD_KEYS = {
  all: ["guard"] as const,
  accounts: () => ["guard", "accounts"] as const,
  account: (id: string) => ["guard", "account", id] as const,
  connectable: () => ["guard", "connectable"] as const,
  monitor: (id: string) => ["guard", "monitor", id] as const,
  rules: (id: string) => ["guard", "rules", id] as const,
};

/** Awareness dashboard polling cadence — matches the dashboard's "live" feel. */
const MONITOR_POLL_MS = 4_000;

function useGuardAuth() {
  const { data: session, status } = useSession();
  return {
    token: session?.accessToken as string | undefined,
    enabled: status === "authenticated" && !!session?.accessToken,
  };
}

export function useGuardAccounts() {
  const { token, enabled } = useGuardAuth();
  return useQuery({
    queryKey: GUARD_KEYS.accounts(),
    queryFn: () => guardApi.listAccounts(token),
    enabled,
  });
}

export function useGuardAccount(id?: string) {
  const { token, enabled } = useGuardAuth();
  return useQuery({
    queryKey: GUARD_KEYS.account(id ?? ""),
    queryFn: () => guardApi.getAccount(id!, token),
    enabled: enabled && !!id,
  });
}

export function useGuardConnectableAccounts() {
  const { token, enabled } = useGuardAuth();
  return useQuery({
    queryKey: GUARD_KEYS.connectable(),
    queryFn: () => guardApi.listConnectableAccounts(token),
    enabled,
  });
}

/** The live awareness dashboard feed. Polls every few seconds. */
export function useGuardMonitor(id?: string) {
  const { token, enabled } = useGuardAuth();
  return useQuery({
    queryKey: GUARD_KEYS.monitor(id ?? ""),
    queryFn: () => guardApi.getMonitor(id!, token),
    enabled: enabled && !!id,
    refetchInterval: MONITOR_POLL_MS,
  });
}

export function useGuardRules(id?: string) {
  const { token, enabled } = useGuardAuth();
  return useQuery({
    queryKey: GUARD_KEYS.rules(id ?? ""),
    queryFn: () => guardApi.getRules(id!, token),
    enabled: enabled && !!id,
  });
}

export function useGuardActions() {
  const { token } = useGuardAuth();
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: GUARD_KEYS.all });

  return {
    enable: useMutation({
      mutationFn: (payload: EnableGuardInput) => guardApi.enable(payload, token),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: Partial<{
          rule_spec: GuardRuleSpecInput;
          personal: GuardPersonalInput | null;
          contract_text: string | null;
          enabled: boolean;
          size: number;
        }>;
      }) => guardApi.update(id, payload, token),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => guardApi.remove(id, token),
      onSuccess: refresh,
    }),
  };
}
