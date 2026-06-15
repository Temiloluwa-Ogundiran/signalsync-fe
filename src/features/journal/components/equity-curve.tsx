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

const WIN = "#22C55E";
const LOSS = "#EF4444";
const VIOLET = "#8B5CF6";
const VIOLET_LIGHT = "#A78BFA";

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

/**
 * Tradezella-style hover tooltip for the day curve: bold close time, then a
 * row of "SYMBOL HH:MM:SS: $cumulative" with a violet swatch.
 */
function CurveTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: { t?: string; symbol?: string | null; cumulative_pnl: number };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const time = fmtClock(p.t);
  const val = p.cumulative_pnl;
  return (
    <div className="rounded-lg border border-border-primary bg-bg-secondary px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold tabular-nums text-text-primary">{time}</p>
      <p className="flex items-center gap-2 tabular-nums text-text-secondary">
        <span
          className="inline-block h-2.5 w-2.5 rounded-[3px]"
          style={{ backgroundColor: VIOLET }}
          aria-hidden
        />
        {p.symbol ? `${p.symbol} ` : ""}
        {time}:{" "}
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

  // Split mode (day page, dashboard) — Tradezella day curve:
  //   • ONE solid purple line (never green/red on the stroke).
  //   • Zero-split fill: green above $0, red below, fading to transparent at
  //     the baseline. The split lands exactly on $0 via `zeroOffset`.
  //   • Round y-ticks that always include $0, with a padded domain.
  const { domain, ticks } = niceAxis(values);
  const off = zeroOffset(domain[0], domain[1]);
  const strokeId = `${chartId}-stroke`;
  const fillId = `${chartId}-fill`;

  // Plot by real close time when xKey="t": convert each ISO `t` to epoch ms so
  // the x-axis spaces points by when they actually closed (Tradezella style).
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
            {/* Purple stroke gradient (light top → base bottom) for subtle depth. */}
            <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VIOLET_LIGHT} />
              <stop offset="100%" stopColor={VIOLET} />
            </linearGradient>
            {/* Zero-split fill: green above $0 (deep at the line → 0 at zero),
                red below $0 (0 at zero → deep at the bottom). `off` is the
                fraction down the plot where $0 sits. */}
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
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
          )}

          {/* Time x-axis: numeric epoch scale so points space by real close
              time. Hidden — the day curve shows no x labels (Tradezella). */}
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
            domain={domain}
            ticks={showAxes ? ticks : undefined}
            hide={!showAxes}
            width={showAxes ? 48 : 0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717A", fontSize: 12 }}
            tickFormatter={fmtAxis}
          />

          {showAxes && (
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
            />
          )}

          {byTime && (
            <Tooltip
              content={<CurveTooltip />}
              cursor={{ stroke: VIOLET, strokeWidth: 1, strokeOpacity: 0.5 }}
            />
          )}

          <Area
            type="linear"
            dataKey="cumulative_pnl"
            stroke={`url(#${strokeId})`}
            strokeWidth={2}
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
