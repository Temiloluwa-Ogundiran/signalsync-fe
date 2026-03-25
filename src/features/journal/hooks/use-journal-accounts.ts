import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAccountApi } from "../api/journal-account.api";
import type { JournalAccountConnectPayload } from "../types";

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
