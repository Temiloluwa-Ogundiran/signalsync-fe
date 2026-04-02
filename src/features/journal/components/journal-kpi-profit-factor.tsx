"use client";

import { Info } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

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
        "flex min-h-[7.625rem] min-w-0 flex-row items-center justify-between gap-3 rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-sm font-semibold leading-tight text-footnote-online">
            Profit Factor
          </span>
          <button
            type="button"
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-footnote-online opacity-80 hover:opacity-100"
            aria-label="Profit Factor info"
          >
            <Info className="size-4" strokeWidth={2} />
          </button>
        </div>
        <p className="font-heading text-[2rem] font-bold leading-[1.2] tracking-[-0.03em] text-kpi-metric-neutral">
          {display}
        </p>
      </div>

      <div className="flex size-[3.75rem] shrink-0 items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[3.75rem] w-[3.75rem] max-w-full"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={30}
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
