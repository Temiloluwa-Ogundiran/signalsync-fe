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

export function useJournalCalendarAnalytics({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.calendar(accountId, fromDate, toDate, includeManual),
    queryFn: () =>
      journalAnalyticsApi.getCalendar(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
          includeManual,
        },
          session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useJournalSummaryAnalytics({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.summary(accountId, fromDate, toDate, includeManual),
    queryFn: () =>
      journalAnalyticsApi.getSummary(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
          includeManual,
        },
        session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
  });
}

export function useJournalInstrumentsAnalytics({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.instruments(accountId, fromDate, toDate, includeManual),
    queryFn: () =>
      journalAnalyticsApi.getInstruments(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
          includeManual,
        },
        session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
  });
}

export function useJournalTimePerformanceAnalytics({
  accountId,
  fromDate,
  toDate,
  timeBasis = "close",
  enabled = true,
}: AnalyticsQueryInput & { timeBasis?: "open" | "close"; enabled?: boolean }) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: [...JOURNAL_ANALYTICS_KEYS.timePerformance(accountId, fromDate, toDate, includeManual), timeBasis],
    queryFn: () =>
      journalAnalyticsApi.getTimePerformance(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
          timeBasis,
          includeManual,
        },
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
  });
}

export function useJournalRecentTrades({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.recentTrades(accountId, fromDate, toDate, includeManual),
    queryFn: () =>
      journalTradesApi.listRecent(
        accountId as string,
        fromDate,
        toDate,
        8,
        includeManual,
        session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
    staleTime: 30_000,
  });
}

export function useJournalDashboardAnalytics({
  accountId,
  fromDate,
  toDate,
  timeBasis = "close",
}: AnalyticsQueryInput & { timeBasis?: "open" | "close" }) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: [...JOURNAL_ANALYTICS_KEYS.dashboard(accountId, fromDate, toDate, includeManual), timeBasis],
    queryFn: () =>
      journalAnalyticsApi.getDashboard(
        {
          accountId,
          fromDate,
          toDate,
          timeBasis,
          includeManual,
        },
        session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useJournalBalanceHistoryAnalytics({
  accountId,
  fromDate,
  toDate,
  granularity,
}: AnalyticsQueryInput & { granularity: "intraday" | "day" }) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.balanceHistory(
      accountId,
      fromDate,
      toDate,
      granularity,
      includeManual,
    ),
    queryFn: () =>
      journalAnalyticsApi.getBalanceHistory(
        {
          accountId,
          fromDate,
          toDate,
          granularity,
          includeManual,
        },
        session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
