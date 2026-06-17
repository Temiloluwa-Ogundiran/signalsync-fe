import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/api/query-keys";
import { journalTradesApi } from "../api/journal-trades.api";
import { useJournalUiStore } from "../store/journal-ui-store";

interface UseInfiniteTradeHistoryInput {
  accountId?: string;
  /** Optional date filter. When omitted, all trades are fetched (paginated). */
  fromDate?: string;
  toDate?: string;
}

export function useInfiniteTradeHistory({
  accountId,
  fromDate,
  toDate,
}: UseInfiniteTradeHistoryInput) {
  const { status } = useSession();
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

  return useInfiniteQuery({
    queryKey: queryKeys.journal.tradeHistoryRange(
      accountId,
      fromDate,
      toDate,
      includeManual,
    ),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      journalTradesApi.listRecent(
        accountId as string,
        fromDate,
        toDate,
        pageParam,
        includeManual,
      ),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 60_000,
    // No date gate: with no range, fetch all trades (paginated). Date is an
    // optional user filter, not a precondition.
    enabled: status === "authenticated" && !!accountId,
  });
}
