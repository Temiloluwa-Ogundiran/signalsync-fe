"use client";

import {
  formatAvgWinLossRatioDisplay,
  formatCompactMoney,
  winLossShare,
} from "../lib/journal-widget-mappers";
import { JournalKpiInfo } from "./journal-kpi-info";
import { JournalKpiCard } from "./journal-kpi-card";

interface JournalKpiAvgWinLossProps {
  avgWin: number;
  avgLoss: number;
  className?: string;
}

export function JournalKpiAvgWinLoss({
  avgWin,
  avgLoss,
  className,
}: JournalKpiAvgWinLossProps) {
  const share = winLossShare(avgWin, avgLoss);
  const greenPct = Math.round(share * 100);
  const redPct = 100 - greenPct;
  const ratioLabel = formatAvgWinLossRatioDisplay(avgWin, avgLoss);

  return (
    <JournalKpiCard
      className={className}
      label="Avg P&L"
      info={
        <JournalKpiInfo
          title="Avg Win/Loss Trade"
          description="Average winning trade size compared with average losing trade size. Higher ratio means winners are larger relative to losers."
        />
      }
      value={formatCompactMoney(avgWin - Math.abs(avgLoss))}
      chart={
        <div className="flex w-[7.5rem] flex-col items-stretch gap-1.5">
          <span className="text-center text-[13px] font-semibold tabular-nums text-text-primary">
            {ratioLabel}:1
          </span>
          <div className="flex h-2.5 w-full items-stretch gap-0.5">
            <span
              className="rounded-[3px] bg-success"
              style={{ width: `${greenPct}%` }}
            />
            <span
              className="rounded-[3px] bg-danger"
              style={{ width: `${redPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium tabular-nums">
            <span className="text-success">{formatCompactMoney(avgWin)}</span>
            <span className="text-danger">
              -{formatCompactMoney(Math.abs(avgLoss))}
            </span>
          </div>
        </div>
      }
    />
  );
}
