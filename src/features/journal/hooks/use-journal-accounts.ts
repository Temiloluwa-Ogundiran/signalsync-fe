import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAccountApi } from "../api/journal-account.api";
import type { JournalAccount, JournalAccountConnectPayload } from "../types";

export const JOURNAL_ACCOUNT_KEYS = {
  all: ["journal-accounts"] as const,
  list: (token?: string) => ["journal-accounts", "list", token] as const,
};

export function useJournalAccounts() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ACCOUNT_KEYS.list(session?.accessToken),
    queryFn: () =>
      journalAccountApi.listAccounts(session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
  });
}

export function useSyncJournalAccount() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      journalAccountApi.syncAccount(accountId, session?.accessToken as string),
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
