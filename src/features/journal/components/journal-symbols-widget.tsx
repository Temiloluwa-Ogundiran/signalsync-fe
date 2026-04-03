"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  symbolA: {
    label: "XAUUSD",
    color: "var(--chart-1)",
  },
  symbolB: {
    label: "EURUSD",
    color: "var(--chart-2)",
  },
  symbolC: {
    label: "GBPUSD",
    color: "var(--chart-3)",
  },
  symbolD: {
    label: "USDJPY",
    color: "var(--chart-4)",
  },
  symbolE: {
    label: "BTCUSD",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const chartData = [
  { name: "symbolA", trades: 275 },
  { name: "symbolB", trades: 200 },
  { name: "symbolC", trades: 187 },
  { name: "symbolD", trades: 173 },
  { name: "symbolE", trades: 90 },
] as const;

function SymbolFrequencyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
}) {
  if (!active || !payload?.length) return null;

  const hovered = payload[0];
  const key = hovered.name as keyof typeof chartConfig | undefined;
  const symbol = key ? chartConfig[key]?.label : undefined;
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

export function JournalSymbolsWidget() {
  return (
    <section className="rounded-xl bg-card-bg ring-1 ring-border-primary/60">
      <header className="flex items-center justify-between border-b border-border-primary/60 px-4 py-3">
        <h3 className="text-base font-semibold text-text-primary">
          Symbols Traded
        </h3>
      </header>
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
              nameKey="name"
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
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </section>
  );
}
