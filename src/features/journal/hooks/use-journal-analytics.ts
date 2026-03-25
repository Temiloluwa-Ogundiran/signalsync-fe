import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAnalyticsApi } from "../api/journal-analytics.api";

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
  });
}
