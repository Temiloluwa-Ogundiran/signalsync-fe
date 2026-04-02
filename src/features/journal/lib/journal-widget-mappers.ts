import type {
  JournalAnalyticsSummaryResponse,
  JournalKpiItem,
  JournalTradesPanelRow,
  JournalTrade,
} from "../types";

function formatMoney(value: number) {
  return `$${Math.abs(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function toJournalKpis(
  summary: JournalAnalyticsSummaryResponse | undefined,
): JournalKpiItem[] {
  const totalNet = summary?.total_net_pnl ?? 0;
  const winRate = summary?.win_rate ?? 0;
  const profitFactor = summary?.profit_factor ?? 0;
  const dailyWin = winRate;
  const avgWin = summary?.avg_win ?? 0;
  const avgLoss = Math.abs(summary?.avg_loss ?? 0);
  const avgRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

  return [
    {
      id: "net-pnl",
      label: "Net P&L",
      value: `${totalNet >= 0 ? "+" : "-"}${formatMoney(totalNet)}`,
      tone: totalNet >= 0 ? "win" : "loss",
      helper: `${summary?.total_trades ?? 0}`,
    },
    {
      id: "trade-win",
      label: "Trade Win %",
      value: formatPercent(winRate),
      tone: "default",
      ratio: Math.min(1, Math.max(0, winRate / 100)),
    },
    {
      id: "profit-factor",
      label: "Profit Factor",
      value: profitFactor.toFixed(2),
      tone: "default",
      ratio: Math.min(1, Math.max(0, profitFactor / 3)),
    },
    {
      id: "daily-win",
      label: "Daily Win %",
      value: formatPercent(dailyWin),
      tone: "default",
      ratio: Math.min(1, Math.max(0, dailyWin / 100)),
    },
    {
      id: "avg-ratio",
      label: "Avg Win/Loss Trade",
      value: avgRatio.toFixed(2),
      tone: "default",
      helper: `${formatMoney(avgWin)} / ${formatMoney(avgLoss)}`,
      ratio: Math.min(1, Math.max(0, avgRatio / 5)),
    },
  ];
}

export function toTradesPanelRows(trades: JournalTrade[]): JournalTradesPanelRow[] {
  return trades.slice(0, 10).map((trade) => ({
    id: trade.id,
    closeDate: new Date(trade.closed_at).toLocaleDateString("en-GB"),
    symbol: trade.symbol,
    netPnl: Number(trade.net_profit) || 0,
  }));
}

