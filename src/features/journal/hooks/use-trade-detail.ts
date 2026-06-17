import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTradeDetailApi } from "../api/journal-trade-detail.api";
import { invalidateJournalAnalyticsForAccount } from "./use-journal-analytics";

export const TRADE_DETAIL_KEYS = {
  note: (tradeId: string) => ["trade-detail", "note", tradeId] as const,
  setups: () => ["trade-detail", "setups"] as const,
};

// --- Per-trade note ---

export function useTradeNote(tradeId: string | undefined, enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: TRADE_DETAIL_KEYS.note(tradeId as string),
    queryFn: () =>
      journalTradeDetailApi.getTradeNote(
        tradeId as string,
        session?.accessToken
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!tradeId,
    staleTime: 60_000,
  });
}

export function useSaveTradeNote(tradeId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteHtml: string | null) =>
      journalTradeDetailApi.saveTradeNote(
        tradeId as string,
        noteHtml,
        session?.accessToken
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(TRADE_DETAIL_KEYS.note(tradeId as string), data);
    },
  });
}

// --- Setups (flat list) ---

export function useSetups() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: TRADE_DETAIL_KEYS.setups(),
    queryFn: () => journalTradeDetailApi.listSetups(session?.accessToken),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSetup() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      journalTradeDetailApi.createSetup(name, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADE_DETAIL_KEYS.setups() });
    },
  });
}

export function useDeleteSetup() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setupId: string) =>
      journalTradeDetailApi.deleteSetup(setupId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADE_DETAIL_KEYS.setups() });
    },
  });
}

export function useReorderSetups() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      journalTradeDetailApi.reorderSetups(ids, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADE_DETAIL_KEYS.setups() });
    },
  });
}

// --- Assign setup to a trade ---

export function useUpdateTradeSetup(accountId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      setup,
    }: {
      tradeId: string;
      setup: string | null;
    }) =>
      journalTradeDetailApi.updateTradeSetup(
        tradeId,
        setup,
        session?.accessToken
      ),
    onSuccess: () => {
      // A new setup name may have been added to the list; refresh it.
      queryClient.invalidateQueries({ queryKey: TRADE_DETAIL_KEYS.setups() });
      // Trade list / history rows carry `setup` — refresh them.
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            (k[0] === "journal-day" || k[0] === "journal-trade-history")
          );
        },
      });
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}
