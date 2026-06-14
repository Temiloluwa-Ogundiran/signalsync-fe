"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  JournalOpenPositionsPanelRow,
  JournalTradesPanelRow,
} from "../types";

interface JournalTradesPanelProps {
  recentRows: JournalTradesPanelRow[];
  openRows: JournalOpenPositionsPanelRow[];
  isRecentLoading?: boolean;
  isOpenLoading?: boolean;
  recentErrorMessage?: string | null;
  openErrorMessage?: string | null;
}

function JournalTradesPanelImpl({
  recentRows,
  openRows,
  isRecentLoading = false,
  isOpenLoading = false,
  recentErrorMessage = null,
  openErrorMessage = null,
}: JournalTradesPanelProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "open">("recent");
  const activeRows = activeTab === "recent" ? recentRows : openRows;
  const isLoading = activeTab === "recent" ? isRecentLoading : isOpenLoading;
  const errorMessage =
    activeTab === "recent" ? recentErrorMessage : openErrorMessage;
  const dateHeader = activeTab === "recent" ? "Close Date" : "Open Date";
  const pnlHeader = activeTab === "recent" ? "Net P&L" : "Floating P&L";
  const emptyStateMessage =
    activeTab === "recent"
      ? "No closed trades found in this date range."
      : "No open positions right now.";
  const href =
    activeTab === "recent"
      ? "/trade-history"
      : "/trade-history?tab=open-positions";

  return (
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <div className="flex items-center gap-4 border-b border-border-primary/60 px-4 pt-4 pb-2">
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "pb-2 text-sm cursor-pointer",
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
            "pb-2 text-sm cursor-pointer",
            activeTab === "open"
              ? "border-b-2 border-(--calendar-selected-ring) font-semibold text-(--calendar-selected-ring)"
              : "text-text-secondary",
          )}
        >
          Open Positions
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium text-text-secondary">
          <span>{dateHeader}</span>
          <span className="text-center">Symbol</span>
          <span className="text-right">{pnlHeader}</span>
        </div>

        <div className="mt-1 divide-y divide-border-primary">
          {isLoading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`recent-trade-skeleton-${idx}`}
                  className="grid grid-cols-3 py-3"
                >
                  <div className="h-5 animate-pulse rounded bg-bg-tertiary" />
                  <div className="mx-auto h-5 w-16 animate-pulse rounded bg-bg-tertiary" />
                  <div className="ml-auto h-5 w-20 animate-pulse rounded bg-bg-tertiary" />
                </div>
              ))
            : activeRows.map((row) => (
                <div key={row.id} className="grid grid-cols-3 py-3 text-sm">
                  <span className="tabular-nums text-text-primary">
                    {"closeDate" in row ? row.closeDate : row.openDate}
                  </span>
                  <span className="text-center text-text-primary">
                    {row.symbol}
                  </span>
                  <span
                    className={cn(
                      "text-right tabular-nums",
                      ("netPnl" in row ? row.netPnl : row.floatingPnl) >= 0
                        ? "text-kpi-metric-positive"
                        : "text-danger",
                    )}
                  >
                    {("netPnl" in row ? row.netPnl : row.floatingPnl) < 0
                      ? "-"
                      : ""}
                    $
                    {Math.abs(
                      "netPnl" in row ? row.netPnl : row.floatingPnl,
                    ).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
        </div>

        {!isLoading && errorMessage ? (
          <p className="py-4 text-center text-sm text-danger">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage && activeRows.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-secondary">
            {emptyStateMessage}
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-2 block w-full text-center text-sm font-semibold text-(--calendar-selected-ring) transition-colors hover:opacity-90"
        >
          View more
        </Link>
      </div>
    </section>
  );
}

export const JournalTradesPanel = memo(JournalTradesPanelImpl);
