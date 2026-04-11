import { create } from "zustand";
import { persist } from "zustand/middleware";

type JournalUiState = {
  activeAccountId: string;
  setActiveAccountId: (id: string) => void;
  connectModalOpen: boolean;
  openConnectModal: () => void;
  setConnectModalOpen: (open: boolean) => void;
};

export const useJournalUiStore = create<JournalUiState>()(
  persist(
    (set) => ({
      activeAccountId: "",
      setActiveAccountId: (id: string) => set({ activeAccountId: id }),
      connectModalOpen: false,
      openConnectModal: () => set({ connectModalOpen: true }),
      setConnectModalOpen: (open: boolean) => set({ connectModalOpen: open }),
    }),
    {
      name: "journal-ui",
      partialize: (state) => ({ activeAccountId: state.activeAccountId }),
    },
  ),
);
