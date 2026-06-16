"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { useChartColors } from "@/lib/use-chart-colors";
import { formatNetPnlDisplay } from "../lib/journal-widget-mappers";
import { JournalKpiCard } from "./journal-kpi-card";
import { JournalKpiInfo } from "./journal-kpi-info";

interface JournalKpiNetPnlProps {
  totalNetPnl: number;
  /** Cumulative net-P&L series (running total from zero) for the sparkline. */
  series: { i: number; v: number }[];
  className?: string;
}

/**
 * Fraction (0–1) down the chart where the y=0 baseline sits, so a single
 * gradient can split GREEN above zero / RED below it at the crossing.
 */
function zeroOffset(values: number[]): number {
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (min >= 0) return 1; // all non-negative → zero at bottom (all green)
  if (max <= 0) return 0; // all non-positive → zero at top (all red)
  return max / (max - min); // mixed → fraction from the top where y=0 falls
}

export function JournalKpiNetPnl({
  totalNetPnl,
  series,
  className,
}: JournalKpiNetPnlProps) {
  const colors = useChartColors();
  const hasCurve = series.length >= 2;
  const off = hasCurve ? zeroOffset(series.map((d) => d.v)) : 1;

  return (
    <JournalKpiCard
      className={className}
      label="Net P&L"
      info={
        <JournalKpiInfo
          title="Net P&L"
          description="Total realized profit and loss across closed trades in the selected range, net of commissions and swap. The curve shows your running cumulative P&L."
        />
      }
      value={formatNetPnlDisplay(totalNetPnl)}
      chartClassName={
        hasCurve ? "h-[4.5rem] w-[44%] shrink-0 pointer-events-none" : undefined
      }
      chart={
        hasCurve ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 8, right: 4, bottom: 4, left: 4 }}
              style={{ pointerEvents: "none" }}
            >
              <defs>
                {/* Stroke: green above the zero offset, red below */}
                <linearGradient id="kpi-eq-stroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor={colors.win} />
                  <stop offset={off} stopColor={colors.loss} />
                </linearGradient>
                {/* Fill fades to transparent at the zero seam on both sides */}
                <linearGradient id="kpi-eq-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.win} stopOpacity={0.6} />
                  <stop offset={off} stopColor={colors.win} stopOpacity={0.04} />
                  <stop offset={off} stopColor={colors.loss} stopOpacity={0.04} />
                  <stop offset="100%" stopColor={colors.loss} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="url(#kpi-eq-stroke)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#kpi-eq-fill)"
                baseValue={0}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null
      }
    />
  );
}
