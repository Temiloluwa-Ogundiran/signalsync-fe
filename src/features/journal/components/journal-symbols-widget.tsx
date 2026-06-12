"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { JournalAnalyticsInstrumentItem } from "../types";

interface JournalSymbolsWidgetProps {
  instruments: JournalAnalyticsInstrumentItem[];
  /** Tighter layout when shown beside other analytics widgets. */
  compact?: boolean;
}

function SymbolFrequencyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: { symbol: string; trades: number };
    value?: number | string;
  }>;
}) {
  if (!active || !payload?.length) return null;

  const hovered = payload[0];
  const symbol = hovered.payload?.symbol;
  const count =
    typeof hovered.value === "number"
      ? hovered.value
      : Number(hovered.value ?? 0);

  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-sm font-semibold text-text-primary">
      {`${symbol ?? "Unknown"}: ${count}`}
    </div>
  );
}

export function JournalSymbolsWidget({
  instruments,
  compact = false,
}: JournalSymbolsWidgetProps) {
  const nonZero = instruments
    .filter((item) => item.trade_count > 0)
    .sort((a, b) => b.trade_count - a.trade_count)
    .slice(0, 7);
  const chartData = nonZero.map((item) => ({
    symbol: item.symbol,
    trades: item.trade_count,
  }));
  const chartConfig = chartData.reduce((acc, item, index) => {
    const key = item.symbol;
    acc[key] = {
      label: item.symbol,
      color: `var(--chart-${(index % 5) + 1})`,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <header
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-border-primary/60 px-4",
          compact ? "py-2.5" : "py-3",
        )}
      >
        <h3 className="text-base font-semibold text-text-primary">
          Symbols Traded
        </h3>
      </header>
      {chartData.length === 0 ? (
        <div
          className={cn(
            "text-center text-sm text-text-secondary",
            compact ? "p-4" : "p-6",
          )}
        >
          No symbol data for this period.
        </div>
      ) : (
        <div
          className={cn(
            "flex min-h-0 flex-1 items-center justify-center",
            compact ? "p-3" : "p-6",
          )}
        >
          <ChartContainer
            config={chartConfig}
            className={cn(
              "mx-auto aspect-square w-full max-w-xs",
              compact && "max-h-[min(100%,14rem)]",
            )}
          >
            <PieChart>
              <Tooltip cursor={false} content={<SymbolFrequencyTooltip />} />
              <Pie
                data={chartData}
                dataKey="trades"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="70%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={1}
                cornerRadius={6}
                labelLine={{
                  stroke: "var(--border-secondary)",
                  strokeWidth: 1,
                  opacity: 0.5,
                }}
                label={({ payload, x, y, textAnchor, dominantBaseline }) => {
                  if (!payload) return null;
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      dominantBaseline={dominantBaseline}
                      className="fill-text-primary text-[10px] sm:text-xs font-bold font-sans"
                    >
                      {`${payload.symbol}: ${payload.trades}`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.symbol}
                    fill={`var(--chart-${(index % 5) + 1})`}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      )}
    </section>
  );
}
