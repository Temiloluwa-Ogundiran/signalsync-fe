"use client";

import { useCallback, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTradesApi } from "../api/journal-trades.api";
import type { JournalMessage, JournalTrade } from "../types";
import { useJournalDay, JOURNAL_DAY_MODAL_KEYS } from "./use-journal-day-modal";
import { useDayNote, useSaveDayNote } from "./use-day-note";
import { useJournalUiStore } from "../store/journal-ui-store";

export type SessionMood = "good" | "neutral" | "charged";

/**
 * Mood has no first-class backend field, so we persist it as a leading HTML
 * comment in the day note (`<!--mood:good-->note text`). These helpers encode
 * and decode it without disturbing the user's text.
 * TODO(backend): replace with a real mood field on the day note.
 */
const MOOD_RE = /^<!--mood:(good|neutral|charged)-->/;

function decodeNote(html: string | null | undefined): {
  note: string;
  mood: SessionMood | null;
} {
  if (!html) return { note: "", mood: null };
  const match = MOOD_RE.exec(html);
  if (match) {
    return { note: html.slice(match[0].length), mood: match[1] as SessionMood };
  }
  return { note: html, mood: null };
}

function encodeNote(note: string, mood: SessionMood | null): string | null {
  const trimmed = note.trim();
  if (!trimmed && !mood) return null;
  return mood ? `<!--mood:${mood}-->${trimmed}` : trimmed;
}

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
  const includeManual = useJournalUiStore((s) => s.includeManualTrades);

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
  const { note: initialNote, mood: initialMood } = useMemo(
    () => decodeNote(noteQuery.data?.note_html),
    [noteQuery.data?.note_html],
  );

  const saveMutation = useSaveDayNote(accountId, date);
  const saveNote = useCallback(
    (note: string, mood: SessionMood | null) => {
      saveMutation.mutate(encodeNote(note, mood));
    },
    [saveMutation],
  );

  const prefetch = useCallback(() => {
    if (!accountId || !date || !token) return;
    queryClient.prefetchQuery({
      queryKey: JOURNAL_DAY_MODAL_KEYS.daily(accountId, date, false, includeManual),
      queryFn: () =>
        import("../api/journal-daily.api").then((m) =>
          m.journalDailyApi.getDay(accountId, date, false, includeManual, token),
        ),
      staleTime: 60_000,
    });
  }, [accountId, date, token, includeManual, queryClient]);

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
    initialMood,
    saveNote,
    isSaving: saveMutation.isPending,
    prefetch,
  };
}
