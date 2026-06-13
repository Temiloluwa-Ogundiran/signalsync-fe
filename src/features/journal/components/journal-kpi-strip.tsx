import { memo } from "react";
import { cn } from "@/lib/utils";

import type {
  DailyOutcomeCounts,
  TradeOutcomeCounts,
} from "../lib/journal-kpi-aggregates";
import type { JournalAnalyticsSummaryResponse } from "../types";
import { JournalKpiAvgWinLoss } from "./journal-kpi-avg-win-loss";
import { JournalKpiDailyWin } from "./journal-kpi-daily-win";
import { JournalKpiNetPnl } from "./journal-kpi-net-pnl";
import { JournalKpiProfitFactor } from "./journal-kpi-profit-factor";
import { JournalKpiTradeWin } from "./journal-kpi-trade-win";

interface JournalKpiStripProps {
  summary: JournalAnalyticsSummaryResponse | undefined;
  tradeOutcomeCounts: TradeOutcomeCounts;
  dailyOutcomeCounts: DailyOutcomeCounts;
  isLoading?: boolean;
  className?: string;
}

function JournalKpiStripImpl({
  summary,
  tradeOutcomeCounts,
  dailyOutcomeCounts,
  isLoading = false,
  className,
}: JournalKpiStripProps) {
  if (isLoading) {
    return (
      <section
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5",
          className,
        )}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`kpi-skeleton-${index}`}
            className="min-h-[7.625rem] animate-pulse rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg"
          />
        ))}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5",
        className,
      )}
    >
      <JournalKpiNetPnl
        totalNetPnl={summary?.total_net_pnl ?? 0}
        totalTrades={summary?.total_trades ?? 0}
      />
      <JournalKpiTradeWin
        winRatePercent={summary?.win_rate ?? 0}
        outcomeCounts={tradeOutcomeCounts}
      />

      <JournalKpiProfitFactor profitFactor={summary?.profit_factor ?? 0} />

      <JournalKpiDailyWin dailyOutcomeCounts={dailyOutcomeCounts} />

      <JournalKpiAvgWinLoss avgWin={summary?.avg_win ?? 0} avgLoss={summary?.avg_loss ?? 0} />
    </section>
  );
}

export const JournalKpiStrip = memo(JournalKpiStripImpl);
