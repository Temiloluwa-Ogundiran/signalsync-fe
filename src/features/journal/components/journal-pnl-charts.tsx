"use client";

import {
  Area,
  AreaChart,
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
import type { JournalAnalyticsEquityCurvePoint } from "../types";

const GREEN = "#22C55E";
const RED = "#EF4444";

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

/** Fraction (0–1) down the chart where y=0 sits, for the green/red split gradient. */
function zeroOffset(values: number[]): number {
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (min >= 0) return 1;
  if (max <= 0) return 0;
  return max / (max - min);
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
        "flex h-full min-h-[22rem] flex-col rounded-xl bg-card-bg ring-1 ring-border-primary/60",
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
  points: JournalAnalyticsEquityCurvePoint[];
  isLoading?: boolean;
  className?: string;
}

const AXIS_TICK = { fill: "#71717A", fontSize: 11 };
const GRID_STROKE = "rgba(255,255,255,0.05)";

/** Left chart: cumulative net P&L area, green above zero / red below. */
export function JournalCumulativePnlChart({
  points,
  isLoading,
  className,
}: ChartProps) {
  const data = points.map((p) => ({ date: p.date, v: p.cumulative_pnl }));
  const off = data.length ? zeroOffset(data.map((d) => d.v)) : 1;

  return (
    <ChartCard
      title="Daily net cumulative P&L"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="cum-stroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor={GREEN} />
              <stop offset={off} stopColor={RED} />
            </linearGradient>
            <linearGradient id="cum-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity={0.45} />
              <stop offset={off} stopColor={GREEN} stopOpacity={0.02} />
              <stop offset={off} stopColor={RED} stopOpacity={0.02} />
              <stop offset="100%" stopColor={RED} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXDate}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="url(#cum-stroke)"
            strokeWidth={2}
            fill="url(#cum-fill)"
            baseValue={0}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
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
  const data = points.map((p) => ({ date: p.date, v: p.daily_pnl }));

  return (
    <ChartCard
      title="Net daily P&L"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXDate}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey="v"
            shape={<RoundedBar />}
            isAnimationActive={false}
            maxBarSize={56}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.v >= 0 ? GREEN : RED} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
