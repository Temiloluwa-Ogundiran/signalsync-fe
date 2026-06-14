import { memo } from "react";
import { cn } from "@/lib/utils";

import type { TradeOutcomeCounts } from "../lib/journal-kpi-aggregates";
import type { JournalAnalyticsSummaryResponse } from "../types";
import { JournalKpiAvgWinLoss } from "./journal-kpi-avg-win-loss";
import { JournalKpiNetPnl } from "./journal-kpi-net-pnl";
import { JournalKpiProfitFactor } from "./journal-kpi-profit-factor";
import { JournalKpiTradeWin } from "./journal-kpi-trade-win";

interface JournalKpiStripProps {
  summary: JournalAnalyticsSummaryResponse | undefined;
  tradeOutcomeCounts: TradeOutcomeCounts;
  /** Cumulative net-P&L series for the Net P&L sparkline. */
  netPnlSeries: { i: number; v: number }[];
  isLoading?: boolean;
  className?: string;
}

// Four cards (Net P&L, Winrate, Avg P&L, Profit Factor) per the premium spec.
const GRID = "grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4";

function JournalKpiStripImpl({
  summary,
  tradeOutcomeCounts,
  netPnlSeries,
  isLoading = false,
  className,
}: JournalKpiStripProps) {
  if (isLoading) {
    return (
      <section className={cn(GRID, className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`kpi-skeleton-${index}`}
            className="min-h-[6.875rem] animate-pulse rounded-xl bg-kpi-card-bg"
          />
        ))}
      </section>
    );
  }

  return (
    <section className={cn(GRID, className)}>
      <JournalKpiNetPnl
        totalNetPnl={summary?.total_net_pnl ?? 0}
        series={netPnlSeries}
      />
      <JournalKpiTradeWin
        winRatePercent={summary?.win_rate ?? 0}
        outcomeCounts={tradeOutcomeCounts}
      />
      <JournalKpiAvgWinLoss
        avgWin={summary?.avg_win ?? 0}
        avgLoss={summary?.avg_loss ?? 0}
      />
      <JournalKpiProfitFactor profitFactor={summary?.profit_factor ?? 0} />
    </section>
  );
}

export const JournalKpiStrip = memo(JournalKpiStripImpl);
