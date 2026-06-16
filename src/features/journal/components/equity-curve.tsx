"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartColors } from "@/lib/use-chart-colors";

/** "Nice" step sizes for round y-axis ticks (1-2-5 sequence, scaled). */
const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

/**
 * Build a padded domain + round ticks that always include $0, aiming for ~4–5
 * ticks. Domain is rounded outward to the chosen step so the curve is never
 * crushed against the top/bottom edge.
 */
function niceAxis(values: number[]): { domain: [number, number]; ticks: number[] } {
  const dataMin = Math.min(0, ...values);
  const dataMax = Math.max(0, ...values);
  const range = dataMax - dataMin || 1;

  // Pick the smallest "nice" step that yields ~4 segments or fewer (so the
  // tick count lands around 4–5 including $0, not 6–7). Scale beyond the table
  // for very large ranges.
  let step = NICE_STEPS[NICE_STEPS.length - 1];
  for (const s of NICE_STEPS) {
    if (range / s <= 4) {
      step = s;
      break;
    }
  }
  if (range / step > 4) {
    const pow = Math.pow(10, Math.floor(Math.log10(range / 4)));
    step = Math.ceil(range / 4 / pow) * pow;
  }

  // Round the domain outward to the step, but don't add a spurious negative
  // (or positive) band when the data barely crosses zero — a value within a
  // tenth of a step of zero shouldn't earn a whole extra tick on that side.
  const eps = step * 0.1;
  const niceMin = dataMin < -eps ? Math.floor(dataMin / step) * step : 0;
  const niceMax = dataMax > eps ? Math.ceil(dataMax / step) * step : 0;

  // Flat $0 day (no movement): show a small symmetric band so it's not a line.
  const lo = niceMin;
  const hi = niceMin === 0 && niceMax === 0 ? step : niceMax;

  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) {
    ticks.push(Math.abs(t) < step / 2 ? 0 : Math.round(t));
  }
  return { domain: [lo, hi], ticks };
}

interface EquityCurveProps {
  // Data: daily {date, cumulative_pnl}, intraday-by-sequence {i, cumulative_pnl},
  // or intraday-by-time {t (ISO), cumulative_pnl}.
  data: Array<{
    date?: string;
    i?: number;
    t?: string;
    symbol?: string | null;
    cumulative_pnl: number;
  }>;
  // Which axis field to plot on: "date" (daily), "i" (sequence), "t" (real time)
  xKey: "date" | "i" | "t";
  // Render style
  colorMode: "split" | "solid";
  solidVariant?: "win" | "loss"; // Only used when colorMode="solid"
  // Split-mode stroke: "violet" (day page) or "zeroSplit" green/red (dashboard).
  strokeMode?: "violet" | "zeroSplit";
  // Line interpolation: "linear" (day page) or "monotone" (dashboard).
  interpolation?: "linear" | "monotone";
  // Y-axis ticks: "nice" (padded round, day page) or "auto" (compact, dashboard).
  yMode?: "nice" | "auto";
  // Display options
  showAxes?: boolean;
  size?: "spark" | "full"; // spark=tiny (feed rows), full=larger (dashboard, day page)
  className?: string;
}

function fmtAxis(v: number) {
  const abs = Math.abs(v);
  const compact =
    abs >= 1000
      ? `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`
      : abs.toLocaleString("en-US");
  return `${v < 0 ? "-" : ""}$${compact}`;
}

function fmtMoney(v: number) {
  const abs = Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return v < 0 ? `-$${abs}` : `$${abs}`;
}

function fmtClock(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
}

/** "02/27/25" from a YYYY-MM-DD date string. */
function fmtMDY(iso?: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/**
 * Hover tooltip. Intraday: "SYMBOL HH:MM:SS: $cumulative" with the close time as
 * the header. Daily: the date as header + "$cumulative". Violet swatch.
 */
function CurveTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: {
      t?: string;
      date?: string;
      symbol?: string | null;
      cumulative_pnl: number;
    };
  }>;
}) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const header = p.t ? fmtClock(p.t) : fmtMDY(p.date);
  const val = p.cumulative_pnl;
  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold tabular-nums text-text-primary">
        {header}
      </p>
      <p className="flex items-center gap-2 tabular-nums text-text-secondary">
        <span
          className="inline-block h-2.5 w-2.5 rounded-[3px]"
          style={{ backgroundColor: colors.ai }}
          aria-hidden
        />
        {p.symbol ? `${p.symbol} ` : ""}
        {header ? `${header}: ` : ""}
        <span className={val < 0 ? "text-danger" : "text-success"}>
          {fmtMoney(val)}
        </span>
      </p>
    </div>
  );
}

/**
 * Fraction (0–1) down the plot where $0 sits within [domainMin, domainMax],
 * for anchoring the green→transparent→red fill gradient exactly on the zero
 * line. domainMax is at the top (offset 0), domainMin at the bottom (offset 1).
 */
function zeroOffset(domainMin: number, domainMax: number): number {
  if (domainMax <= 0) return 0; // all below zero → fully red
  if (domainMin >= 0) return 1; // all above zero → fully green
  return domainMax / (domainMax - domainMin);
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
  strokeMode = "violet",
  interpolation = "linear",
  yMode = "nice",
  showAxes = false,
  size = "full",
  className,
}: EquityCurveProps) {
  const colors = useChartColors();
  if (!data || data.length === 0) {
    return <div className={className} />;
  }

  const WIN = colors.win;
  const LOSS = colors.loss;
  const VIOLET = colors.ai;
  const VIOLET_LIGHT = colors.aiBright;
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

  // Split mode (shared by the day-page curve and the dashboard cumulative):
  //   • Zero-split fill: green above $0, red below, fading to transparent at the
  //     baseline; the split lands exactly on $0 via `zeroOffset`.
  //   • Stroke: "violet" (day page) or "zeroSplit" green/red (dashboard).
  //   • X axis: "date" (dashboard), sequence "i" (day page), or time "t".
  //   • Y axis: "nice" padded round ticks, or "auto" compact.
  const nice = niceAxis(values);
  const dataMin = Math.min(0, ...values);
  const dataMax = Math.max(0, ...values);
  // `off` (the green→red fill boundary) must be computed from the SAME y-domain
  // the chart plots in, so the color flip lands on the $0 pixel row.
  const off =
    yMode === "nice"
      ? zeroOffset(nice.domain[0], nice.domain[1])
      : zeroOffset(dataMin, dataMax);
  const strokeId = `${chartId}-stroke`;
  const fillId = `${chartId}-fill`;

  const byDate = xKey === "date";
  const bySeq = xKey === "i";
  const byTime = xKey === "t";
  const plotData = byTime
    ? data.map((d) => ({ ...d, tms: d.t ? new Date(d.t).getTime() : 0 }))
    : data;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={plotData}
          margin={
            showAxes
              ? { top: 10, right: 10, bottom: 6, left: 8 }
              : size === "spark"
                ? { top: 2, right: 0, bottom: 2, left: 0 }
                : { top: 6, right: 4, bottom: 6, left: 4 }
          }
        >
          <defs>
            {strokeMode === "zeroSplit" ? (
              // Green above $0 / red below — hard switch exactly at the baseline.
              <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
                <stop offset={off} stopColor={WIN} />
                <stop offset={off} stopColor={LOSS} />
              </linearGradient>
            ) : (
              // Violet line (light top → base bottom) for subtle depth.
              <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VIOLET_LIGHT} />
                <stop offset="100%" stopColor={VIOLET} />
              </linearGradient>
            )}
            {/* Zero-split fill: green above $0 (deep at the line → 0 at zero),
                red below $0 (0 at zero → deep at the bottom). */}
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={WIN} stopOpacity={0.4} />
              <stop offset={off} stopColor={WIN} stopOpacity={0} />
              <stop offset={off} stopColor={LOSS} stopOpacity={0} />
              <stop offset="100%" stopColor={LOSS} stopOpacity={0.4} />
            </linearGradient>
          </defs>

          {showAxes && (
            <CartesianGrid
              vertical={false}
              stroke={colors.grid}
              strokeDasharray="3 3"
            />
          )}

          {/* Date x-axis (dashboard): MM/DD/YY labels, category-spaced. */}
          {byDate && (
            <XAxis
              dataKey="date"
              tickFormatter={fmtMDY}
              tick={{ fill: colors.axisTick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={32}
              hide={!showAxes}
            />
          )}

          {/* Sequence x-axis (day page): equal-width slot per trade, keyed on
              unique `i`. No x labels are shown (the close time appears in the
              hover tooltip instead). */}
          {bySeq && (
            <XAxis
              dataKey="i"
              type="number"
              domain={[0, data.length - 1]}
              tick={false}
              tickLine={false}
              axisLine={false}
            />
          )}

          {/* Time x-axis: numeric epoch scale (real-time spacing). Hidden. */}
          {byTime && (
            <XAxis
              dataKey="tms"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              hide
            />
          )}

          <YAxis
            domain={yMode === "nice" ? nice.domain : ["dataMin", "dataMax"]}
            ticks={showAxes && yMode === "nice" ? nice.ticks : undefined}
            hide={!showAxes}
            width={showAxes ? (yMode === "nice" ? 48 : 56) : 0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.axisTick, fontSize: yMode === "nice" ? 12 : 11 }}
            tickFormatter={fmtAxis}
          />

          {showAxes && yMode === "nice" && (
            <ReferenceLine
              y={0}
              stroke={colors.grid}
              strokeDasharray="4 4"
            />
          )}

          <Tooltip
            content={<CurveTooltip />}
            cursor={{
              stroke: strokeMode === "zeroSplit" ? colors.grid : VIOLET,
              strokeWidth: 1,
              strokeOpacity: 0.6,
            }}
          />

          <Area
            type={interpolation}
            dataKey="cumulative_pnl"
            stroke={`url(#${strokeId})`}
            strokeWidth={strokeMode === "zeroSplit" ? 2 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={`url(#${fillId})`}
            baseValue={0}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
