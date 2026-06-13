"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useJournalUiStore } from "../store/journal-ui-store";
import type { JournalTrade } from "../types";
import { TradeFormModal } from "./trade-form-modal";

/**
 * Thin wrapper around {@link TradeFormModal} in edit mode. Resolves the trade
 * entity being edited from the React Query cache (no extra fetch) using the
 * `editTradeId` held in the journal UI store.
 */
export function EditTradeModal() {
  const editTradeModalOpen = useJournalUiStore((s) => s.editTradeModalOpen);
  const setEditTradeModalOpen = useJournalUiStore(
    (s) => s.setEditTradeModalOpen,
  );
  const editTradeId = useJournalUiStore((s) => s.editTradeId);

  // Resolve the trade entity from the React Query cache (no extra fetch needed).
  const queryClient = useQueryClient();
  const editTradeData = useMemo<JournalTrade | null>(() => {
    if (!editTradeId) return null;
    // Search day-journal query caches
    for (const [, data] of queryClient.getQueriesData<{
      trades?: JournalTrade[];
    }>({ queryKey: ["journal-day"] })) {
      const found = data?.trades?.find((t) => t.id === editTradeId);
      if (found) return found;
    }
    // Search trade-history infinite query caches
    for (const [, data] of queryClient.getQueriesData<{
      pages?: Array<{ items?: JournalTrade[] }>;
    }>({ queryKey: ["journal-trade-history"] })) {
      for (const page of data?.pages ?? []) {
        const found = page?.items?.find((t) => t.id === editTradeId);
        if (found) return found;
      }
    }
    return null;
  }, [editTradeId, queryClient]);

  return (
    <TradeFormModal
      mode="edit"
      open={editTradeModalOpen}
      onOpenChange={setEditTradeModalOpen}
      trade={editTradeData}
      tradeId={editTradeId}
    />
  );
}
