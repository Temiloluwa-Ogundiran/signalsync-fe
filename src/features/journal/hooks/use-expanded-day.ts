"use client";

import { useCallback, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTradesApi } from "../api/journal-trades.api";
import type { JournalMessage, JournalTrade } from "../types";
import { useJournalDay, JOURNAL_DAY_MODAL_KEYS } from "./use-journal-day-modal";
import { useDayNote, useSaveDayNote } from "./use-day-note";
import { htmlToText } from "@/lib/format/html-to-text";

/**
 * Powers the expanded day card: lazily loads the day's trades + per-trade
 * journal messages (only for trades that have notes), plus the session note,
 * and exposes a `prefetch` for hover warm-up and a `saveNote` mutation.
 */
export function useExpandedDay(
  accountId: string,
  date: string,
  enabled: boolean,
) {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;
  const queryClient = useQueryClient();

  const dayQuery = useJournalDay(accountId, date, enabled, {
    includeMessages: false,
  });

  const trades: JournalTrade[] = useMemo(
    () => dayQuery.data?.trades ?? [],
    [dayQuery.data?.trades],
  );

  // Only trades that actually carry journal messages need a per-trade fetch.
  const notedTradeIds = useMemo(() => {
    const counts = new Map(
      (dayQuery.data?.trade_chips ?? []).map((c) => [c.trade_id, c.journal_message_count]),
    );
    return trades.filter((t) => (counts.get(t.id) ?? 0) > 0).map((t) => t.id);
  }, [trades, dayQuery.data?.trade_chips]);

  const messageQueries = useQueries({
    queries: notedTradeIds.map((tradeId) => ({
      queryKey: JOURNAL_DAY_MODAL_KEYS.tradeMessages(tradeId),
      queryFn: () => journalTradesApi.getTradeJournalMessages(tradeId, token as string),
      enabled: enabled && !!token,
      staleTime: 60_000,
    })),
  });

  const messagesByTradeId = useMemo(() => {
    const map = new Map<string, JournalMessage[]>();
    notedTradeIds.forEach((tradeId, i) => {
      const data = messageQueries[i]?.data;
      if (data) map.set(tradeId, data);
    });
    return map;
  }, [notedTradeIds, messageQueries]);

  const noteQuery = useDayNote(accountId, date, enabled);
  // The note is stored as HTML (legacy) but edited as plain text — strip tags so
  // empty scaffolding (e.g. "<blockquote><p></p></blockquote>") shows as blank.
  const initialNote = htmlToText(noteQuery.data?.note_html);

  const saveMutation = useSaveDayNote(accountId, date);
  const saveNote = useCallback(
    (noteHtml: string) =>
      saveMutation.mutateAsync(noteHtml.trim() ? noteHtml : null),
    [saveMutation],
  );

  const prefetch = useCallback(() => {
    if (!accountId || !date || !token) return;
    queryClient.prefetchQuery({
      queryKey: JOURNAL_DAY_MODAL_KEYS.daily(accountId, date, false),
      queryFn: () =>
        import("../api/journal-daily.api").then((m) =>
          m.journalDailyApi.getDay(accountId, date, false, token),
        ),
      staleTime: 60_000,
    });
  }, [accountId, date, token, queryClient]);

  const isLoading =
    enabled &&
    (dayQuery.isLoading ||
      noteQuery.isLoading ||
      messageQueries.some((q) => q.isLoading));

  return {
    isLoading,
    tradeList: trades,
    messagesByTradeId,
    initialNote,
    saveNote,
    isSaving: saveMutation.isPending,
    prefetch,
  };
}
