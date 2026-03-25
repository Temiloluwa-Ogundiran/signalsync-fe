import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalDailyApi } from "../api/journal-daily.api";
import { journalTradesApi } from "../api/journal-trades.api";
import type { JournalCreateMessagePayload } from "../types";

export const JOURNAL_DAY_MODAL_KEYS = {
  daily: (token: string | undefined, accountId?: string, day?: string) =>
    ["journal-day", "daily", token, accountId, day] as const,
  trades: (token: string | undefined, accountId?: string, day?: string) =>
    ["journal-day", "trades", token, accountId, day] as const,
  tradeMessages: (token: string | undefined, tradeId?: string) =>
    ["journal-day", "trade-messages", token, tradeId] as const,
};

export function useJournalDay(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.daily(
      session?.accessToken,
      accountId,
      tradingDate,
    ),
    queryFn: () =>
      journalDailyApi.getDay(
        accountId as string,
        tradingDate as string,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
  });
}

export function useJournalDayTrades(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
      session?.accessToken,
      accountId,
      tradingDate,
    ),
    queryFn: () =>
      journalTradesApi.listByDay(
        accountId as string,
        tradingDate as string,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
  });
}

export function useCreateJournalDayMessage(
  accountId?: string,
  tradingDate?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dailyJournalId,
      payload,
    }: {
      dailyJournalId: string;
      payload: JournalCreateMessagePayload;
    }) =>
      journalDailyApi.createDayMessage(
        dailyJournalId,
        payload,
        session?.accessToken as string,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.daily(
          session?.accessToken,
          accountId,
          tradingDate,
        ),
      });
    },
  });
}

export function useCreateJournalTradeMessage(
  accountId?: string,
  tradingDate?: string,
) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradeId,
      payload,
    }: {
      tradeId: string;
      payload: JournalCreateMessagePayload;
    }) =>
      journalTradesApi.createTradeMessage(
        tradeId,
        payload,
        session?.accessToken as string,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.daily(
          session?.accessToken,
          accountId,
          tradingDate,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.trades(
          session?.accessToken,
          accountId,
          tradingDate,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
          session?.accessToken,
          variables.tradeId,
        ),
      });
    },
  });
}

export function useTradeJournalMessages(tradeId?: string, enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(
      session?.accessToken,
      tradeId,
    ),
    queryFn: () =>
      journalTradesApi.getTradeJournalMessages(
        tradeId as string,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!tradeId,
  });
}
