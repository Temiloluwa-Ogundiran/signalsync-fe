"use client";

import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { GuardMonitor } from "../types";
import { formatMoney } from "../lib/status";

/**
 * Intraday equity with the daily-loss and max-DD floors drawn as reference lines.
 * Points + floors come from the BE rolling window; the chart only renders them.
 */
export function GuardEquityChart({
  chart,
  status,
}: {
  chart: GuardMonitor["chart"];
  status: GuardMonitor["status"];
}) {
  const stroke =
    status === "CRITICAL" || status === "LOCKED"
      ? "var(--red)"
      : status === "WARNING" || status === "CAUTION"
        ? "var(--warning)"
        : "var(--green)";

  const lowestFloor = Math.min(chart.daily_floor, chart.max_dd_floor);

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chart.points}
          margin={{ top: 6, right: 6, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="guard-equity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.24} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[lowestFloor - 300, "dataMax + 300"]} hide />
          <XAxis dataKey="ts" hide />
          <Tooltip
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-primary)",
              borderRadius: 8,
              fontSize: 11,
            }}
            labelFormatter={() => ""}
            formatter={(value) => [formatMoney(Number(value)), "equity"]}
          />
          <ReferenceLine
            y={chart.max_dd_floor}
            stroke="var(--red)"
            strokeDasharray="4 4"
            strokeOpacity={0.8}
          />
          <ReferenceLine
            y={chart.daily_floor}
            stroke="var(--warning)"
            strokeDasharray="4 4"
            strokeOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={stroke}
            strokeWidth={1.8}
            fill="url(#guard-equity)"
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
