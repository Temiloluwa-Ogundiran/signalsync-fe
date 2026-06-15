import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalAnalyticsApi } from "../api/journal-analytics.api";

export const CURVE_KEYS = {
  curve: (accountId?: string, fromDate?: string, toDate?: string, granularity?: string) =>
    ["journal-curve", accountId, fromDate, toDate, granularity] as const,
};

interface UseCurveParams {
  accountId?: string;
  fromDate?: string;
  toDate?: string;
  granularity: "daily" | "intraday";
  enabled?: boolean;
}

/**
 * Fetch unified curve data (daily or intraday granularity).
 *
 * - granularity="daily": daily P&L bars + cumulative curve (range-scoped reset)
 * - granularity="intraday": all days in one response, ~20 points per day,
 *                          zero-baselined, sequence-indexed
 */
export function useCurve({
  accountId,
  fromDate,
  toDate,
  granularity,
  enabled = true,
}: UseCurveParams) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: CURVE_KEYS.curve(accountId, fromDate, toDate, granularity),
    queryFn: () =>
      journalAnalyticsApi.getCurve(
        {
          accountId,
          fromDate: fromDate || "",
          toDate: toDate || "",
          granularity,
        },
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId,
    // Empty fromDate/toDate is valid — it means "all trades" (no date filter).
    staleTime: 60_000,
  });
}
