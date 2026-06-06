import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTradesApi } from "../api/journal-trades.api";
import { useJournalUiStore } from "../store/journal-ui-store";

interface UseInfiniteTradeHistoryInput {
  accountId?: string;
  fromDate: string;
  toDate: string;
}

export function useInfiniteTradeHistory({
  accountId,
  fromDate,
  toDate,
}: UseInfiniteTradeHistoryInput) {
  const { data: session, status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useInfiniteQuery({
    queryKey: [
      "journal-trade-history",
      session?.accessToken,
      accountId,
      fromDate,
      toDate,
      includeManual,
    ],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      journalTradesApi.listRecent(
        accountId as string,
        fromDate,
        toDate,
        pageParam,
        includeManual,
        session?.accessToken as string,
      ),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 60_000,
    enabled:
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!fromDate &&
      !!toDate,
  });
}
