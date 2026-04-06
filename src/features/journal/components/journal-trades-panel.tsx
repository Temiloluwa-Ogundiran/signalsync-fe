"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { JournalTradesPanelRow } from "../types";

interface JournalTradesPanelProps {
  rows: JournalTradesPanelRow[];
  isLoading?: boolean;
}

export function JournalTradesPanel({ rows, isLoading = false }: JournalTradesPanelProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "open">("recent");
  const activeRows = activeTab === "recent" ? rows : [];

  return (
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <div className="flex items-center gap-2 border-b border-border-primary/60 px-4 pt-3">
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "pb-2 text-sm",
            activeTab === "recent"
              ? "border-b-2 border-(--calendar-selected-ring) font-semibold text-(--calendar-selected-ring)"
              : "text-text-secondary",
          )}
        >
          Recent Trades
        </button>
        <button
          onClick={() => setActiveTab("open")}
          className={cn(
            "pb-2 text-sm",
            activeTab === "open"
              ? "border-b-2 border-(--calendar-selected-ring) font-semibold text-(--calendar-selected-ring)"
              : "text-text-secondary",
          )}
        >
          Open Positions
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="grid grid-cols-3 rounded-full bg-bg-tertiary px-4 py-2 text-xs font-semibold text-text-primary">
          <span>Close Date</span>
          <span className="text-center">Symbol</span>
          <span className="text-right">Net P&L</span>
        </div>

        <div className="mt-2 divide-y divide-border-primary/60">
          {isLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <div key={`recent-trade-skeleton-${idx}`} className="grid grid-cols-3 py-3">
                  <div className="h-5 animate-pulse rounded bg-bg-tertiary" />
                  <div className="mx-auto h-5 w-16 animate-pulse rounded bg-bg-tertiary" />
                  <div className="ml-auto h-5 w-20 animate-pulse rounded bg-bg-tertiary" />
                </div>
              ))
            : activeRows.map((row) => (
                <div key={row.id} className="grid grid-cols-3 py-3 text-sm">
                  <span className="text-text-primary">{row.closeDate}</span>
                  <span className="text-center text-text-primary">{row.symbol}</span>
                  <span
                    className={cn(
                      "text-right",
                      row.netPnl >= 0 ? "text-kpi-metric-positive" : "text-danger",
                    )}
                  >
                    {row.netPnl >= 0 ? "+" : "-"}$
                    {Math.abs(row.netPnl).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
        </div>

        {!isLoading && activeRows.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-secondary">
            {activeTab === "recent"
              ? "No closed trades found in this date range."
              : "Open positions panel will be available soon."}
          </p>
        ) : null}

        <button className="mt-2 w-full text-center text-sm font-semibold text-(--calendar-selected-ring)">
          View more
        </button>
      </div>
    </section>
  );
}

