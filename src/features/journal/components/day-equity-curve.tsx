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

interface DayEquityCurveProps {
  /** Cumulative-P&L points. */
  data: { i: number; v: number }[];
  /** Show $-axis labels + gridlines (Tradezella style). Off → bare curve. */
  showAxis?: boolean;
  /**
   * Render the whole curve in ONE color (no per-crossing zero-split). Used by
   * the compact row sparklines so tiny near-zero moves don't flicker red/green;
   * the color conveys the day's net outcome, the line conveys shape. Omit on
   * the full chart to get the true $0-anchored zero-split.
   */
  solidColor?: "win" | "loss";
  className?: string;
}

interface SplitPoint {
  i: number;
  pos: number | null; // value when ≥ 0 (green series)
  neg: number | null; // value when ≤ 0 (red series)
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
 * Split the series into a positive (green) and negative (red) channel so each
 * is drawn as ONE solid-colored line that meets exactly at $0 — no overlap.
 * Interpolates a {v:0} point at every zero-crossing so the two lines connect.
 */
function splitAtZero(data: { i: number; v: number }[]): SplitPoint[] {
  const out: SplitPoint[] = [];
  for (let k = 0; k < data.length; k++) {
    const cur = data[k];
    const prev = data[k - 1];

    if (prev) {
      const a = prev.v;
      const b = cur.v;
      // Crossed zero between prev and cur → insert the exact crossing point.
      if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
        const t = a / (a - b); // fraction along the segment where v = 0
        const i = prev.i + (cur.i - prev.i) * t;
        out.push({ i, pos: 0, neg: 0 });
      }
    }

    out.push({
      i: cur.i,
      pos: cur.v >= 0 ? cur.v : null,
      neg: cur.v <= 0 ? cur.v : null,
    });
  }
  return out;
}

/**
 * Equity curve referenced to true $0 — green above zero, red below. The LINE is
 * two clipped solid-color series (no ghosting/overlap at the seam); the FILL is
 * a $0-anchored zero-split gradient fading toward the baseline.
 */
export function DayEquityCurve({
  data,
  showAxis = false,
  solidColor,
  className,
}: DayEquityCurveProps) {
  const values = data.map((d) => d.v);

  // Single-color mode: one solid curve (color = day outcome), fill to baseline.
  if (solidColor) {
    const color = solidColor === "loss" ? LOSS : WIN;
    const id = `eq-solid-${solidColor}-${data.length}`;
    return (
      <div className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin", "dataMax"]} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${id})`}
              baseValue="dataMin"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const split = splitAtZero(data);

  const id = `eq-${Math.round((max / (max - min || 1)) * 1000)}-${data.length}`;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={split}
          margin={
            showAxis
              ? { top: 8, right: 8, bottom: 4, left: 8 }
              : { top: 4, right: 0, bottom: 4, left: 0 }
          }
        >
          <defs>
            <linearGradient id={`${id}-pos`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={WIN} stopOpacity={0.35} />
              <stop offset="100%" stopColor={WIN} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${id}-neg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LOSS} stopOpacity={0.02} />
              <stop offset="100%" stopColor={LOSS} stopOpacity={0.35} />
            </linearGradient>
          </defs>

          {showAxis ? (
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
          ) : null}

          <YAxis
            domain={[min, max]}
            hide={!showAxis}
            width={showAxis ? 48 : 0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            tickFormatter={fmtAxis}
          />

          {showAxis ? (
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
          ) : null}

          {/* Positive (green) channel — fills down to $0 */}
          <Area
            type="monotone"
            dataKey="pos"
            stroke={WIN}
            strokeWidth={2}
            fill={`url(#${id}-pos)`}
            baseValue={0}
            connectNulls={false}
            isAnimationActive={false}
            dot={false}
          />
          {/* Negative (red) channel — fills up to $0 */}
          <Area
            type="monotone"
            dataKey="neg"
            stroke={LOSS}
            strokeWidth={2}
            fill={`url(#${id}-neg)`}
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
