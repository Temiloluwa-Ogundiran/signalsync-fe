"use client";

import { Cell, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import {
  dailyWinRatePercent,
  type DailyOutcomeCounts,
} from "../lib/journal-kpi-aggregates";
import { formatPercent } from "../lib/journal-widget-mappers";
import { JournalKpiInfo } from "./journal-kpi-info";

const chartConfig = {
  wins: {
    label: "Win days",
    color: "var(--kpi-legend-win-fg)",
  },
  breakeven: {
    label: "Breakeven days",
    color: "var(--kpi-legend-be-fg)",
  },
  losses: {
    label: "Loss days",
    color: "var(--kpi-legend-loss-fg)",
  },
  empty: {
    label: "No trading days",
    color: "var(--border-secondary)",
  },
} satisfies ChartConfig;

interface PieDatum {
  name: keyof typeof chartConfig;
  value: number;
}

function buildPieData(counts: DailyOutcomeCounts): PieDatum[] {
  const { winDays, breakevenDays, lossDays } = counts;
  const rows: PieDatum[] = [];
  if (winDays > 0) rows.push({ name: "wins", value: winDays });
  if (breakevenDays > 0) rows.push({ name: "breakeven", value: breakevenDays });
  if (lossDays > 0) rows.push({ name: "losses", value: lossDays });
  if (rows.length === 0) {
    return [{ name: "empty", value: 1 }];
  }
  return rows;
}

interface JournalKpiDailyWinProps {
  dailyOutcomeCounts: DailyOutcomeCounts;
  className?: string;
}

export function JournalKpiDailyWin({
  dailyOutcomeCounts,
  className,
}: JournalKpiDailyWinProps) {
  const dailyWinPercent = dailyWinRatePercent(dailyOutcomeCounts);
  const pieData = buildPieData(dailyOutcomeCounts);

  return (
    <article
      className={cn(
        "flex min-h-[7.625rem] min-w-0 flex-row items-stretch justify-between gap-2 sm:gap-3 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-3 sm:px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs sm:text-sm font-semibold leading-tight text-footnote-online">
            Daily Win %
          </span>
          <JournalKpiInfo
            title="Daily Win %"
            description="The share of trading days that finished green (net positive P&L) over the selected range."
          />
        </div>
        <p className="font-heading text-2xl xl:text-xl min-[1400px]:text-2xl 2xl:text-[2rem] font-bold leading-[1.2] tracking-[-0.03em] text-kpi-metric-neutral">
          {formatPercent(dailyWinPercent)}
        </p>
      </div>

      <div className="flex w-[5.5rem] xl:w-[5.2rem] min-[1400px]:w-[6.2rem] 2xl:w-[7.0625rem] shrink-0 flex-col items-center justify-center gap-1.5">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-12 sm:h-14 w-full max-w-full"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              innerRadius={26}
              outerRadius={34}
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

        <div className="flex w-full items-center justify-center gap-1.5 sm:gap-2 2xl:gap-3">
          <span className="inline-flex min-w-[1.1rem] sm:min-w-[1.4375rem] items-center justify-center rounded-full bg-kpi-legend-win-bg px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold leading-none text-kpi-legend-win-fg">
            {dailyOutcomeCounts.winDays}
          </span>
          <span className="inline-flex min-w-[1.1rem] sm:min-w-[1.4375rem] items-center justify-center rounded-full bg-kpi-legend-be-bg px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold leading-none text-kpi-legend-be-fg">
            {dailyOutcomeCounts.breakevenDays}
          </span>
          <span className="inline-flex min-w-[1.1rem] sm:min-w-[1.4375rem] items-center justify-center rounded-full bg-kpi-legend-loss-bg px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold leading-none text-kpi-legend-loss-fg">
            {dailyOutcomeCounts.lossDays}
          </span>
        </div>
      </div>
    </article>
  );
}
