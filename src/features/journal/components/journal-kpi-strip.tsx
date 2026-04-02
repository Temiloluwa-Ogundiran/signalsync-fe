import { cn } from "@/lib/utils";

import type { TradeOutcomeCounts } from "../lib/journal-kpi-aggregates";
import { getJournalKpiLegacyCardModels } from "../lib/journal-widget-mappers";
import type { JournalAnalyticsSummaryResponse } from "../types";
import { JournalKpiNetPnl } from "./journal-kpi-net-pnl";
import { JournalKpiTradeWin } from "./journal-kpi-trade-win";

interface JournalKpiStripProps {
  summary: JournalAnalyticsSummaryResponse | undefined;
  tradeOutcomeCounts: TradeOutcomeCounts;
  className?: string;
}

function LegacySemicircleGauge({ ratio = 0 }: { ratio?: number }) {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const greenSweep = Math.round(safeRatio * 180);
  return (
    <div
      className="h-14 w-14 shrink-0 rounded-full"
      style={{
        background: `conic-gradient(var(--success) 0deg ${greenSweep}deg, var(--danger) ${greenSweep}deg 220deg, rgba(82,82,82,0.5) 220deg 360deg)`,
      }}
    >
      <div className="m-[0.42rem] h-10 w-10 rounded-full bg-kpi-card-bg" />
    </div>
  );
}

export function JournalKpiStrip({
  summary,
  tradeOutcomeCounts,
  className,
}: JournalKpiStripProps) {
  const legacy = getJournalKpiLegacyCardModels(summary);

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

      <article className="flex min-h-[7.625rem] min-w-0 items-center justify-between rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-4 py-3 shadow-sm ring-1 ring-border-primary/40">
        <div className="mb-2 flex min-w-0 flex-col items-start gap-1">
          <p className="font-sans text-xs font-semibold text-text-secondary">
            {legacy.profitFactor.label}
          </p>
          <p className="font-heading text-3xl font-bold tracking-tight text-text-primary">
            {legacy.profitFactor.value}
          </p>
        </div>
        <LegacySemicircleGauge ratio={legacy.profitFactor.ratio} />
      </article>

      <article className="flex min-h-[7.625rem] min-w-0 items-center justify-between rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-4 py-3 shadow-sm ring-1 ring-border-primary/40">
        <div className="mb-2 flex min-w-0 flex-col items-start gap-1">
          <p className="font-sans text-xs font-semibold text-text-secondary">
            {legacy.dailyWin.label}
          </p>
          <p className="font-heading text-3xl font-bold tracking-tight text-text-primary">
            {legacy.dailyWin.value}
          </p>
        </div>
        <LegacySemicircleGauge ratio={legacy.dailyWin.ratio} />
      </article>

      <article className="flex min-h-[7.625rem] min-w-0 items-center justify-between rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-4 py-3 shadow-sm ring-1 ring-border-primary/40">
        <div className="mb-2 flex min-w-0 flex-col items-start gap-1">
          <p className="font-sans text-xs font-semibold text-text-secondary">
            {legacy.avgRatio.label}
          </p>
          <p className="font-heading text-3xl font-bold tracking-tight text-text-primary">
            {legacy.avgRatio.value}
          </p>
          {legacy.avgRatio.helper ? (
            <p className="mt-1 text-xs text-text-tertiary">{legacy.avgRatio.helper}</p>
          ) : null}
        </div>
        <LegacySemicircleGauge ratio={legacy.avgRatio.ratio} />
      </article>
    </section>
  );
}
