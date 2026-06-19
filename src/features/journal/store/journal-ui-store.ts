import { create } from "zustand";
import { persist } from "zustand/middleware";

type JournalUiState = {
  activeAccountId: string;
  setActiveAccountId: (id: string) => void;
  connectModalOpen: boolean;
  openConnectModal: () => void;
  setConnectModalOpen: (open: boolean) => void;

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
      setConnectModalOpen: (open: boolean) =>
        set((state) => ({
          connectModalOpen: open,
          csvReimportAccountId: open ? state.csvReimportAccountId : null,
        })),

      csvReimportAccountId: null,
      openCSVReimportModal: (accountId: string) =>
        set({ csvReimportAccountId: accountId, connectModalOpen: true }),
      setCSVReimportAccountId: (id: string | null) => set({ csvReimportAccountId: id }),
    }),
    {
      name: "journal-ui",
      version: 1,
      migrate: (persisted: unknown, version: number) =>
        version < 1
          ? { activeAccountId: "" }
          : (persisted as JournalUiState),
      partialize: (state) => ({
        activeAccountId: state.activeAccountId,
      }),
    },
  ),
);
