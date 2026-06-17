"use client";

import { memo } from "react";
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
import { formatMoney } from "@/lib/format/money";
import { useActiveAccountCurrency } from "../hooks/use-active-account-currency";
import type {
  JournalAnalyticsInstrumentItem,
  JournalAnalyticsTimePerformancePoint,
} from "../types";

function money(value: number, currency: string) {
  return formatMoney(value, { currency, fractionDigits: 2 });
}

function formatYAxis(value: number, currency: string) {
  if (value === 0) return formatMoney(0, { currency, fractionDigits: 0 });
  const sign = value < 0 ? "-" : "";
  return `${sign}${formatMoney(Math.abs(value), { currency, compact: true })}`;
}

interface PerfDatum {
  label: string;
  v: number;
}

function PerfTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  if (typeof value !== "number") return null;
  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-xs">
      <p className="mb-0.5 text-text-secondary">{label}</p>
      <p
        className={cn(
          "font-semibold tabular-nums",
          value >= 0 ? "text-success" : "text-danger",
        )}
      >
        {money(value, currency)}
      </p>
    </div>
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
      radius={positive ? [3, 3, 0, 0] : [0, 0, 3, 3]}
    />
  );
}

interface PerfChartCardProps {
  title: string;
  data: PerfDatum[];
  isLoading?: boolean;
  /** Rotate x labels (long instrument tickers); weekday labels stay flat. */
  angledLabels?: boolean;
}

function PerfChartCard({
  title,
  data,
  isLoading,
  angledLabels = false,
}: PerfChartCardProps) {
  const colors = useChartColors();
  const currency = useActiveAccountCurrency();
  const axisTick = { fill: colors.axisTick, fontSize: 11, fontWeight: 500 };
  const isEmpty = !isLoading && data.length === 0;
  return (
    <section className="flex h-full min-h-[22rem] flex-col rounded-xl bg-card-bg">
      <div className="px-5 pt-5 pb-1">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="min-h-0 flex-1 px-2 pt-2 pb-4">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-bg-tertiary/40" />
        ) : isEmpty ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
            No data in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 8,
                right: 12,
                bottom: angledLabels ? 28 : 4,
                left: 4,
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                vertical={false}
                stroke={colors.grid}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={angledLabels ? -40 : 0}
                textAnchor={angledLabels ? "end" : "middle"}
                height={angledLabels ? 48 : 24}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(value) => formatYAxis(value, currency)}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={<PerfTooltip currency={currency} />}
                cursor={{ fill: colors.grid }}
              />
              <Bar
                dataKey="v"
                shape={<RoundedBar />}
                isAnimationActive={false}
                maxBarSize={44}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.v >= 0 ? colors.win : colors.loss} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

interface InstrumentChartProps {
  instruments: JournalAnalyticsInstrumentItem[];
  isLoading?: boolean;
}

/** Net P&L per instrument, sorted high→low, green/red by sign. */
function JournalInstrumentPnlChartImpl({
  instruments,
  isLoading,
}: InstrumentChartProps) {
  const data: PerfDatum[] = instruments
    .filter((i) => i.trade_count > 0)
    .map((i) => ({ label: i.symbol, v: i.total_pnl }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 12);

  return (
    <PerfChartCard
      title="Performance by Instrument"
      data={data}
      isLoading={isLoading}
      angledLabels
    />
  );
}

export const JournalInstrumentPnlChart = memo(JournalInstrumentPnlChartImpl);

interface WeekdayChartProps {
  daily: JournalAnalyticsTimePerformancePoint[];
  isLoading?: boolean;
}

/** Net P&L per weekday, green/red by sign. */
function JournalWeekdayPnlChartImpl({ daily, isLoading }: WeekdayChartProps) {
  const data: PerfDatum[] = daily.map((d) => ({
    label: d.bucket,
    v: Number.isFinite(d.total_pnl) ? d.total_pnl : 0,
  }));

  return (
    <PerfChartCard
      title="Performance by Weekday"
      data={data}
      isLoading={isLoading}
    />
  );
}

export const JournalWeekdayPnlChart = memo(JournalWeekdayPnlChartImpl);
