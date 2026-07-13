import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalDailyApi } from "../api/journal-daily.api";

export const JOURNAL_DAY_MODAL_KEYS = {
  daily: (accountId?: string, day?: string, includeMessages = true) =>
    ["journal-day", "daily", accountId, day, includeMessages] as const,
  tradeMessages: (tradeId?: string) =>
    ["journal-day", "trade-messages", tradeId] as const,
};

export function useJournalDay(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
  options?: { includeMessages?: boolean },
) {
  const { data: session, status } = useSession();
  const includeMessages = options?.includeMessages ?? true;

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.daily(
      accountId,
      tradingDate,
      includeMessages,
    ),
    queryFn: () =>
      journalDailyApi.getDay(
        accountId as string,
        tradingDate as string,
        includeMessages,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
    staleTime: 60_000,
  });
}
