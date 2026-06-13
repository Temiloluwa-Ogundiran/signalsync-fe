"use client";

import { cn } from "@/lib/utils";

import {
  formatAvgWinLossRatioDisplay,
  formatCompactMoney,
  winLossShare,
} from "../lib/journal-widget-mappers";
import { JournalKpiInfo } from "./journal-kpi-info";

interface JournalKpiAvgWinLossProps {
  avgWin: number;
  avgLoss: number;
  className?: string;
}

export function JournalKpiAvgWinLoss({
  avgWin,
  avgLoss,
  className,
}: JournalKpiAvgWinLossProps) {
  const share = winLossShare(avgWin, avgLoss);
  const ratioLabel = formatAvgWinLossRatioDisplay(avgWin, avgLoss);

  return (
    <article
      className={cn(
        "flex min-h-[6.875rem] min-w-0 flex-col items-stretch justify-center gap-2.5 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-3 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        <span className="truncate text-xs font-semibold leading-tight text-footnote-online min-[1400px]:text-sm">
          Avg Win/Loss Trade
        </span>
        <JournalKpiInfo
          title="Avg Win/Loss Trade"
          description="Average winning trade size compared with average losing trade size. Higher ratio means winners are larger relative to losers."
        />
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="min-w-0 shrink-0 font-heading text-[1.55rem] font-bold leading-none tracking-normal text-kpi-metric-neutral tabular-nums min-[1400px]:text-[1.75rem] 2xl:text-[1.95rem]">
          {ratioLabel}
        </p>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 pt-0.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-kpi-legend-loss-fg">
            <div
              className="absolute left-0 top-0 h-full min-w-0 rounded-full bg-kpi-metric-positive"
              style={{ width: `${share * 100}%` }}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-1 text-[10px] font-normal leading-tight min-[1400px]:text-xs">
            <span className="min-w-0 truncate text-kpi-metric-positive tabular-nums">
              {formatCompactMoney(avgWin)}
            </span>
            <span className="min-w-0 truncate text-right text-kpi-legend-loss-fg tabular-nums">
              {formatCompactMoney(Math.abs(avgLoss))}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
