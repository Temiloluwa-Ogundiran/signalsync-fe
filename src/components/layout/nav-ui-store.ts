import { create } from "zustand";
import { persist } from "zustand/middleware";

type NavUiState = {
  /** Tier 2 (contextual sidebar) expanded vs collapsed-to-rail. Default expanded. */
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

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
    },
  ),
);
