"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CircleHelp, Settings2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimePerformancePoint = {
  hour: string;
  pnl: number | null;
};

const HOURLY_DATA: TimePerformancePoint[] = [
  { hour: "00", pnl: 3500 },
  { hour: "01", pnl: -4500 },
  { hour: "02", pnl: -8500 },
  { hour: "03", pnl: 21000 },
  { hour: "04", pnl: 16000 },
  { hour: "05", pnl: 11000 },
  { hour: "06", pnl: 25500 },
  { hour: "07", pnl: -13000 },
  { hour: "08", pnl: 17000 },
  { hour: "09", pnl: null },
  { hour: "10", pnl: null },
  { hour: "11", pnl: 25500 },
  { hour: "12", pnl: null },
  { hour: "13", pnl: 25500 },
  { hour: "14", pnl: null },
  { hour: "15", pnl: null },
  { hour: "16", pnl: 7500 },
  { hour: "17", pnl: null },
  { hour: "18", pnl: -16000 },
  { hour: "19", pnl: null },
  { hour: "20", pnl: 22000 },
  { hour: "21", pnl: null },
  { hour: "22", pnl: null },
  { hour: "23", pnl: 25500 },
];

const DAILY_DATA: TimePerformancePoint[] = [
  { hour: "00", pnl: 6200 },
  { hour: "01", pnl: 4800 },
  { hour: "02", pnl: -4200 },
  { hour: "03", pnl: 9100 },
  { hour: "04", pnl: 7100 },
  { hour: "05", pnl: -1800 },
  { hour: "06", pnl: 11800 },
  { hour: "07", pnl: 5400 },
  { hour: "08", pnl: -6400 },
  { hour: "09", pnl: 7300 },
  { hour: "10", pnl: 8400 },
  { hour: "11", pnl: -3100 },
  { hour: "12", pnl: 9800 },
  { hour: "13", pnl: 12600 },
  { hour: "14", pnl: -2200 },
  { hour: "15", pnl: 6300 },
  { hour: "16", pnl: 8900 },
  { hour: "17", pnl: -5700 },
  { hour: "18", pnl: 9400 },
  { hour: "19", pnl: 6100 },
  { hour: "20", pnl: 7300 },
  { hour: "21", pnl: -2800 },
  { hour: "22", pnl: 5600 },
  { hour: "23", pnl: 10200 },
];

const Y_AXIS_TICKS = [
  -20000, -15000, -10000, -5000, 0, 5000, 10000, 15000, 20000, 25000,
];

function formatCurrency(value: number) {
  const absValue = Math.abs(value).toLocaleString("en-US");
  if (value === 0) return "$0";
  return value < 0 ? `-$${absValue}` : `$${absValue}`;
}

function TimePerformanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;
  if (typeof value !== "number") return null;

  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-xs font-semibold text-text-primary">
      {formatCurrency(value)}
    </div>
  );
}

function RoundedBarShape(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  payload?: TimePerformancePoint;
}) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    value = 0,
    fill,
    payload,
  } = props;
  const pnl = payload?.pnl;
  const numeric =
    typeof pnl === "number" ? pnl : typeof value === "number" ? value : 0;
  const absHeight = Math.abs(height);
  const rectY = height < 0 ? y + height : y;

  if (absHeight === 0 || width <= 0) return null;

  return (
    <Rectangle
      x={x}
      y={rectY}
      width={width}
      height={absHeight}
      fill={fill}
      radius={numeric >= 0 ? [6, 6, 0, 0] : [0, 0, 6, 6]}
    />
  );
}

export function JournalTimePerformanceWidget() {
  const [mode, setMode] = useState<"hourly" | "daily">("hourly");
  const data = mode === "hourly" ? HOURLY_DATA : DAILY_DATA;

  return (
    <section className="rounded-xl bg-kpi-card-bg ring-1 ring-border-primary/60">
      <header className="border-b border-border-secondary px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              Trade Time Performance
            </h3>
            <CircleHelp className="h-4 w-4 text-text-tertiary" />
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-bg-hover"
            aria-label="Trade time performance settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("hourly")}
            className={cn(
              "rounded-none border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
              mode === "hourly"
                ? "border-(--calendar-selected-ring) text-(--calendar-selected-ring)"
                : "text-text-secondary",
            )}
          >
            Hourly
          </button>
          <button
            type="button"
            onClick={() => setMode("daily")}
            className={cn(
              "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-semibold transition-colors",
              mode === "daily"
                ? "border-(--calendar-selected-ring) text-(--calendar-selected-ring)"
                : "text-text-secondary",
            )}
          >
            Daily
          </button>
        </div>

        <div className="h-88 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 28, left: 18 }}
              barCategoryGap="25%"
            >
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                interval={0}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <YAxis
                ticks={Y_AXIS_TICKS}
                domain={[-20000, 25000]}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={52}
                tickFormatter={formatCurrency}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Tooltip cursor={false} content={<TimePerformanceTooltip />} />
              <Bar dataKey="pnl" shape={<RoundedBarShape />} maxBarSize={24}>
                {data.map((point) => (
                  <Cell
                    key={point.hour}
                    fill={
                      point.pnl !== null && point.pnl >= 0
                        ? "var(--color-kpi-metric-positive)"
                        : "var(--color-kpi-legend-loss-fg)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
