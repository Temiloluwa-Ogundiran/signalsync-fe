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
        "flex min-h-[7.625rem] min-w-0 flex-col items-stretch justify-center gap-3 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-4 py-3 shadow-sm",
        className,
      )}
    >
      {/* <div className="flex min-w-0 flex-1 flex-col justify-center gap-1"> */}
      {/* top part */}
      {/* </div> */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs sm:text-sm font-semibold leading-tight text-footnote-online">
          Avg Win/Loss Trade
        </span>
        <JournalKpiInfo
          title="Avg Win/Loss Trade"
          description="Average winning trade size compared with average losing trade size. Higher ratio means winners are larger relative to losers."
        />
      </div>

      {/* bottom part */}
      <div className="flex items-center justify-between gap-1">
        <p className="font-heading text-2xl xl:text-xl min-[1400px]:text-2xl 2xl:text-[2rem] font-bold leading-[1.2] tracking-[-0.03em] text-kpi-metric-neutral">
          {ratioLabel}
        </p>
        <div className="flex w-[7.5rem] xl:w-[6.2rem] min-[1400px]:w-[8rem] 2xl:w-[10.0625rem] shrink-0 flex-col justify-center gap-1.5 pt-0.5">
          <div className="relative h-[9px] w-full overflow-hidden rounded-full bg-kpi-legend-loss-fg">
            <div
              className="absolute left-0 top-0 h-full min-w-0 rounded-full bg-kpi-metric-positive"
              style={{ width: `${share * 100}%` }}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-1 text-[10px] sm:text-xs md:text-sm font-normal leading-tight">
            <span className="truncate text-kpi-metric-positive">
              {formatCompactMoney(avgWin)}
            </span>
            <span className="truncate text-right text-kpi-legend-loss-fg">
              {formatCompactMoney(Math.abs(avgLoss))}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
