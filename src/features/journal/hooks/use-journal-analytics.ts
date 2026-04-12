import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAnalyticsApi } from "../api/journal-analytics.api";
import { journalTradesApi } from "../api/journal-trades.api";

interface AnalyticsQueryInput {
  accountId?: string;
  fromDate: string;
  toDate: string;
}

export const JOURNAL_ANALYTICS_KEYS = {
  calendar: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "calendar", accountId, fromDate, toDate] as const,
  summary: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "summary", accountId, fromDate, toDate] as const,
  instruments: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "instruments", accountId, fromDate, toDate] as const,
  timePerformance: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "time-performance", accountId, fromDate, toDate] as const,
  recentTrades: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "recent-trades", accountId, fromDate, toDate] as const,
  dashboard: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "dashboard", accountId, fromDate, toDate] as const,
  balanceHistory: (
    accountId?: string,
    fromDate?: string,
    toDate?: string,
    granularity?: "intraday" | "day",
  ) =>
    [
      "journal-analytics",
      "balance-history",
      accountId,
      fromDate,
      toDate,
      granularity,
    ] as const,
};

export function useJournalCalendarAnalytics({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.calendar(accountId, fromDate, toDate),
    queryFn: () =>
      journalAnalyticsApi.getCalendar(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
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

export function useJournalSummaryAnalytics({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.summary(accountId, fromDate, toDate),
    queryFn: () =>
      journalAnalyticsApi.getSummary(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
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

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.instruments(accountId, fromDate, toDate),
    queryFn: () =>
      journalAnalyticsApi.getInstruments(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
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
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.timePerformance(accountId, fromDate, toDate),
    queryFn: () =>
      journalAnalyticsApi.getTimePerformance(
        {
          accountId: accountId as string,
          fromDate,
          toDate,
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

export function useJournalRecentTrades({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.recentTrades(accountId, fromDate, toDate),
    queryFn: () =>
      journalTradesApi.listRecent(
        accountId as string,
        fromDate,
        toDate,
        8,
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
}: AnalyticsQueryInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.dashboard(accountId, fromDate, toDate),
    queryFn: () =>
      journalAnalyticsApi.getDashboard(
        {
          accountId,
          fromDate,
          toDate,
        },
        session?.accessToken as string,
      ),
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!fromDate &&
      !!toDate,
    staleTime: 60_000,
  });
}

export function useJournalBalanceHistoryAnalytics({
  accountId,
  fromDate,
  toDate,
  granularity,
}: AnalyticsQueryInput & { granularity: "intraday" | "day" }) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_ANALYTICS_KEYS.balanceHistory(
      accountId,
      fromDate,
      toDate,
      granularity,
    ),
    queryFn: () =>
      journalAnalyticsApi.getBalanceHistory(
        {
          accountId,
          fromDate,
          toDate,
          granularity,
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
