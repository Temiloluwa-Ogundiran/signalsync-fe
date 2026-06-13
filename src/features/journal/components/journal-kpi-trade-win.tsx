"use client";

import { Cell, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import type { TradeOutcomeCounts } from "../lib/journal-kpi-aggregates";
import { formatPercent } from "../lib/journal-widget-mappers";
import { JournalKpiInfo } from "./journal-kpi-info";

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
        "flex min-h-[6.875rem] min-w-0 flex-row items-center justify-between gap-2 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-3 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-xs font-semibold leading-tight text-footnote-online min-[1400px]:text-sm">
            Trade Win %
          </span>
          <JournalKpiInfo
            title="Trade Win %"
            description="The percentage of closed trades that ended profitable in the selected range. Breakeven trades are excluded from wins."
          />
        </div>
        <p className="font-heading text-[1.55rem] font-bold leading-none tracking-normal text-kpi-metric-neutral tabular-nums min-[1400px]:text-[1.75rem] 2xl:text-[1.95rem]">
          {formatPercent(winRatePercent)}
        </p>
      </div>

      <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1.5 min-[1400px]:w-[5.25rem] 2xl:w-[5.75rem]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-10 w-full max-w-full min-[1400px]:h-11"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              innerRadius={22}
              outerRadius={29}
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

        <div className="flex w-full items-center justify-center gap-1">
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-kpi-legend-win-bg px-1 py-0.5 text-[9px] font-semibold leading-none text-kpi-legend-win-fg tabular-nums">
            {outcomeCounts.wins}
          </span>
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-kpi-legend-be-bg px-1 py-0.5 text-[9px] font-semibold leading-none text-kpi-legend-be-fg tabular-nums">
            {outcomeCounts.breakeven}
          </span>
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-kpi-legend-loss-bg px-1 py-0.5 text-[9px] font-semibold leading-none text-kpi-legend-loss-fg tabular-nums">
            {outcomeCounts.losses}
          </span>
        </div>
      </div>
    </article>
  );
}
