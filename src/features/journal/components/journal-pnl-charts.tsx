"use client";

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
import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
import type { CurveDailyPoint } from "../types";
import { EquityCurve } from "./equity-curve";

function formatCurrency(value: number) {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

function formatYAxis(value: number) {
  if (value === 0) return "$0";
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${value < 0 ? "-" : ""}$${compact}`;
}

// "02/27/25"
function formatXDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  if (typeof value !== "number") return null;
  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-xs">
      <p className="mb-0.5 text-text-secondary tabular-nums">
        {label ? formatXDate(label) : ""}
      </p>
      <p
        className={cn(
          "font-semibold tabular-nums",
          value >= 0 ? "text-success" : "text-danger",
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  info?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

function ChartCard({
  title,
  children,
  isLoading,
  isEmpty,
  className,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "flex h-full min-h-[22rem] flex-col rounded-xl bg-card-bg",
        className,
      )}
    >
      <div className="px-5 pt-5 pb-1">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="min-h-0 flex-1 px-2 pt-2 pb-4">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-bg-tertiary/40" />
        ) : isEmpty ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
            No trades in this range.
          </div>
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </div>
    </section>
  );
}

interface ChartProps {
  points: CurveDailyPoint[];
  isLoading?: boolean;
  className?: string;
}

/** Left chart: cumulative net P&L area, green above zero / red below.
    Rendered through the shared EquityCurve (date axis, green/red zero-split
    stroke + fill, monotone, auto y-axis) so both curves share one renderer. */
export function JournalCumulativePnlChart({
  points,
  isLoading,
  className,
}: ChartProps) {
  // `points` may include the synthetic $0 baseline (first day - 1); it belongs
  // in the cumulative curve, so it's kept here. The line starts at $0 there.
  const data = points.map((p) => ({
    date: p.date,
    cumulative_pnl: p.cumulative_pnl,
  }));

  return (
    <ChartCard
      title="Daily net cumulative P&L"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      className={className}
    >
      <EquityCurve
        data={data}
        xKey="date"
        colorMode="split"
        strokeMode="zeroSplit"
        interpolation="monotone"
        yMode="auto"
        showAxes
        className="h-full w-full"
      />
    </ChartCard>
  );
}

function RoundedBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: { v: number };
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props;
  const positive = (payload?.v ?? 0) >= 0;
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
      radius={positive ? [4, 4, 0, 0] : [0, 0, 4, 4]}
    />
  );
}

/** Right chart: per-day net P&L bars, green positive / red negative. */
export function JournalDailyPnlChart({
  points,
  isLoading,
  className,
}: ChartProps) {
  const colors = useChartColors();
  const axisTick = { fill: colors.axisTick, fontSize: 11 };
  // Drop the synthetic $0 baseline (it has no daily P&L) so no phantom bar shows.
  const data = points
    .filter((p) => !p.is_baseline)
    .map((p) => ({ date: p.date, v: p.daily_pnl ?? 0 }));

  return (
    <ChartCard
      title="Net daily P&L"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXDate}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: colors.grid }}
          />
          <Bar
            dataKey="v"
            shape={<RoundedBar />}
            isAnimationActive={false}
            maxBarSize={56}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.v >= 0 ? colors.win : colors.loss} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
