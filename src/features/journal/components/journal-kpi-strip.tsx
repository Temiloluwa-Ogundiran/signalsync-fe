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
  className?: string;
}

export function JournalKpiStrip({
  summary,
  tradeOutcomeCounts,
  dailyOutcomeCounts,
  className,
}: JournalKpiStripProps) {
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
