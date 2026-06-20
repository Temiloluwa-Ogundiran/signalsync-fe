import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { copyTradingApi } from "./api";

export const COPY_TRADING_KEYS = {
  all: ["copy-trading"] as const,
  settings: () => ["copy-trading", "settings"] as const,
  routes: () => ["copy-trading", "routes"] as const,
  policies: () => ["copy-trading", "account-policies"] as const,
  activity: () => ["copy-trading", "activity"] as const,
  targetAccounts: () => ["copy-trading", "target-accounts"] as const,
};

function useCopyTradingAuth() {
  const { data: session, status } = useSession();
  return {
    token: session?.accessToken as string | undefined,
    enabled: status === "authenticated" && !!session?.accessToken,
  };
}

export function useCopyTradingSettings() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({
    queryKey: COPY_TRADING_KEYS.settings(),
    queryFn: () => copyTradingApi.getSettings(token),
    enabled,
  });
}

export function useCopyTargetAccounts() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({
    queryKey: COPY_TRADING_KEYS.targetAccounts(),
    queryFn: () => copyTradingApi.listTargetAccounts(token),
    enabled,
  });
}

export function useCopyRoutes() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({
    queryKey: COPY_TRADING_KEYS.routes(),
    queryFn: () => copyTradingApi.listRoutes(token),
    enabled,
  });
}

export function useCopyAccountPolicies() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({
    queryKey: COPY_TRADING_KEYS.policies(),
    queryFn: () => copyTradingApi.listAccountPolicies(token),
    enabled,
  });
}

export function useCopyActivity() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({
    queryKey: COPY_TRADING_KEYS.activity(),
    queryFn: () => copyTradingApi.listActivity(token),
    enabled,
    refetchInterval: 15_000,
  });
}

export function useUpdateCopyTradingSettings() {
  const { token } = useCopyTradingAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPaused: boolean) =>
      copyTradingApi.updateSettings(isPaused, token),
    onSuccess: (settings) => {
      queryClient.setQueryData(COPY_TRADING_KEYS.settings(), settings);
      queryClient.invalidateQueries({ queryKey: COPY_TRADING_KEYS.activity() });
    },
  });
}

export function useUpdateCopyAccountPolicy() {
  const { token } = useCopyTradingAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      payload,
    }: {
      accountId: string;
      payload: { max_lot?: string; is_paused?: boolean };
    }) => copyTradingApi.updateAccountPolicy(accountId, payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPY_TRADING_KEYS.policies() });
      queryClient.invalidateQueries({ queryKey: COPY_TRADING_KEYS.activity() });
    },
  });
}
