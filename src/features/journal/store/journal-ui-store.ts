import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JournalTrade } from "../types";

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
  openEditTradeModal: (trade: JournalTrade) => void;
  setEditTradeModalOpen: (open: boolean) => void;
  editTradeData: JournalTrade | null;

  includeManualTrades: boolean;
  setIncludeManualTrades: (val: boolean) => void;

  csvReimportAccountId: string | null;
  openCSVReimportModal: (accountId: string) => void;
  setCSVReimportAccountId: (id: string | null) => void;
};

export const useJournalUiStore = create<JournalUiState>()(
  persist(
    (set) => ({
      activeAccountId: "",
      setActiveAccountId: (id: string) => set({ activeAccountId: id }),
      connectModalOpen: false,
      openConnectModal: () => set({ connectModalOpen: true, csvReimportAccountId: null }),
      setConnectModalOpen: (open: boolean) => set((state) => ({ 
        connectModalOpen: open,
        csvReimportAccountId: open ? state.csvReimportAccountId : null 
      })),
      
      addTradeModalOpen: false,
      openAddTradeModal: (date = null) => set({ addTradeModalOpen: true, prefilledAddTradeDate: date }),
      setAddTradeModalOpen: (open: boolean) => set({ addTradeModalOpen: open, prefilledAddTradeDate: open ? null : null }),
      prefilledAddTradeDate: null,
      
      editTradeModalOpen: false,
      openEditTradeModal: (trade: JournalTrade) => set({ editTradeModalOpen: true, editTradeData: trade }),
      setEditTradeModalOpen: (open: boolean) => set({ editTradeModalOpen: open, editTradeData: open ? null : null }),
      editTradeData: null,

      includeManualTrades: true,
      setIncludeManualTrades: (val: boolean) => set({ includeManualTrades: val }),

      csvReimportAccountId: null,
      openCSVReimportModal: (accountId: string) => set({ csvReimportAccountId: accountId, connectModalOpen: true }),
      setCSVReimportAccountId: (id: string | null) => set({ csvReimportAccountId: id }),
    }),
    {
      name: "journal-ui",
      partialize: (state) => ({ 
        activeAccountId: state.activeAccountId,
        includeManualTrades: state.includeManualTrades
      }),
    },
  ),
);
