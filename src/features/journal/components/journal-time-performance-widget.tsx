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
import type { JournalAnalyticsTimePerformancePoint } from "../types";

type TimePerformancePoint = {
  bucket: string;
  pnl: number | null;
};

interface JournalTimePerformanceWidgetProps {
  hourly: JournalAnalyticsTimePerformancePoint[];
  daily: JournalAnalyticsTimePerformancePoint[];
}

function mapSeries(points: JournalAnalyticsTimePerformancePoint[]): TimePerformancePoint[] {
  return points.map((point) => ({
    bucket: point.bucket,
    pnl: Number.isFinite(point.total_pnl) ? point.total_pnl : 0,
  }));
}

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

export function JournalTimePerformanceWidget({
  hourly,
  daily,
}: JournalTimePerformanceWidgetProps) {
  const [mode, setMode] = useState<"hourly" | "daily">("hourly");
  const data = mode === "hourly" ? mapSeries(hourly) : mapSeries(daily);
  const numericValues = data
    .map((point) => (typeof point.pnl === "number" ? point.pnl : 0))
    .filter((value) => value !== 0);
  const maxAbs = numericValues.length
    ? Math.max(...numericValues.map((value) => Math.abs(value)))
    : 0;
  const paddedMax = Math.max(1_000, Math.ceil((maxAbs * 1.2) / 1000) * 1000);

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
                dataKey="bucket"
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
                domain={[-paddedMax, paddedMax]}
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
                    key={point.bucket}
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
