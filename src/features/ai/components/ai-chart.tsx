"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartColors } from "@/lib/use-chart-colors";

/**
 * Generic chart renderer for the AI chat. The model emits a ```chart fenced
 * block whose body is a JSON ChartSpec; ai-markdown.tsx parses it and renders
 * this. One component covers line / area / bar / pie so the model can pick the
 * shape that fits the data (an equity curve, a per-symbol breakdown, a win/loss
 * split, …) without us hard-coding each case.
 */

export type ChartType = "line" | "area" | "bar" | "pie";
export type ChartFormat = "currency" | "percent" | "number";

export interface ChartPoint {
  /** Category / x label (e.g. "2025-05-01", "EURUSD", "Monday"). */
  label: string;
  /** The plotted value. */
  value: number;
}

export interface ChartSpec {
  type: ChartType;
  title?: string;
  /** y-value formatting. Defaults to "number". */
  format?: ChartFormat;
  points: ChartPoint[];
}

/** Parse + validate a ChartSpec from a fenced ```chart body. Returns null if invalid. */
export function parseChartSpec(raw: string): ChartSpec | null {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const type = o.type;
  if (type !== "line" && type !== "area" && type !== "bar" && type !== "pie") {
    return null;
  }
  const rawPoints = Array.isArray(o.points) ? o.points : [];
  const points: ChartPoint[] = rawPoints
    .map((p) => {
      const pt = p as Record<string, unknown>;
      const label = pt.label ?? pt.x ?? pt.name;
      const value = pt.value ?? pt.y;
      return {
        label: String(label ?? ""),
        value: typeof value === "number" ? value : Number(value),
      };
    })
    .filter((p) => p.label !== "" && Number.isFinite(p.value));
  if (points.length === 0) return null;
  const format =
    o.format === "currency" || o.format === "percent" || o.format === "number"
      ? o.format
      : "number";
  return {
    type,
    title: typeof o.title === "string" ? o.title : undefined,
    format,
    points,
  };
}

function makeFormatter(format: ChartFormat) {
  return (v: number) => {
    if (format === "currency") {
      const abs = Math.abs(v);
      const compact =
        abs >= 1000
          ? `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`
          : abs.toLocaleString("en-US");
      return `${v < 0 ? "-" : ""}$${compact}`;
    }
    if (format === "percent") return `${v.toFixed(v % 1 === 0 ? 0 : 1)}%`;
    return v.toLocaleString("en-US");
  };
}

function ChartTooltip({
  active,
  payload,
  label,
  fmt,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: ChartPoint }>;
  label?: string | number;
  fmt: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const value = p?.value ?? p?.payload?.value ?? 0;
  const head = label ?? p?.payload?.label ?? "";
  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-xs shadow-lg">
      {head !== "" && (
        <p className="mb-0.5 font-semibold tabular-nums text-text-primary">{String(head)}</p>
      )}
      <p
        className={
          value < 0 ? "tabular-nums text-danger" : "tabular-nums text-text-secondary"
        }
      >
        {fmt(value)}
      </p>
    </div>
  );
}

export function AiChart({ spec }: { spec: ChartSpec }) {
  const colors = useChartColors();
  const fmt = useMemo(() => makeFormatter(spec.format ?? "number"), [spec.format]);
  const { type, points } = spec;

  // Color: positive→win, negative→loss for diverging data; AI violet otherwise.
  const hasNegative = points.some((p) => p.value < 0);
  const pieColors = [colors.ai, colors.win, colors.loss, colors.aiBright, colors.axisTick];

  const body = (
    <ResponsiveContainer width="100%" height="100%">
      {type === "pie" ? (
        <PieChart>
          <Pie
            data={points}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            isAnimationActive={false}
          >
            {points.map((_, i) => (
              <Cell key={i} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip fmt={fmt} />} />
        </PieChart>
      ) : type === "bar" ? (
        <BarChart data={points} margin={{ top: 10, right: 8, bottom: 6, left: 8 }}>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: colors.axisTick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={8}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: colors.axisTick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          {hasNegative && <ReferenceLine y={0} stroke={colors.grid} />}
          <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ fill: colors.grid }} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {points.map((p, i) => (
              <Cell
                key={i}
                fill={hasNegative ? (p.value < 0 ? colors.loss : colors.win) : colors.ai}
              />
            ))}
          </Bar>
        </BarChart>
      ) : (
        // line / area
        ((Chart, fillArea) => (
          <Chart data={points} margin={{ top: 10, right: 10, bottom: 6, left: 8 }}>
            <defs>
              <linearGradient id="ai-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.ai} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.ai} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: colors.axisTick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fill: colors.axisTick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            {hasNegative && <ReferenceLine y={0} stroke={colors.grid} strokeDasharray="4 4" />}
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            {fillArea ? (
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.ai}
                strokeWidth={2}
                fill="url(#ai-chart-fill)"
                isAnimationActive={false}
                dot={false}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.ai}
                strokeWidth={2}
                isAnimationActive={false}
                dot={false}
              />
            )}
          </Chart>
        ))(
          type === "area" ? AreaChart : LineChart,
          type === "area",
        )
      )}
    </ResponsiveContainer>
  );

  return (
    <figure className="my-2 w-full rounded-xl border border-border-secondary/50 bg-card-bg p-3">
      {spec.title && (
        <figcaption className="mb-1.5 px-1 text-xs font-semibold text-text-primary">
          {spec.title}
        </figcaption>
      )}
      <div className="h-[200px] w-full">{body}</div>
    </figure>
  );
}
