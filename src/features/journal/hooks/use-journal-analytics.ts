import { type QueryClient, useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAnalyticsApi } from "../api/journal-analytics.api";
import { useJournalUiStore } from "../store/journal-ui-store";

interface AnalyticsQueryInput {
  accountId?: string;
  fromDate: string;
  toDate: string;
}

/** Refetch dashboard/summary after journal review or messages change. */
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
  summary: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "summary", accountId, fromDate, toDate, includeManual] as const,
  timePerformance: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "time-performance", accountId, fromDate, toDate, includeManual] as const,
  dashboard: (accountId?: string, fromDate?: string, toDate?: string, includeManual?: boolean) =>
    ["journal-analytics", "dashboard", accountId, fromDate, toDate, includeManual] as const,
};

/**
 * Shared builder for the journal-analytics queries. Callers pass an exact
 * `buildKey` (so key positions 0–2 and any appended timeBasis are unchanged),
 * their own `fetcher`, and per-hook overrides (`requireAccountId`, `staleTime`,
 * `usePlaceholder`, `enabled`).
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
    },
    token: string,
  ) => Promise<T>;
  accountId?: string;
  fromDate: string;
  toDate: string;
  timeBasis?: "open" | "close";
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
