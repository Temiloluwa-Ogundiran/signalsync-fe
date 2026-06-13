"use client";

import { Cell, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { JournalKpiInfo } from "./journal-kpi-info";

const chartConfig = {
  gain: {
    label: "Profit factor (gross wins)",
    color: "var(--kpi-legend-win-fg)",
  },
  loss: {
    label: "Basis",
    color: "var(--kpi-legend-loss-fg)",
  },
  empty: {
    label: "No data",
    color: "var(--border-secondary)",
  },
} satisfies ChartConfig;

interface PieDatum {
  name: keyof typeof chartConfig;
  value: number;
}

/** Ring split gross-wins : gross-losses as PF : 1 (same window as summary). */
function buildProfitFactorPieData(profitFactor: number): PieDatum[] {
  if (!Number.isFinite(profitFactor) || profitFactor < 0) {
    return [{ name: "empty", value: 1 }];
  }
  if (profitFactor === 0) {
    return [{ name: "empty", value: 1 }];
  }
  return [
    { name: "gain", value: profitFactor },
    { name: "loss", value: 1 },
  ];
}

interface JournalKpiProfitFactorProps {
  profitFactor: number;
  className?: string;
}

export function JournalKpiProfitFactor({
  profitFactor,
  className,
}: JournalKpiProfitFactorProps) {
  const pieData = buildProfitFactorPieData(profitFactor);
  const display = Number.isFinite(profitFactor) ? profitFactor.toFixed(2) : "—";

  return (
    <article
      className={cn(
        "flex min-h-[6.875rem] min-w-0 flex-row items-center justify-between gap-3 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-3 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-xs font-semibold leading-tight text-footnote-online min-[1400px]:text-sm">
            Profit Factor
          </span>
          <JournalKpiInfo
            title="Profit Factor"
            description="Gross profits divided by gross losses for the selected period. Above 1.0 means total profits exceed total losses."
          />
        </div>
        <p className="font-heading text-[1.75rem] font-bold leading-none tracking-normal text-kpi-metric-neutral tabular-nums min-[1400px]:text-[1.95rem]">
          {display}
        </p>
      </div>

      <div className="flex size-14 shrink-0 items-center justify-center min-[1400px]:size-[3.75rem]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto size-14 max-w-full min-[1400px]:size-[3.75rem]"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={27}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              cornerRadius={8}
              paddingAngle={0}
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
      </div>
    </article>
  );
}
