"use client";

import { Sparkles, NotebookText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EquityCurve } from "./equity-curve";
import type { CurveIntradayDay } from "../types";

interface JournalDayCardProps {
  date: string; // YYYY-MM-DD
  /** Full per-day curve + stats from the intraday fetch (undefined if no trades). */
  day?: CurveIntradayDay;
  /** From the calendar feed: net P&L + counts when there's no intraday day. */
  netPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  hasNote: boolean;
  onReview: (date: string) => void;
  onNote: (date: string) => void;
}

function money(value: number, withSign = true): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!withSign) return `$${abs}`;
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

function formatDateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function JournalDayCard({
  date,
  day,
  netPnl,
  tradeCount,
  winCount,
  lossCount,
  hasNote,
  onReview,
  onNote,
}: JournalDayCardProps) {
  const net = day?.net_pnl ?? netPnl;
  const trades = day?.trades_count ?? tradeCount;
  const wins = day?.win_count ?? winCount;
  const losses = day?.loss_count ?? lossCount;
  const curve = day?.points ?? [];
  const hasCurve = curve.length > 1;

  const pnlColor =
    net < 0
      ? "text-danger"
      : net > 0
        ? "text-kpi-metric-positive"
        : "text-text-tertiary";

  return (
    <section className="rounded-2xl bg-card-bg px-5 py-4 ring-1 ring-white/[0.04] md:px-6 md:py-5">
      {/* Header row: date · • · Net P&L … actions */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {hasNote ? (
          <span
            aria-hidden
            title="Journaled"
            className="size-[7px] shrink-0 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_rgba(139,92,246,0.7)]"
          />
        ) : null}
        <span className="text-base font-bold text-text-primary">
          {formatDateLabel(date)}
        </span>
        <span className="text-text-tertiary/50">•</span>
        <span className={cn("text-base font-bold tabular-nums", pnlColor)}>
          Net P&amp;L {net === 0 ? "$0" : money(net)}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onReview(date)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(139,92,246,0.10)] px-3 py-2 text-xs font-semibold text-[#A78BFA] transition-colors hover:bg-[rgba(139,92,246,0.16)] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Review with Partna AI</span>
            <span className="sm:hidden">Review</span>
          </button>
          <button
            type="button"
            onClick={() => onNote(date)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer",
              hasNote
                ? "bg-[rgba(139,92,246,0.12)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.18)]"
                : "bg-white font-bold text-[#0a0a0b] hover:bg-white/90",
            )}
          >
            {hasNote ? (
              <>
                <NotebookText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View note</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add note</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body: equity curve + 2×4 stat grid */}
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center">
        {hasCurve ? (
          <EquityCurve
            data={curve}
            xKey="i"
            colorMode="split"
            size="full"
            showAxes
            className="h-40 w-full shrink-0 lg:w-[34%]"
          />
        ) : (
          <div className="flex h-40 w-full shrink-0 items-center justify-center text-sm text-text-secondary lg:w-[34%]">
            No trade data for this day
          </div>
        )}

        <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
          <Stat label="Total Trades" value={String(trades)} />
          <Stat
            label="Gross P&L"
            value={day ? money(day.gross_pnl) : "--"}
            tone={day && day.gross_pnl < 0 ? "loss" : day && day.gross_pnl > 0 ? "win" : undefined}
          />
          <Stat label="Winners / Losers" value={`${wins} / ${losses}`} />
          <Stat
            label="Commissions"
            value={day ? money(day.commissions, false) : "--"}
          />
          <Stat
            label="Win Rate"
            value={day ? `${day.win_rate.toFixed(2)}%` : "--"}
          />
          <Stat
            label="Volume"
            value={
              day
                ? day.volume.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })
                : "--"
            }
          />
          <Stat
            label="Profit Factor"
            value={
              day
                ? day.profit_factor === null
                  ? "--"
                  : day.profit_factor.toFixed(2)
                : "--"
            }
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "win" | "loss";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <span
        className={cn(
          "text-lg font-bold tabular-nums text-text-primary",
          tone === "loss" && "text-danger",
          tone === "win" && "text-kpi-metric-positive",
        )}
      >
        {value}
      </span>
    </div>
  );
}
