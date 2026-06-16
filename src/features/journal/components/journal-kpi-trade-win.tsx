"use client";

import { Cell, Pie, PieChart } from "recharts";

import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
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
 * 180° gauge: green for wins, grey for breakeven, red for losses — each segment
 * sized to its share of total trades. The grey segment is omitted entirely when
 * there are no breakeven trades.
 */
function buildGaugeData(
  counts: TradeOutcomeCounts,
  winColor: string,
  lossColor: string,
) {
  return [
    { name: "green", value: counts.wins, color: winColor },
    { name: "marker", value: counts.breakeven, color: "var(--neutral-grey)" },
    { name: "red", value: counts.losses, color: lossColor },
  ].filter((seg) => seg.value > 0);
}

export function JournalKpiTradeWin({
  winRatePercent,
  outcomeCounts,
  className,
}: JournalKpiTradeWinProps) {
  const colors = useChartColors();
  const gaugeData = buildGaugeData(outcomeCounts, colors.win, colors.loss);

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
        <div className="flex flex-col items-center">
          <PieChart width={120} height={62}>
            <Pie
              data={gaugeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              innerRadius={44}
              outerRadius={52}
              startAngle={180}
              endAngle={0}
              stroke="none"
              cornerRadius={0}
              isAnimationActive={false}
            >
              {gaugeData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>

          {/* Pills aligned under each end of the arc: wins left, losses right,
              breakeven centered. */}
          <div className="relative flex w-[120px] items-center justify-between">
            <Pill tone="win">{outcomeCounts.wins}</Pill>
            {outcomeCounts.breakeven > 0 ? (
              <Pill
                tone="neutral"
                className="absolute left-1/2 -translate-x-1/2"
              >
                {outcomeCounts.breakeven}
              </Pill>
            ) : null}
            <Pill tone="loss">{outcomeCounts.losses}</Pill>
          </div>
        </div>
      }
    />
  );
}

function Pill({
  tone,
  children,
  className,
}: {
  tone: "win" | "neutral" | "loss";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-7 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
        tone === "win" && "bg-success-light text-success",
        tone === "neutral" && "bg-chip-grey text-kpi-label",
        tone === "loss" && "bg-danger-light text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}
