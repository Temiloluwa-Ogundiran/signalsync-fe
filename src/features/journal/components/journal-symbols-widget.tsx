"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import type { JournalAnalyticsInstrumentItem } from "../types";

interface JournalSymbolsWidgetProps {
  instruments: JournalAnalyticsInstrumentItem[];
}

function SymbolFrequencyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { symbol: string; trades: number }; value?: number | string }>;
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

export function JournalSymbolsWidget({ instruments }: JournalSymbolsWidgetProps) {
  const nonZero = instruments
    .filter((item) => item.trade_count > 0)
    .sort((a, b) => b.trade_count - a.trade_count)
    .slice(0, 7);
  const chartData = nonZero.map((item) => ({
    symbol: item.symbol,
    trades: item.trade_count,
  }));
  const chartConfig = chartData.reduce(
    (acc, item, index) => {
      const key = item.symbol;
      acc[key] = {
        label: item.symbol,
        color: `var(--chart-${(index % 5) + 1})`,
      };
      return acc;
    },
    {} as ChartConfig,
  );

  return (
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <header className="flex items-center justify-between border-b border-border-primary/60 px-4 py-3">
        <h3 className="text-base font-semibold text-text-primary">
          Symbols Traded
        </h3>
      </header>
      {chartData.length === 0 ? (
        <div className="p-6 text-center text-sm text-text-secondary">
          No symbol data for this period.
        </div>
      ) : (
        <div className="flex items-center justify-center p-6">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-xs"
          >
            <PieChart>
              <Tooltip cursor={false} content={<SymbolFrequencyTooltip />} />
              <Pie
                data={chartData}
                dataKey="trades"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={1}
                cornerRadius={6}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.symbol} fill={`var(--chart-${(index % 5) + 1})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      )}
    </section>
  );
}
