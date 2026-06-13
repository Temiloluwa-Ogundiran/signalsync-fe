import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { invalidateJournalAnalyticsForAccount } from "./use-journal-analytics";
import { journalDailyApi } from "../api/journal-daily.api";
import { journalTradesApi } from "../api/journal-trades.api";
import { journalMessagesApi } from "../api/journal-messages.api";
import type { JournalCreateMessagePayload } from "../types";
import { useJournalUiStore } from "../store/journal-ui-store";

export const JOURNAL_DAY_MODAL_KEYS = {
  daily: (
    accountId?: string,
    day?: string,
    includeMessages = true,
    includeManual = true,
  ) => ["journal-day", "daily", accountId, day, includeMessages, includeManual] as const,
  trades: (accountId?: string, day?: string, includeManual = true) =>
    ["journal-day", "trades", accountId, day, includeManual] as const,
  tradeMessages: (tradeId?: string) =>
    ["journal-day", "trade-messages", tradeId] as const,
  adjacentTradedDates: (
    accountId?: string,
    day?: string,
  ) => ["journal-day", "adjacent-traded", accountId, day] as const,
};

export function useJournalDay(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
  options?: { includeMessages?: boolean },
) {
  const { data: session, status } = useSession();
  const includeMessages = options?.includeMessages ?? true;
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.daily(
      accountId,
      tradingDate,
      includeMessages,
      includeManual,
    ),
    queryFn: () =>
      journalDailyApi.getDay(
        accountId as string,
        tradingDate as string,
        includeMessages,
        includeManual,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
    staleTime: 60_000,
  });
}

export function useJournalDayTrades(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
      accountId,
      tradingDate,
      includeManual,
    ),
    queryFn: () =>
      journalTradesApi.listByDay(
        accountId as string,
        tradingDate as string,
        includeManual,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
    staleTime: 60_000,
  });
}

export function useCreateJournalDayMessage(
  accountId?: string,
  tradingDate?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dailyJournalId,
      payload,
      signal,
    }: {
      dailyJournalId: string;
      payload: JournalCreateMessagePayload;
      signal?: AbortSignal;
    }) =>
      journalDailyApi.createDayMessage(
        dailyJournalId,
        payload,
        session?.accessToken as string,
        { signal },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === accountId &&
            k[3] === tradingDate
          );
        },
      });
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useCreateJournalTradeMessage(
  accountId?: string,
  tradingDate?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      payload,
      signal,
    }: {
      tradeId: string;
      payload: JournalCreateMessagePayload;
      signal?: AbortSignal;
    }) =>
      journalTradesApi.createTradeMessage(
        tradeId,
        payload,
        session?.accessToken as string,
        { signal },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === accountId &&
            k[3] === tradingDate
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
          accountId,
          tradingDate,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
          variables.tradeId,
        ),
      });
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useTradeJournalMessages(tradeId?: string, enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
      tradeId,
    ),
    queryFn: () =>
      journalTradesApi.getTradeJournalMessages(
        tradeId as string,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!tradeId,
  });
}

export function useAdjacentTradedDates(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.adjacentTradedDates(
      accountId,
      tradingDate,
    ),
    queryFn: () =>
      journalDailyApi.getAdjacentTradedDates(
        accountId as string,
        tradingDate as string,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
    staleTime: 60_000,
  });
}

export function useMarkJournalDayReviewed(
  accountId?: string,
  tradingDate?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dailyJournalId: string) =>
      journalDailyApi.markDayReviewed(
        dailyJournalId,
        session?.accessToken as string,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === accountId &&
            k[3] === tradingDate
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["journal-day", "adjacent-traded", accountId],
      });
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useMarkJournalTradeReviewed(
  accountId?: string,
  tradingDate?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) =>
      journalTradesApi.markTradeReviewed(
        tradeId,
        session?.accessToken as string,
      ),
    onSuccess: (_data, tradeId) => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === accountId &&
            k[3] === tradingDate
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
          accountId,
          tradingDate,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
          tradeId,
        ),
      });
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useUpdateJournalMessage(
  accountId?: string,
  tradingDate?: string,
  tradeId?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      journalMessagesApi.updateMessage(
        messageId,
        content,
        session?.accessToken as string,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === accountId &&
            k[3] === tradingDate
          );
        },
      });
      if (tradeId) {
        queryClient.invalidateQueries({
          queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
            tradeId,
          ),
        });
      }
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}

export function useDeleteJournalMessage(
  accountId?: string,
  tradingDate?: string,
  tradeId?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      journalMessagesApi.deleteMessage(
        messageId,
        session?.accessToken as string,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === accountId &&
            k[3] === tradingDate
          );
        },
      });
      if (tradeId) {
        queryClient.invalidateQueries({
          queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
            tradeId,
          ),
        });
      }
      if (accountId) {
        invalidateJournalAnalyticsForAccount(queryClient, accountId);
      }
    },
  });
}
