import { create } from "zustand";
import { persist } from "zustand/middleware";

type JournalUiState = {
  activeAccountId: string;
  setActiveAccountId: (id: string) => void;
  connectModalOpen: boolean;
  openConnectModal: () => void;
  setConnectModalOpen: (open: boolean) => void;

  addTradeModalOpen: boolean;
  openAddTradeModal: (date?: string | null) => void;
  setAddTradeModalOpen: (open: boolean) => void;
  prefilledAddTradeDate: string | null;

  editTradeModalOpen: boolean;
  // Store the id, not the entity — entity lives in React Query cache.
  editTradeId: string | null;
  openEditTradeModal: (tradeId: string) => void;
  setEditTradeModalOpen: (open: boolean) => void;

  includeManualTrades: boolean;
  setIncludeManualTrades: (val: boolean) => void;

  csvReimportAccountId: string | null;
  openCSVReimportModal: (accountId: string) => void;
  setCSVReimportAccountId: (id: string | null) => void;

  // Day-note modal: the trading date being noted (YYYY-MM-DD), or null when closed.
  noteModalDate: string | null;
  openNoteModal: (date: string) => void;
  closeNoteModal: () => void;
};

export const useJournalUiStore = create<JournalUiState>()(
  persist(
    (set) => ({
      activeAccountId: "",
      setActiveAccountId: (id: string) => set({ activeAccountId: id }),
      connectModalOpen: false,
      openConnectModal: () => set({ connectModalOpen: true, csvReimportAccountId: null }),
      setConnectModalOpen: (open: boolean) =>
        set((state) => ({
          connectModalOpen: open,
          csvReimportAccountId: open ? state.csvReimportAccountId : null,
        })),

      addTradeModalOpen: false,
      openAddTradeModal: (date = null) =>
        set({ addTradeModalOpen: true, prefilledAddTradeDate: date }),
      setAddTradeModalOpen: (open: boolean) =>
        set((s) => ({
          addTradeModalOpen: open,
          prefilledAddTradeDate: open ? s.prefilledAddTradeDate : null,
        })),
      prefilledAddTradeDate: null,

      editTradeModalOpen: false,
      editTradeId: null,
      openEditTradeModal: (tradeId: string) =>
        set({ editTradeModalOpen: true, editTradeId: tradeId }),
      setEditTradeModalOpen: (open: boolean) =>
        set((state) => ({
          editTradeModalOpen: open,
          editTradeId: open ? state.editTradeId : null,
        })),

      includeManualTrades: true,
      setIncludeManualTrades: (val: boolean) => set({ includeManualTrades: val }),

      csvReimportAccountId: null,
      openCSVReimportModal: (accountId: string) =>
        set({ csvReimportAccountId: accountId, connectModalOpen: true }),
      setCSVReimportAccountId: (id: string | null) => set({ csvReimportAccountId: id }),

      noteModalDate: null,
      openNoteModal: (date: string) => set({ noteModalDate: date }),
      closeNoteModal: () => set({ noteModalDate: null }),
    }),
    {
      name: "journal-ui",
      version: 1,
      migrate: (persisted: unknown, version: number) =>
        version < 1
          ? { activeAccountId: "", includeManualTrades: true }
          : (persisted as JournalUiState),
      partialize: (state) => ({
        activeAccountId: state.activeAccountId,
        includeManualTrades: state.includeManualTrades,
      }),
    },
  ),
);
