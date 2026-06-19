import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/api/query-keys";
import { journalTradesApi } from "../api/journal-trades.api";

interface UseTradeHistoryInput {
  accountId?: string;
  fromDate: string;
  toDate: string;
  limit?: number;
}

export const JOURNAL_TRADE_HISTORY_KEYS = {
  list: (
    accountId?: string,
    fromDate?: string,
    toDate?: string,
    limit?: number,
  ) =>
    [
      ...queryKeys.journal.tradeHistoryRange(
        accountId,
        fromDate ?? "",
        toDate ?? "",
      ),
      limit,
    ] as const,
};

export function useTradeHistory({
  accountId,
  fromDate,
  toDate,
  limit = 200,
}: UseTradeHistoryInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_TRADE_HISTORY_KEYS.list(
      accountId,
      fromDate,
      toDate,
      limit,
    ),
    queryFn: () =>
      journalTradesApi.listRecent(
        accountId as string,
        fromDate,
        toDate,
        limit,
        session?.accessToken as string,
      ),
    staleTime: 60_000,
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
  });
}
