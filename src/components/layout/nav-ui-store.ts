import { create } from "zustand";
import { persist } from "zustand/middleware";

type NavUiState = {
  /** Tier 2 (contextual sidebar) expanded vs collapsed-to-rail. Default expanded. */
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  /**
   * Off-canvas nav drawer open state (small screens only). NOT persisted —
   * the drawer must always start closed on load, never reopen from storage.
   */
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;

  /**
   * Per-collapsible-group open state, keyed by a stable `${appId}:${header}`.
   * Absent key => group is open (groups default to expanded for discoverability).
   */
  groupCollapsed: Record<string, boolean>;
  toggleGroup: (groupKey: string) => void;
};

export const useNavUiStore = create<NavUiState>()(
  persist(
    (set) => ({
      sidebarExpanded: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

      mobileNavOpen: false,
      openMobileNav: () => set({ mobileNavOpen: true }),
      closeMobileNav: () => set({ mobileNavOpen: false }),
      toggleMobileNav: () =>
        set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

      groupCollapsed: {},
      toggleGroup: (groupKey) =>
        set((state) => ({
          groupCollapsed: {
            ...state.groupCollapsed,
            [groupKey]: !state.groupCollapsed[groupKey],
          },
        })),
    }),
    {
      name: "nav-ui",
      version: 1,
      // Never persist the transient drawer state — it must start closed on load.
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        groupCollapsed: state.groupCollapsed,
      }),
    },
  ),
);
