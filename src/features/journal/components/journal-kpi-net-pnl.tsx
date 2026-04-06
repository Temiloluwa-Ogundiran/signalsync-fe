import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatNetPnlDisplay } from "../lib/journal-widget-mappers";
import { JournalKpiInfo } from "./journal-kpi-info";

interface JournalKpiNetPnlProps {
  totalNetPnl: number;
  totalTrades: number;
  className?: string;
}

export function JournalKpiNetPnl({
  totalNetPnl,
  totalTrades,
  className,
}: JournalKpiNetPnlProps) {
  const isNonNegative = totalNetPnl >= 0;

  return (
    <article
      className={cn(
        "relative flex min-h-[7.625rem] min-w-0 flex-col justify-between rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex h-full justify-between gap-3">
        <div className="min-w-0 flex flex-col justify-center h-full space-y-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-sm font-semibold leading-tight text-footnote-online">
              Net P&L
            </span>
            <JournalKpiInfo
              title="Net P&L"
              description="Your total realized profit or loss for the selected date range, after costs. Positive means net gain; negative means net loss."
            />
            <span className="inline-flex min-h-[1.3125rem] ml-[7.5px] items-center justify-center rounded-full border border-kpi-badge-border bg-kpi-card-bg px-1.5 text-xs font-bold tabular-nums tracking-wide text-footnote-online">
              {totalTrades}
            </span>
          </div>

          <p
            className={cn(
              "font-heading text-[2rem] font-bold leading-[1.2] tracking-[-0.03em] sm:text-[2rem] xl:text-[2rem]",
              isNonNegative ? "text-kpi-metric-positive" : "text-danger",
            )}
          >
            {formatNetPnlDisplay(totalNetPnl)}
          </p>
        </div>

        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            isNonNegative
              ? "bg-kpi-trend-bg text-kpi-trend-fg"
              : "bg-kpi-trend-loss-bg text-kpi-trend-loss-fg",
          )}
          aria-hidden
        >
          {isNonNegative ? (
            <TrendingUp className="size-5" strokeWidth={2} />
          ) : (
            <TrendingDown className="size-5" strokeWidth={2} />
          )}
        </div>
      </div>
    </article>
  );
}
