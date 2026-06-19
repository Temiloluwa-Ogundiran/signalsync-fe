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

  /** Clear all journal UI state. Call on logout so a new user on the same
   *  browser never inherits the previous user's selected account. */
  reset: () => void;
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

      reset: () =>
        set({
          activeAccountId: "",
          connectModalOpen: false,
          csvReimportAccountId: null,
        }),
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
