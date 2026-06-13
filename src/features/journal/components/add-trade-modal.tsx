"use client";

import { useJournalUiStore } from "../store/journal-ui-store";
import { TradeFormModal } from "./trade-form-modal";

/**
 * Thin wrapper around {@link TradeFormModal} in create mode. Wires the
 * journal UI store's add-trade modal open/close state and prefilled date.
 */
export function AddTradeModal() {
  const addTradeModalOpen = useJournalUiStore((s) => s.addTradeModalOpen);
  const setAddTradeModalOpen = useJournalUiStore((s) => s.setAddTradeModalOpen);
  const prefilledAddTradeDate = useJournalUiStore(
    (s) => s.prefilledAddTradeDate,
  );

  return (
    <TradeFormModal
      mode="create"
      open={addTradeModalOpen}
      onOpenChange={setAddTradeModalOpen}
      prefilledDate={prefilledAddTradeDate}
    />
  );
}
