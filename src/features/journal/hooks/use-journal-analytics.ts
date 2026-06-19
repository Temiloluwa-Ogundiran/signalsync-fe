import { type QueryClient, useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAnalyticsApi } from "../api/journal-analytics.api";

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
  summary: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "summary", accountId, fromDate, toDate] as const,
  timePerformance: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "time-performance", accountId, fromDate, toDate] as const,
  evaluation: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "evaluation", accountId, fromDate, toDate] as const,
  dashboard: (accountId?: string, fromDate?: string, toDate?: string) =>
    ["journal-analytics", "dashboard", accountId, fromDate, toDate] as const,
};

/**
 * Shared builder for the journal-analytics queries. Callers pass an exact
 * `buildKey` (so key positions 0–2 and any appended timeBasis are unchanged),
 * their own `fetcher`, and per-hook overrides (`requireAccountId`, `staleTime`,
 * `usePlaceholder`, `enabled`).
 */
function useAnalyticsQuery<T>(opts: {
  buildKey: () => readonly unknown[];
  fetcher: (
    input: {
      accountId?: string;
      fromDate: string;
      toDate: string;
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
  const requireAccountId = opts.requireAccountId ?? true;

  return useQuery({
    queryKey: opts.buildKey(),
    queryFn: () =>
      opts.fetcher(
        {
          accountId: opts.accountId,
          fromDate: opts.fromDate,
          toDate: opts.toDate,
          timeBasis: opts.timeBasis,
        },
        session?.accessToken as string,
      ),
    enabled:
      (opts.enabled ?? true) &&
      status === "authenticated" &&
      !!session?.accessToken &&
      (!requireAccountId || !!opts.accountId),
    // Empty fromDate/toDate is valid — it means "all trades" (no date filter).
    staleTime: opts.staleTime ?? 60_000,
    ...(opts.usePlaceholder ? { placeholderData: keepPreviousData } : {}),
  });
}

export function useJournalSummaryAnalytics({ accountId, fromDate, toDate }: AnalyticsQueryInput) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    buildKey: () => JOURNAL_ANALYTICS_KEYS.summary(accountId, fromDate, toDate),
    fetcher: (i, t) =>
      journalAnalyticsApi.getSummary(
        { accountId: i.accountId as string, fromDate: i.fromDate, toDate: i.toDate },
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
    buildKey: () => [...JOURNAL_ANALYTICS_KEYS.timePerformance(accountId, fromDate, toDate), timeBasis],
    fetcher: (i, t) =>
      journalAnalyticsApi.getTimePerformance(
        {
          accountId: i.accountId as string,
          fromDate: i.fromDate,
          toDate: i.toDate,
          timeBasis: i.timeBasis as "open" | "close",
        },
        t,
      ),
  });
}

export function useJournalEvaluationAnalytics({
  accountId,
  fromDate,
  toDate,
}: AnalyticsQueryInput) {
  return useAnalyticsQuery({
    accountId,
    fromDate,
    toDate,
    usePlaceholder: true,
    buildKey: () => JOURNAL_ANALYTICS_KEYS.evaluation(accountId, fromDate, toDate),
    fetcher: (i, t) =>
      journalAnalyticsApi.getEvaluation(
        { accountId: i.accountId as string, fromDate: i.fromDate, toDate: i.toDate },
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
    buildKey: () => [...JOURNAL_ANALYTICS_KEYS.dashboard(accountId, fromDate, toDate), timeBasis],
    fetcher: (i, t) =>
      journalAnalyticsApi.getDashboard(
        {
          accountId: i.accountId,
          fromDate: i.fromDate,
          toDate: i.toDate,
          timeBasis: i.timeBasis as "open" | "close",
        },
        t,
      ),
  });
}
