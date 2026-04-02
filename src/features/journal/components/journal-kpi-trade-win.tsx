"use client";

import { Info } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import type { TradeOutcomeCounts } from "../lib/journal-kpi-aggregates";
import { formatPercent } from "../lib/journal-widget-mappers";

const chartConfig = {
  wins: {
    label: "Wins",
    color: "var(--kpi-legend-win-fg)",
  },
  breakeven: {
    label: "Breakeven",
    color: "var(--kpi-legend-be-fg)",
  },
  losses: {
    label: "Losses",
    color: "var(--kpi-legend-loss-fg)",
  },
  empty: {
    label: "No trades",
    color: "var(--border-secondary)",
  },
} satisfies ChartConfig;

interface PieDatum {
  name: keyof typeof chartConfig;
  value: number;
}

function buildPieData(counts: TradeOutcomeCounts): PieDatum[] {
  const { wins, breakeven, losses } = counts;
  const rows: PieDatum[] = [];
  if (wins > 0) rows.push({ name: "wins", value: wins });
  if (breakeven > 0) rows.push({ name: "breakeven", value: breakeven });
  if (losses > 0) rows.push({ name: "losses", value: losses });
  if (rows.length === 0) {
    return [{ name: "empty", value: 1 }];
  }
  return rows;
}

interface JournalKpiTradeWinProps {
  winRatePercent: number;
  outcomeCounts: TradeOutcomeCounts;
  className?: string;
}

export function JournalKpiTradeWin({
  winRatePercent,
  outcomeCounts,
  className,
}: JournalKpiTradeWinProps) {
  const pieData = buildPieData(outcomeCounts);

  return (
    <article
      className={cn(
        "flex min-h-[7.625rem] min-w-0 flex-row items-stretch justify-between gap-3 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-sm font-semibold leading-tight text-footnote-online">
            Trade Win %
          </span>
          <button
            type="button"
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-footnote-online opacity-80 hover:opacity-100"
            aria-label="Trade Win % info"
          >
            <Info className="size-4" strokeWidth={2} />
          </button>
        </div>
        <p className="font-heading text-[2rem] font-bold leading-[1.2] tracking-[-0.03em] text-kpi-metric-neutral">
          {formatPercent(winRatePercent)}
        </p>
      </div>

      <div className="flex w-[7.0625rem] shrink-0 flex-col items-center gap-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-14 w-[7.0625rem] max-w-full"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              innerRadius={32}
              outerRadius={40}
              startAngle={180}
              endAngle={0}
              stroke="none"
              cornerRadius={10}
              isAnimationActive={true}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={`var(--color-${entry.name})`}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex w-full items-center justify-center gap-5">
          <span className="inline-flex min-w-[1.6875rem] items-center justify-center rounded-full bg-kpi-legend-win-bg px-2 py-0.5 text-[10px] font-semibold leading-none text-kpi-legend-win-fg">
            {outcomeCounts.wins}
          </span>
          <span className="inline-flex min-w-[1.4375rem] items-center justify-center rounded-full bg-kpi-legend-be-bg px-2 py-0.5 text-[10px] font-semibold leading-none text-kpi-legend-be-fg">
            {outcomeCounts.breakeven}
          </span>
          <span className="inline-flex min-w-[1.4375rem] items-center justify-center rounded-full bg-kpi-legend-loss-bg px-2 py-0.5 text-[10px] font-semibold leading-none text-kpi-legend-loss-fg">
            {outcomeCounts.losses}
          </span>
        </div>
      </div>
    </article>
  );
}
