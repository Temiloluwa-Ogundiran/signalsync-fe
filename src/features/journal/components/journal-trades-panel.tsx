"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { JournalTradesPanelRow } from "../types";

interface JournalTradesPanelProps {
  rows: JournalTradesPanelRow[];
}

export function JournalTradesPanel({ rows }: JournalTradesPanelProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "open">("recent");

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
          {(activeTab === "recent" ? rows : rows.slice(0, 2)).map((row) => (
            <div key={row.id} className="grid grid-cols-3 py-3 text-sm">
              <span className="text-text-primary">{row.closeDate}</span>
              <span className="text-center text-text-primary">{row.symbol}</span>
              <span className="text-right text-text-primary">
                ${Math.abs(row.netPnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <button className="mt-2 w-full text-center text-sm font-semibold text-(--calendar-selected-ring)">
          View more
        </button>
      </div>
    </section>
  );
}

