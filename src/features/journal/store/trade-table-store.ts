import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VisibilityState, ColumnOrderState } from "@tanstack/react-table";

type TradeTableState = {
  /** Column id -> visible. Absent = visible (default-on). */
  columnVisibility: VisibilityState;
  setColumnVisibility: (
    updater: VisibilityState | ((prev: VisibilityState) => VisibilityState),
  ) => void;

  /** Persisted column order (ids). Empty = registry/default order. */
  columnOrder: ColumnOrderState;
  setColumnOrder: (
    updater: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState),
  ) => void;

  /** Favorited trade ids (client-only — no backend favorite field yet). */
  favorites: Record<string, true>;
  toggleFavorite: (tradeId: string) => void;
};

export const useTradeTableStore = create<TradeTableState>()(
  persist(
    (set) => ({
      columnVisibility: {},
      setColumnVisibility: (updater) =>
        set((s) => ({
          columnVisibility:
            typeof updater === "function"
              ? updater(s.columnVisibility)
              : updater,
        })),

      columnOrder: [],
      setColumnOrder: (updater) =>
        set((s) => ({
          columnOrder:
            typeof updater === "function" ? updater(s.columnOrder) : updater,
        })),

      favorites: {},
      toggleFavorite: (tradeId) =>
        set((s) => {
          const next = { ...s.favorites };
          if (next[tradeId]) delete next[tradeId];
          else next[tradeId] = true;
          return { favorites: next };
        }),
    }),
    { name: "trade-table", version: 1 },
  ),
);
