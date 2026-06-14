"use client";

import { useMemo } from "react";
import { Sparkles, NotebookText, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayEquityCurve } from "./day-equity-curve";
import type { JournalIntradayCurvePoint } from "../types";

interface DaySummary {
  /** YYYY-MM-DD */
  date: string;
  netPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  hasNote: boolean;
}

interface JournalDayCardProps {
  day: DaySummary;
  /** Intraday cumulative-P&L points for the mini sparkline. */
  curve: JournalIntradayCurvePoint[];
  onReview: (date: string) => void;
  onNote: (date: string) => void;
  /** Open the full day-details page. */
  onOpenDay: (date: string) => void;
}

function money(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

/** Cumulative curve → chart points, prefixed with a 0 baseline. */
function toChartData(points: JournalIntradayCurvePoint[]) {
  if (points.length === 0) return [];
  return [
    { i: 0, v: 0 },
    ...points.map((p, idx) => ({ i: idx + 1, v: p.cumulative_pnl })),
  ];
}

export function JournalDayCard({
  day,
  curve,
  onReview,
  onNote,
  onOpenDay,
}: JournalDayCardProps) {
  const pnlColor =
    day.netPnl < 0
      ? "text-danger"
      : day.netPnl > 0
        ? "text-kpi-metric-positive"
        : "text-text-tertiary";

  const chartData = useMemo(() => toChartData(curve), [curve]);
  const hasCurve = chartData.length > 1;

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={() => onOpenDay(day.date)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDay(day.date);
        }
      }}
      aria-label={`Open day details for ${formatDateLabel(day.date)}`}
      className="group/day flex cursor-pointer items-center gap-6 rounded-2xl bg-card-bg px-5 py-4 ring-1 ring-white/[0.04] transition-colors hover:bg-white/[0.02] hover:ring-white/[0.08]"
    >
      {/* Left cluster: date · journaled dot, P&L, trades — grouped, not columns */}
      <div className="flex w-[180px] shrink-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {day.hasNote ? (
            <span
              aria-hidden
              title="Journaled"
              className="size-[7px] shrink-0 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_rgba(139,92,246,0.7)]"
            />
          ) : null}
          <span className="truncate text-[15px] font-bold text-text-primary">
            {formatDateLabel(day.date)}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className={cn("text-base font-bold tabular-nums", pnlColor)}>
            {day.netPnl === 0 ? "$0" : money(day.netPnl)}
          </span>
          {/* Quiet stat line: trades · W/L — text, not badges. */}
          <span className="text-xs tabular-nums text-text-secondary">
            {day.tradeCount} {day.tradeCount === 1 ? "trade" : "trades"}
            {day.tradeCount > 0 ? (
              <>
                {" · "}
                <span className="font-semibold text-[#22C55E]">
                  {day.winCount}W
                </span>{" "}
                <span className="font-semibold text-[#EF4444]">
                  {day.lossCount}L
                </span>
              </>
            ) : null}
          </span>
        </div>
      </div>

      {/* Middle: day-shape sparkline — fixed, modest size (doesn't stretch). */}
      <div className="hidden h-10 w-[180px] shrink-0 items-center md:flex">
        {hasCurve ? (
          <DayEquityCurve
            data={chartData}
            solidColor={day.netPnl < 0 ? "loss" : "win"}
            className="h-full w-full"
          />
        ) : null}
      </div>

      {/* Right: actions — Add note is the hero on the Journal page */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReview(day.date);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(139,92,246,0.10)] px-3 py-2 text-xs font-semibold text-[#A78BFA] transition-colors hover:bg-[rgba(139,92,246,0.16)] cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Review with Partna AI</span>
          <span className="sm:hidden">Review</span>
        </button>
        {day.hasNote ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNote(day.date);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(139,92,246,0.12)] px-3.5 py-2 text-xs font-semibold text-[#A78BFA] transition-colors hover:bg-[rgba(139,92,246,0.18)] cursor-pointer"
          >
            <NotebookText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View note</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNote(day.date);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-[#0a0a0b] transition-colors hover:bg-white/90 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add note</span>
          </button>
        )}
        {/* Visual affordance only — the whole card opens the day details. */}
        <ChevronRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover/day:text-text-secondary"
        />
      </div>
    </section>
  );
}
