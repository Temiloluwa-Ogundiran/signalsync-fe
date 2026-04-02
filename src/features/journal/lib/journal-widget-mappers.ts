import type {
  JournalAnalyticsSummaryResponse,
  JournalTradesPanelRow,
  JournalTrade,
} from "../types";

function formatMoney(value: number) {
  return `$${Math.abs(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export function formatNetPnlDisplay(totalNet: number): string {
  const formatted = formatMoney(totalNet);
  return totalNet >= 0 ? formatted : `-${formatted}`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

/** Values for the three KPI cards that are not yet redesigned (Profit Factor, Daily Win %, Avg Win/Loss). */
export function getJournalKpiLegacyCardModels(
  summary: JournalAnalyticsSummaryResponse | undefined,
) {
  const profitFactor = summary?.profit_factor ?? 0;
  const winRate = summary?.win_rate ?? 0;
  const avgWin = summary?.avg_win ?? 0;
  const avgLoss = Math.abs(summary?.avg_loss ?? 0);
  const avgRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

  return {
    profitFactor: {
      label: "Profit Factor" as const,
      value: profitFactor.toFixed(2),
      ratio: Math.min(1, Math.max(0, profitFactor / 3)),
    },
    dailyWin: {
      label: "Daily Win %" as const,
      value: formatPercent(winRate),
      ratio: Math.min(1, Math.max(0, winRate / 100)),
    },
    avgRatio: {
      label: "Avg Win/Loss Trade" as const,
      value: avgRatio.toFixed(2),
      helper: `${formatMoney(avgWin)} / ${formatMoney(avgLoss)}`,
      ratio: Math.min(1, Math.max(0, avgRatio / 5)),
    },
  };
}

export function toTradesPanelRows(trades: JournalTrade[]): JournalTradesPanelRow[] {
  return trades.slice(0, 10).map((trade) => ({
    id: trade.id,
    closeDate: new Date(trade.closed_at).toLocaleDateString("en-GB"),
    symbol: trade.symbol,
    netPnl: Number(trade.net_profit) || 0,
  }));
}

