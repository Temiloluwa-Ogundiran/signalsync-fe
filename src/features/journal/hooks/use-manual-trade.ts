import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalManualTradesApi } from "../api/journal-manual-trades.api";
import { invalidateJournalAnalyticsForAccount } from "./use-journal-analytics";
import type { ManualTradeCreatePayload, ManualTradeUpdatePayload } from "../types";

export function useCreateManualTrade(accountId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualTradeCreatePayload) =>
      journalManualTradesApi.create(accountId, payload, session?.accessToken as string),
    onSuccess: () => {
      const token = session?.accessToken;
      
      // Invalidate day journal cache for the account
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-day" && k[3] === accountId;
        },
      });

      // Invalidate trade history cache for the account
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-trade-history" && k[2] === accountId;
        },
      });

      // Invalidate analytics caches
      invalidateJournalAnalyticsForAccount(queryClient, accountId);
    },
  });
}

export function useUpdateManualTrade(accountId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, payload }: { tradeId: string; payload: ManualTradeUpdatePayload }) =>
      journalManualTradesApi.update(tradeId, payload, session?.accessToken as string),
    onSuccess: () => {
      const token = session?.accessToken;

      // Invalidate day journal cache
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-day" && k[3] === accountId;
        },
      });

      // Invalidate trade messages cache
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-day" && k[1] === "trade-messages";
        },
      });

      // Invalidate trade history cache
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-trade-history" && k[2] === accountId;
        },
      });

      // Invalidate analytics
      invalidateJournalAnalyticsForAccount(queryClient, accountId);
    },
  });
}

export function useDeleteManualTrade(accountId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) =>
      journalManualTradesApi.delete(tradeId, session?.accessToken as string),
    onSuccess: () => {
      // Invalidate day journal cache
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-day" && k[3] === accountId;
        },
      });

      // Invalidate trade history cache
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-trade-history" && k[2] === accountId;
        },
      });

      // Invalidate analytics
      invalidateJournalAnalyticsForAccount(queryClient, accountId);
    },
  });
}
