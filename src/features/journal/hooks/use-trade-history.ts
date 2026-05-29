import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTradesApi } from "../api/journal-trades.api";
import { useJournalUiStore } from "../store/journal-ui-store";

interface UseTradeHistoryInput {
  accountId?: string;
  fromDate: string;
  toDate: string;
  limit?: number;
}

export const JOURNAL_TRADE_HISTORY_KEYS = {
  list: (
    token?: string,
    accountId?: string,
    fromDate?: string,
    toDate?: string,
    limit?: number,
    includeManual?: boolean,
  ) => ["journal-trade-history", token, accountId, fromDate, toDate, limit, includeManual] as const,
};

export function useTradeHistory({
  accountId,
  fromDate,
  toDate,
  limit = 200,
}: UseTradeHistoryInput) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useQuery({
    queryKey: JOURNAL_TRADE_HISTORY_KEYS.list(
      session?.accessToken,
      accountId,
      fromDate,
      toDate,
      limit,
      includeManual,
    ),
    queryFn: () =>
      journalTradesApi.listRecent(
        accountId as string,
        fromDate,
        toDate,
        limit,
        includeManual,
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
