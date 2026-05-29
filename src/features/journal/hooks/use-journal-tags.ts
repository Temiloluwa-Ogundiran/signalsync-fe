import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTagsApi } from "../api/journal-tags.api";
import { invalidateJournalAnalyticsForAccount } from "./use-journal-analytics";

export const JOURNAL_TAGS_KEYS = {
  config: (token: string | undefined) => ["journal-tags", "config", token] as const,
  tradeTags: (token: string | undefined, tradeId: string) =>
    ["journal-tags", "trade", token, tradeId] as const,
};

export function useJournalTagsConfig() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_TAGS_KEYS.config(session?.accessToken),
    queryFn: () => journalTagsApi.getConfig(session?.accessToken),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes cache is safe for tags configuration
  });
}

export function useCreateTagCategory() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) =>
      journalTagsApi.createCategory(title, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_TAGS_KEYS.config(session?.accessToken),
      });
    },
  });
}

export function useDeleteTagCategory() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      journalTagsApi.deleteCategory(categoryId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_TAGS_KEYS.config(session?.accessToken),
      });
    },
  });
}

export function useCreateTagOption() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      value,
      color,
    }: {
      categoryId: string;
      value: string;
      color?: string;
    }) =>
      journalTagsApi.createOption(categoryId, value, color, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_TAGS_KEYS.config(session?.accessToken),
      });
    },
  });
}

export function useDeleteTagOption() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) =>
      journalTagsApi.deleteOption(optionId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_TAGS_KEYS.config(session?.accessToken),
      });
    },
  });
}

export function useTradeTags(tradeId: string | undefined, enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_TAGS_KEYS.tradeTags(session?.accessToken, tradeId as string),
    queryFn: () => journalTagsApi.getTradeTags(tradeId as string, session?.accessToken),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!tradeId,
    staleTime: 60_000,
  });
}

export function useUpdateTradeTags(accountId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      optionIds,
    }: {
      tradeId: string;
      optionIds: string[];
    }) =>
      journalTagsApi.updateTradeTags(tradeId, optionIds, session?.accessToken),
    onSuccess: (_data, variables) => {
      const token = session?.accessToken;

      // Invalidate trade specific tags
      queryClient.invalidateQueries({
        queryKey: JOURNAL_TAGS_KEYS.tradeTags(token, variables.tradeId),
      });

      // Invalidate journal day/trades caches to update stats card
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[2] === token
          );
        },
      });

      // Invalidate setups & analytics if accountId is provided
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useUpdateTradeRating(accountId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      rating,
    }: {
      tradeId: string;
      rating: number;
    }) =>
      journalTagsApi.updateTradeRating(tradeId, rating, session?.accessToken),
    onSuccess: (_data, variables) => {
      const token = session?.accessToken;

      // Invalidate journal day/trades caches to update trade details & stars immediately
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[2] === token
          );
        },
      });

      // Invalidate setups & analytics if accountId is provided
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useUpdateTradeAssessment(accountId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      execution_quality,
      setup_quality,
      discipline_score,
    }: {
      tradeId: string;
      execution_quality?: number;
      setup_quality?: number;
      discipline_score?: number;
    }) =>
      journalTagsApi.updateTradeAssessment(
        tradeId,
        { execution_quality, setup_quality, discipline_score },
        session?.accessToken
      ),
    onSuccess: (_data, variables) => {
      const token = session?.accessToken;

      // Invalidate journal day/trades caches to update trade details instantly
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[2] === token
          );
        },
      });

      // Invalidate setups & analytics if accountId is provided
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}
