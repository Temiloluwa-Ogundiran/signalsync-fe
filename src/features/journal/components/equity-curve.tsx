"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  YAxis,
} from "recharts";

const WIN = "#22C55E";
const LOSS = "#EF4444";

interface EquityCurveProps {
  // Data: daily format {date, cumulative_pnl} OR intraday format {i, cumulative_pnl}
  data: Array<{ date?: string; i?: number; cumulative_pnl: number }>;
  // Which axis field to use: "date" for daily, "i" for intraday
  xKey: "date" | "i";
  // Render style
  colorMode: "split" | "solid";
  solidVariant?: "win" | "loss"; // Only used when colorMode="solid"
  // Display options
  showAxes?: boolean;
  size?: "spark" | "full"; // spark=tiny (feed rows), full=larger (dashboard, day page)
  className?: string;
}

interface SplitPoint {
  date?: string;
  i?: number;
  pos: number | null; // value when >= 0 (green series)
  neg: number | null; // value when <= 0 (red series)
}

function fmtAxis(v: number) {
  const abs = Math.abs(v);
  const compact =
    abs >= 1000
      ? `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`
      : abs.toLocaleString("en-US");
  return `${v < 0 ? "-" : ""}$${compact}`;
}

/**
 * Split the series into positive (green) and negative (red) channels so each
 * is drawn as ONE solid-colored line that meets exactly at $0 — no overlap.
 * Interpolates a {cumulative_pnl:0} point at every zero-crossing so the two
 * lines connect. Preserves xKey metadata (date or i).
 */
function splitAtZero(
  data: Array<{ date?: string; i?: number; cumulative_pnl: number }>,
  xKey: "date" | "i",
): SplitPoint[] {
  const out: SplitPoint[] = [];
  for (let k = 0; k < data.length; k++) {
    const cur = data[k];
    const prev = data[k - 1];

    if (prev) {
      const a = prev.cumulative_pnl;
      const b = cur.cumulative_pnl;
      // Crossed zero between prev and cur → insert a $0 crossing point so the
      // green and red channels meet exactly at the baseline.
      if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
        const point: SplitPoint = { pos: 0, neg: 0 };
        if (xKey === "date") {
          point.date = prev.date; // Keep the previous date
        } else {
          point.i = prev.i; // Keep the previous index
        }
        out.push(point);
      }
    }

    const point: SplitPoint = {
      pos: cur.cumulative_pnl >= 0 ? cur.cumulative_pnl : null,
      neg: cur.cumulative_pnl <= 0 ? cur.cumulative_pnl : null,
    };
    if (xKey === "date") {
      point.date = cur.date;
    } else {
      point.i = cur.i;
    }
    out.push(point);
  }
  return out;
}

/**
 * Unified equity curve component supporting both daily and intraday modes.
 *
 * COLORMODE="split" (zero-split):
 *   - Green above $0, red below, using the SAME domain as the plot.
 *   - The color flip happens EXACTLY on the zero line.
 *   - Never-negative days render 100% green; fully negative render 100% red.
 *   - Used on: day-page chart, dashboard equity curve.
 *
 * COLORMODE="solid" (single color):
 *   - Whole line ONE color by net outcome (win=green, loss=red).
 *   - No per-crossing color flicker; color reflects day/period outcome.
 *   - Used on: feed row sparklines, KPI card sparkline.
 *
 * SIZE="spark":
 *   - Tiny, no axes, minimal padding.
 *   - For feed rows and KPI sparklines.
 *
 * SIZE="full":
 *   - Axes, $ labels, faint gridlines, zero baseline reference line.
 *   - For day-page and dashboard curves.
 */
export function EquityCurve({
  data,
  xKey,
  colorMode,
  solidVariant,
  showAxes = false,
  size = "full",
  className,
}: EquityCurveProps) {
  if (!data || data.length === 0) {
    return <div className={className} />;
  }

  const values = data.map((d) => d.cumulative_pnl);
  const chartId = `eq-${colorMode}-${xKey}-${data.length}`;

  // Single-color mode (feed sparklines, KPI)
  if (colorMode === "solid") {
    const color = solidVariant === "loss" ? LOSS : WIN;
    const gradientId = `${chartId}-solid-${solidVariant}`;

    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={size === "spark" ? { top: 2, right: 0, bottom: 2, left: 0 } : { top: 8, right: 8, bottom: 4, left: 8 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Area
              type="linear"
              dataKey="cumulative_pnl"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              baseValue="dataMin"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Split mode (day page, dashboard): green >= $0, red < $0
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const split = splitAtZero(data, xKey);

  const gradientId = `${chartId}-split`;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={split}
          margin={
            showAxes
              ? { top: 8, right: 8, bottom: 4, left: 8 }
              : size === "spark"
                ? { top: 2, right: 0, bottom: 2, left: 0 }
                : { top: 4, right: 0, bottom: 4, left: 0 }
          }
        >
          <defs>
            <linearGradient id={`${gradientId}-pos`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={WIN} stopOpacity={0.35} />
              <stop offset="100%" stopColor={WIN} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${gradientId}-neg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LOSS} stopOpacity={0.02} />
              <stop offset="100%" stopColor={LOSS} stopOpacity={0.35} />
            </linearGradient>
          </defs>

          {showAxes && (
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
          )}

          <YAxis
            domain={[min, max]}
            hide={!showAxes}
            width={showAxes ? 48 : 0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            tickFormatter={fmtAxis}
          />

          {showAxes && <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />}

          {/* Positive (green) channel — fills down to $0.
              `linear` (not monotone): with few trades, monotone smoothing
              invents a long flat sag near zero that isn't in the data. Straight
              segments between points plot the cumulative honestly. */}
          <Area
            type="linear"
            dataKey="pos"
            stroke={WIN}
            strokeWidth={2}
            fill={`url(#${gradientId}-pos)`}
            baseValue={0}
            connectNulls={false}
            isAnimationActive={false}
            dot={false}
          />
          {/* Negative (red) channel — fills up to $0 */}
          <Area
            type="linear"
            dataKey="neg"
            stroke={LOSS}
            strokeWidth={2}
            fill={`url(#${gradientId}-neg)`}
            baseValue={0}
            connectNulls={false}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
