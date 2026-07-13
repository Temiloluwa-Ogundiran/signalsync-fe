import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTagsApi } from "../api/journal-tags.api";
import { invalidateJournalAnalyticsForAccount } from "./use-journal-analytics";

const JOURNAL_TAGS_KEYS = {
  config: () => ["journal-tags", "config"] as const,
  tradeTags: (tradeId: string) => ["journal-tags", "trade", tradeId] as const,
};

export function useJournalTagsConfig() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_TAGS_KEYS.config(),
    queryFn: () => journalTagsApi.getConfig(session?.accessToken),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes cache is safe for tags configuration
  });
}

// --- Groups ---

export function useCreateTagGroup() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      journalTagsApi.createGroup(name, color, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

export function useUpdateTagGroup() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      name,
      color,
    }: {
      groupId: string;
      name?: string;
      color?: string;
    }) =>
      journalTagsApi.updateGroup(
        groupId,
        { name, color },
        session?.accessToken,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

export function useDeleteTagGroup() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) =>
      journalTagsApi.deleteGroup(groupId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

export function useReorderTagGroups() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      journalTagsApi.reorderGroups(ids, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

// --- Tags ---

export function useCreateTag() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      journalTagsApi.createTag(groupId, name, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

export function useDeleteTag() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) =>
      journalTagsApi.deleteTag(tagId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

export function useReorderTags() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      journalTagsApi.reorderTags(ids, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_TAGS_KEYS.config() });
    },
  });
}

// --- Trade tags ---

export function useTradeTags(tradeId: string | undefined, enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_TAGS_KEYS.tradeTags(tradeId as string),
    queryFn: () =>
      journalTagsApi.getTradeTags(tradeId as string, session?.accessToken),
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
    mutationFn: ({ tradeId, tagIds }: { tradeId: string; tagIds: string[] }) =>
      journalTagsApi.updateTradeTags(tradeId, tagIds, session?.accessToken),
    onSuccess: (_data, variables) => {
      // Invalidate trade specific tags
      queryClient.invalidateQueries({
        queryKey: JOURNAL_TAGS_KEYS.tradeTags(variables.tradeId),
      });

      // Invalidate journal day/trades caches to update stats card
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-day";
        },
      });

      // Invalidate setups & analytics if accountId is provided
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

// --- Rating & assessment (separate feature, kept intact) ---

export function useUpdateTradeRating(accountId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, rating }: { tradeId: string; rating: number }) =>
      journalTagsApi.updateTradeRating(tradeId, rating, session?.accessToken),
    onSuccess: () => {
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
        session?.accessToken,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return Array.isArray(k) && k[0] === "journal-day";
        },
      });

      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}
