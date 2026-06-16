"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "@/lib/utils";
import type { JournalTradesPanelRow } from "../types";

interface JournalTradesPanelProps {
  recentRows: JournalTradesPanelRow[];
  isRecentLoading?: boolean;
  recentErrorMessage?: string | null;
}

const HAIRLINE = "border-[rgba(255,255,255,0.06)]";

function money(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

function JournalTradesPanelImpl({
  recentRows,
  isRecentLoading = false,
  recentErrorMessage = null,
}: JournalTradesPanelProps) {
  const isEmpty =
    !isRecentLoading && !recentErrorMessage && recentRows.length === 0;

  return (
    <section className="flex h-full min-h-[22rem] flex-col rounded-xl bg-card-bg">
      <div className="px-5 pt-5 pb-1">
        <h2 className="text-sm font-semibold text-text-primary">
          Recent Trades
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-2 pb-4">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 pb-2 text-[11px] font-medium tracking-wide text-text-secondary uppercase">
          <span>Close Date</span>
          <span>Symbol</span>
          <span className="text-right">Net P&amp;L</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isRecentLoading ? (
            <div className={cn("divide-y", `divide-[rgba(255,255,255,0.06)]`)}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`recent-trade-skeleton-${idx}`}
                  className="grid grid-cols-[1fr_1fr_auto] gap-3 py-2.5"
                >
                  <div className="h-4 w-20 animate-pulse rounded bg-bg-tertiary" />
                  <div className="h-4 w-16 animate-pulse rounded bg-bg-tertiary" />
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-bg-tertiary" />
                </div>
              ))}
            </div>
          ) : (
            <div className={cn("divide-y", "divide-[rgba(255,255,255,0.06)]")}>
              {recentRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 py-2.5 text-sm"
                >
                  <span className="tabular-nums text-text-primary">
                    {row.closeDate}
                  </span>
                  <span className="flex items-center gap-2 text-text-primary">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        row.netPnl >= 0 ? "bg-success" : "bg-danger",
                      )}
                      aria-hidden
                    />
                    {row.symbol}
                  </span>
                  <span
                    className={cn(
                      "text-right tabular-nums font-medium",
                      row.netPnl >= 0
                        ? "text-kpi-metric-positive"
                        : "text-danger",
                    )}
                  >
                    {money(row.netPnl)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {recentErrorMessage ? (
            <p className="py-4 text-center text-sm text-danger">
              {recentErrorMessage}
            </p>
          ) : null}

          {isEmpty ? (
            <p className="py-4 text-center text-sm text-text-secondary">
              No closed trades found in this date range.
            </p>
          ) : null}
        </div>

        <Link
          href="/trade-history"
          className={cn(
            "mt-3 block w-full shrink-0 border-t pt-3 text-center text-sm font-semibold text-(--calendar-selected-ring) transition-colors hover:opacity-90",
            HAIRLINE,
          )}
        >
          View more
        </Link>
      </div>
    </section>
  );
}

export const JournalTradesPanel = memo(JournalTradesPanelImpl);
