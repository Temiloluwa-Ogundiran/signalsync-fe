import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { invalidateJournalAnalyticsForAccount } from "./use-journal-analytics";
import { journalDailyApi } from "../api/journal-daily.api";
import { journalTradesApi } from "../api/journal-trades.api";
import { journalMessagesApi } from "../api/journal-messages.api";
import type { JournalCreateMessagePayload } from "../types";

export const JOURNAL_DAY_MODAL_KEYS = {
  daily: (
    token: string | undefined,
    accountId?: string,
    day?: string,
    includeMessages = true,
  ) => ["journal-day", "daily", token, accountId, day, includeMessages] as const,
  trades: (token: string | undefined, accountId?: string, day?: string) =>
    ["journal-day", "trades", token, accountId, day] as const,
  tradeMessages: (token: string | undefined, tradeId?: string) =>
    ["journal-day", "trade-messages", token, tradeId] as const,
  adjacentTradedDates: (
    token: string | undefined,
    accountId?: string,
    day?: string,
  ) => ["journal-day", "adjacent-traded", token, accountId, day] as const,
};

export function useJournalDay(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
  options?: { includeMessages?: boolean },
) {
  const { data: session, status } = useSession();
  const includeMessages = options?.includeMessages ?? true;

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.daily(
      session?.accessToken,
      accountId,
      tradingDate,
      includeMessages,
    ),
    queryFn: () =>
      journalDailyApi.getDay(
        accountId as string,
        tradingDate as string,
        includeMessages,
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

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
      session?.accessToken,
      accountId,
      tradingDate,
    ),
    queryFn: () =>
      journalTradesApi.listByDay(
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
    }: {
      dailyJournalId: string;
      payload: JournalCreateMessagePayload;
    }) =>
      journalDailyApi.createDayMessage(
        dailyJournalId,
        payload,
        session?.accessToken as string,
      ),
    onSuccess: () => {
      const token = session?.accessToken;
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === token &&
            k[3] === accountId &&
            k[4] === tradingDate
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
    }: {
      tradeId: string;
      payload: JournalCreateMessagePayload;
    }) =>
      journalTradesApi.createTradeMessage(
        tradeId,
        payload,
        session?.accessToken as string,
      ),
    onSuccess: (_data, variables) => {
      const token = session?.accessToken;
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === token &&
            k[3] === accountId &&
            k[4] === tradingDate
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
          session?.accessToken,
          accountId,
          tradingDate,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
          session?.accessToken,
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
      session?.accessToken,
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
      session?.accessToken,
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
      const token = session?.accessToken;
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === token &&
            k[3] === accountId &&
            k[4] === tradingDate
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["journal-day", "adjacent-traded", token, accountId],
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
      const token = session?.accessToken;
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === token &&
            k[3] === accountId &&
            k[4] === tradingDate
          );
        },
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
          session?.accessToken,
          accountId,
          tradingDate,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
          session?.accessToken,
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
      const token = session?.accessToken;
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === token &&
            k[3] === accountId &&
            k[4] === tradingDate
          );
        },
      });
      if (tradeId) {
        queryClient.invalidateQueries({
          queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
            token,
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
      const token = session?.accessToken;
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey;
          return (
            Array.isArray(k) &&
            k[0] === "journal-day" &&
            k[1] === "daily" &&
            k[2] === token &&
            k[3] === accountId &&
            k[4] === tradingDate
          );
        },
      });
      if (tradeId) {
        queryClient.invalidateQueries({
          queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
            token,
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
