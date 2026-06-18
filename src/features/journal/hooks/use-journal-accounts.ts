import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAccountApi } from "../api/journal-account.api";
import { ApiException } from "@/lib/api/types";
import type { JournalAccount, JournalAccountConnectPayload } from "../types";

const IMPORTING_CONNECTION_STATES = new Set([
  "pending_verification",
  "bootstrapping",
]);

export const JOURNAL_ACCOUNT_KEYS = {
  all: ["journal-accounts"] as const,
  list: () => ["journal-accounts", "list"] as const,
  mt5Servers: (query: string) => ["journal-accounts", "mt5-servers", query] as const,
};

export function useJournalAccounts() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ACCOUNT_KEYS.list(),
    queryFn: () =>
      journalAccountApi.listAccounts(session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      const accounts = query.state.data as JournalAccount[] | undefined;
      const hasImportingAccount = accounts?.some((account) =>
        IMPORTING_CONNECTION_STATES.has(account.connection_state ?? ""),
      );
      return hasImportingAccount ? 3000 : false;
    },
    select: (accounts: JournalAccount[]) =>
      accounts.filter((account) => !account.is_deleted && account.status !== "disconnected"),
  });
}

export function useConnectJournalAccount() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JournalAccountConnectPayload) =>
      journalAccountApi.connectAccount(payload, session?.accessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ACCOUNT_KEYS.all,
      });
    },
    onError: (error) => {
      if (error instanceof ApiException && error.code === "REQUEST_TIMEOUT") {
        queryClient.invalidateQueries({
          queryKey: JOURNAL_ACCOUNT_KEYS.all,
        });
      }
    },
  });
}

export function useMt5ServerSearch(query: string, enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ACCOUNT_KEYS.mt5Servers(query),
    queryFn: () =>
      journalAccountApi.searchMt5Servers(query, session?.accessToken as string),
    enabled: enabled && status === "authenticated" && !!session?.accessToken,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSyncJournalAccount() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (accountId: string) =>
      journalAccountApi.syncAccount(accountId, session?.accessToken as string),
  });
}

export function useDisconnectJournalAccount() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      journalAccountApi.disconnectAccount(accountId, session?.accessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ACCOUNT_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["journal-analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["journal-day"],
      });
    },
  });
}

export function useUpdateJournalAccount() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      displayName,
    }: {
      accountId: string;
      displayName: string;
    }) =>
      journalAccountApi.updateAccount(
        accountId,
        displayName,
        session?.accessToken as string,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ACCOUNT_KEYS.all,
      });
    },
  });
}
