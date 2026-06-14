"use client";

import { Cell, Pie, PieChart } from "recharts";

import { formatPercent } from "../lib/journal-widget-mappers";
import type { TradeOutcomeCounts } from "../lib/journal-kpi-aggregates";
import { JournalKpiInfo } from "./journal-kpi-info";
import { JournalKpiCard } from "./journal-kpi-card";

interface JournalKpiTradeWinProps {
  winRatePercent: number;
  outcomeCounts: TradeOutcomeCounts;
  className?: string;
}

/**
 * 180° gauge: green arc up to the winrate, a thin grey marker segment, then red
 * for the remainder. Reads like a speedometer of the win percentage.
 */
function buildGaugeData(winRatePercent: number) {
  const rate = Math.max(0, Math.min(100, winRatePercent));
  const marker = 3; // thin grey divider segment at the needle position
  const green = Math.max(0, rate - marker / 2);
  const red = Math.max(0, 100 - green - marker);
  return [
    { name: "green", value: green, color: "#22C55E" },
    { name: "marker", value: marker, color: "var(--neutral-grey)" },
    { name: "red", value: red, color: "#EF4444" },
  ];
}

export function JournalKpiTradeWin({
  winRatePercent,
  outcomeCounts,
  className,
}: JournalKpiTradeWinProps) {
  const gaugeData = buildGaugeData(winRatePercent);

  return (
    <JournalKpiCard
      className={className}
      label="Winrate"
      info={
        <JournalKpiInfo
          title="Trade Win %"
          description="The percentage of closed trades that ended profitable in the selected range. Breakeven trades are excluded from wins."
        />
      }
      value={formatPercent(winRatePercent)}
      chart={
        <div className="flex flex-col items-center gap-1.5">
          <PieChart width={88} height={48}>
            <Pie
              data={gaugeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              innerRadius={28}
              outerRadius={40}
              startAngle={180}
              endAngle={0}
              stroke="none"
              cornerRadius={6}
              isAnimationActive={false}
            >
              {gaugeData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[rgba(34,197,94,0.12)] px-1.5 text-[11px] font-semibold tabular-nums text-success">
              {outcomeCounts.wins}
            </span>
            <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-chip-grey px-1.5 text-[11px] font-semibold tabular-nums text-kpi-label">
              {outcomeCounts.breakeven}
            </span>
            <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[rgba(239,68,68,0.12)] px-1.5 text-[11px] font-semibold tabular-nums text-danger">
              {outcomeCounts.losses}
            </span>
          </div>
        </div>
      }
    />
  );
}
