import { type QueryClient, useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAnalyticsApi } from "../api/journal-analytics.api";
import { journalTradesApi } from "../api/journal-trades.api";
import { useJournalUiStore } from "../store/journal-ui-store";

interface AnalyticsQueryInput {
  accountId?: string;
  fromDate: string;
  toDate: string;
}

/** Refetch calendar/dashboard after journal review or messages change. */
export function invalidateJournalAnalyticsForAccount(
  queryClient: QueryClient,
  accountId: string,
) {
  queryClient.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey;
      return (
        Array.isArray(k) &&
        k[0] === "journal-analytics" &&
        k[2] === accountId
      );
    },
  });
}

export const JOURNAL_ANALYTICS_KEYS = {
  calendar: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "calendar", accountId, fromDate, toDate, includeManual] as const,
  summary: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "summary", accountId, fromDate, toDate, includeManual] as const,
  instruments: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "instruments", accountId, fromDate, toDate, includeManual] as const,
  timePerformance: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "time-performance", accountId, fromDate, toDate, includeManual] as const,
  recentTrades: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "recent-trades", accountId, fromDate, toDate, includeManual] as const,
  dashboard: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "dashboard", accountId, fromDate, toDate, includeManual] as const,
  balanceHistory: (
    accountId?: string,
    fromDate?: string,
    toDate?: string,
    granularity?: "intraday" | "day",
    includeManual?: boolean,
  ) =>
    [
      "journal-analytics",
      "balance-history",
      accountId,
      fromDate,
      toDate,
      granularity,
      includeManual,
    ] as const,
};

/**
 * Shared builder for the journal-analytics queries (P2-2). Every quirk of the
 * original seven hooks is preserved verbatim — callers pass an exact `buildKey`
 * (so key positions 0–2 and any appended timeBasis/granularity are unchanged),
 * their own `fetcher`, and per-hook overrides (`requireAccountId`, `staleTime`,
 * `usePlaceholder`, `enabled`). Behaviour is identical to the hand-written hooks.
 */
function useAnalyticsQuery<T>(opts: {
  buildKey: (includeManual: boolean) => readonly unknown[];
  fetcher: (
    input: {
      accountId?: string;
      fromDate: string;
      toDate: string;
      includeManual: boolean;
      timeBasis?: "open" | "close";
      granularity?: "intraday" | "day";
    },
    token: string,
  ) => Promise<T>;
  accountId?: string;
  fromDate: string;
  toDate: string;
  timeBasis?: "open" | "close";
  granularity?: "intraday" | "day";
  requireAccountId?: boolean;
  enabled?: boolean;
  staleTime?: number;
  usePlaceholder?: boolean;
}) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);
  const requireAccountId = opts.requireAccountId ?? true;

  return useQuery({
    queryKey: opts.buildKey(includeManual),
    queryFn: () =>
      opts.fetcher(
        {
          accountId: opts.accountId,
          fromDate: opts.fromDate,
          toDate: opts.toDate,
          includeManual,
          timeBasis: opts.timeBasis,
          granularity: opts.granularity,
        },
        session?.accessToken as string,
      ),
    enabled:
      (opts.enabled ?? true) &&
      status === "authenticated" &&
      !!session?.accessToken &&
      (!requireAccountId || !!opts.accountId) &&
      !!opts.fromDate &&
      !!opts.toDate,
    staleTime: opts.staleTime ?? 60_000,
    ...(opts.usePlaceholder ? { placeholderData: keepPreviousData } : {}),
  });
}

export function useJournalCalendarAnalytics({ accountId, fromDate, toDate }: AnalyticsQueryInput) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    usePlaceholder: true,
    buildKey: (im) => JOURNAL_ANALYTICS_KEYS.calendar(accountId, fromDate, toDate, im),
    fetcher: (i, t) =>
      journalAnalyticsApi.getCalendar(
        { accountId: i.accountId as string, fromDate: i.fromDate, toDate: i.toDate, includeManual: i.includeManual },
        t,
      ),
  });
}

export function useJournalSummaryAnalytics({ accountId, fromDate, toDate }: AnalyticsQueryInput) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    buildKey: (im) => JOURNAL_ANALYTICS_KEYS.summary(accountId, fromDate, toDate, im),
    fetcher: (i, t) =>
      journalAnalyticsApi.getSummary(
        { accountId: i.accountId as string, fromDate: i.fromDate, toDate: i.toDate, includeManual: i.includeManual },
        t,
      ),
  });
}

export function useJournalInstrumentsAnalytics({ accountId, fromDate, toDate }: AnalyticsQueryInput) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    buildKey: (im) => JOURNAL_ANALYTICS_KEYS.instruments(accountId, fromDate, toDate, im),
    fetcher: (i, t) =>
      journalAnalyticsApi.getInstruments(
        { accountId: i.accountId as string, fromDate: i.fromDate, toDate: i.toDate, includeManual: i.includeManual },
        t,
      ),
  });
}

export function useJournalTimePerformanceAnalytics({
  accountId,
  fromDate,
  toDate,
  timeBasis = "close",
  enabled = true,
}: AnalyticsQueryInput & { timeBasis?: "open" | "close"; enabled?: boolean }) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    timeBasis,
    enabled,
    buildKey: (im) => [...JOURNAL_ANALYTICS_KEYS.timePerformance(accountId, fromDate, toDate, im), timeBasis],
    fetcher: (i, t) =>
      journalAnalyticsApi.getTimePerformance(
        {
          accountId: i.accountId as string,
          fromDate: i.fromDate,
          toDate: i.toDate,
          timeBasis: i.timeBasis as "open" | "close",
          includeManual: i.includeManual,
        },
        t,
      ),
  });
}

export function useJournalRecentTrades({ accountId, fromDate, toDate }: AnalyticsQueryInput) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    staleTime: 30_000,
    buildKey: (im) => JOURNAL_ANALYTICS_KEYS.recentTrades(accountId, fromDate, toDate, im),
    fetcher: (i, t) =>
      journalTradesApi.listRecent(i.accountId as string, i.fromDate, i.toDate, 8, i.includeManual, t),
  });
}

export function useJournalDashboardAnalytics({
  accountId,
  fromDate,
  toDate,
  timeBasis = "close",
}: AnalyticsQueryInput & { timeBasis?: "open" | "close" }) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    timeBasis,
    // Dashboard intentionally enables for multi-account (no accountId required).
    requireAccountId: false,
    buildKey: (im) => [...JOURNAL_ANALYTICS_KEYS.dashboard(accountId, fromDate, toDate, im), timeBasis],
    fetcher: (i, t) =>
      journalAnalyticsApi.getDashboard(
        {
          accountId: i.accountId,
          fromDate: i.fromDate,
          toDate: i.toDate,
          timeBasis: i.timeBasis as "open" | "close",
          includeManual: i.includeManual,
        },
        t,
      ),
  });
}

export function useJournalBalanceHistoryAnalytics({
  accountId,
  fromDate,
  toDate,
  granularity,
}: AnalyticsQueryInput & { granularity: "intraday" | "day" }) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    granularity,
    buildKey: (im) => JOURNAL_ANALYTICS_KEYS.balanceHistory(accountId, fromDate, toDate, granularity, im),
    fetcher: (i, t) =>
      journalAnalyticsApi.getBalanceHistory(
        {
          accountId: i.accountId,
          fromDate: i.fromDate,
          toDate: i.toDate,
          granularity: i.granularity as "intraday" | "day",
          includeManual: i.includeManual,
        },
        t,
      ),
  });
}
