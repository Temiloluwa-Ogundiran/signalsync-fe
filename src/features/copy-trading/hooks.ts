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
  connections: () => ["copy-trading", "telegram-connections"] as const,
  sources: () => ["copy-trading", "sources"] as const,
  dialogs: (id: string) => ["copy-trading", "dialogs", id] as const,
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

export function useTelegramConnections() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({ queryKey: COPY_TRADING_KEYS.connections(), queryFn: () => copyTradingApi.listConnections(token), enabled, refetchInterval: 5000 });
}

export function useTelegramSources() {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({ queryKey: COPY_TRADING_KEYS.sources(), queryFn: () => copyTradingApi.listSources(token), enabled, refetchInterval: 5000 });
}

export function useTelegramDialogs(connectionId?: string) {
  const { token, enabled } = useCopyTradingAuth();
  return useQuery({ queryKey: COPY_TRADING_KEYS.dialogs(connectionId ?? ""), queryFn: () => copyTradingApi.listDialogs(connectionId!, token), enabled: enabled && !!connectionId, refetchInterval: 10000 });
}

export function useCopyTradingActions() {
  const { token } = useCopyTradingAuth();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: COPY_TRADING_KEYS.all });
  return {
    startPhone: useMutation({ mutationFn: (phone: string) => copyTradingApi.startPhoneAuth(phone, token) }),
    startQr: useMutation({ mutationFn: () => copyTradingApi.startQrAuth(token) }),
    getAuth: (authId: string) => copyTradingApi.getAuth(authId, token),
    submitCode: (authId: string, code: string) => copyTradingApi.submitCode(authId, code, token),
    submitPassword: (authId: string, password: string) => copyTradingApi.submitPassword(authId, password, token),
    disconnect: useMutation({ mutationFn: (id: string) => copyTradingApi.disconnect(id, token), onSuccess: refresh }),
    pauseConnection: useMutation({ mutationFn: ({ id, paused }: { id: string; paused: boolean }) => copyTradingApi.pauseConnection(id, paused, token), onSuccess: refresh }),
    createSource: useMutation({ mutationFn: (payload: Parameters<typeof copyTradingApi.createSource>[0]) => copyTradingApi.createSource(payload, token), onSuccess: refresh }),
    pauseSource: useMutation({ mutationFn: ({ id, paused }: { id: string; paused: boolean }) => copyTradingApi.pauseSource(id, paused, token), onSuccess: refresh }),
    revealRaw: (eventId: string) => copyTradingApi.revealActivityRaw(eventId, token),
    createRoute: useMutation({ mutationFn: (payload: Parameters<typeof copyTradingApi.createRoute>[0]) => copyTradingApi.createRoute(payload, token), onSuccess: refresh }),
    routeAction: useMutation({ mutationFn: ({ id, action }: { id: string; action: "activate" | "pause" | "resume" }) => action === "activate" ? copyTradingApi.activateRoute(id, token) : action === "pause" ? copyTradingApi.pauseRoute(id, token) : copyTradingApi.resumeRoute(id, token), onSuccess: refresh }),
    emergency: useMutation({ mutationFn: (payload: Parameters<typeof copyTradingApi.emergency>[0]) => copyTradingApi.emergency(payload, token), onSuccess: refresh }),
  };
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
