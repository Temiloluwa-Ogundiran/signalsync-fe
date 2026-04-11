import type { JournalTrade } from "@/features/journal/types";
import { asNumber, buildDaySummary, buildProfitFactor, formatCurrency } from "./journal-day-modal.utils";
import type { CurvePoint, MetricRow } from "./journal-day-chat.types";

export function formatDayLabel(dateInput?: string) {
  if (!dateInput) return "Journal Day";
  const date = new Date(`${dateInput}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildRunningPnlCurve(trades: JournalTrade[]): CurvePoint[] {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
  );

  const points: CurvePoint[] = [{ label: "Open", value: 0 }];
  let running = 0;
  sortedTrades.forEach((trade) => {
    running += asNumber(trade.net_profit);
    points.push({
      label: new Date(trade.closed_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      value: running,
    });
  });
  return points;
}

export function buildBalanceCurve(
  trades: JournalTrade[],
  startBalance: number | null,
): CurvePoint[] {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
  );

  if (!sortedTrades.length) return [];

  const resolvedStartBalance =
    startBalance ?? asNumber(sortedTrades[0].balance_before_trade);
  let runningBalance = resolvedStartBalance;
  const points: CurvePoint[] = [{ label: "0", value: runningBalance }];

  sortedTrades.forEach((trade, index) => {
    runningBalance += asNumber(trade.net_profit);
    points.push({ label: `${index + 1}`, value: runningBalance });
  });

  return points;
}

export function buildMetrics(
  trades: JournalTrade[],
  dayStartBalance?: number | null,
  dayEndBalance?: number | null,
): MetricRow[] {
  const summary = buildDaySummary(trades);
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
  );

  const startBalance = dayStartBalance ?? (
    sortedTrades[0] ? asNumber(sortedTrades[0].balance_before_trade) : 0
  );
  const endBalance = dayEndBalance ?? (startBalance + summary.grossPnl);
  const buys = trades.filter((trade) => trade.direction === "buy").length;
  const sells = trades.filter((trade) => trade.direction === "sell").length;
  const bestTrade = trades.length
    ? Math.max(...trades.map((trade) => asNumber(trade.net_profit)))
    : 0;
  const worstTrade = trades.length
    ? Math.min(...trades.map((trade) => asNumber(trade.net_profit)))
    : 0;
  const avgHoldHours = buildAverageHoldHours(trades);
  const drawdown = buildMaxDrawdown(trades, startBalance);
  const profitFactor = buildProfitFactor(trades);

  return [
    { label: "Start Balance", value: formatCurrency(startBalance) },
    { label: "End Balance", value: formatCurrency(endBalance) },
    { label: "Deposit", value: formatCurrency(0) },
    { label: "Commission & Fees", value: formatCurrency(summary.commissions) },
    { label: "Buys", value: buys.toString() },
    { label: "Sells", value: sells.toString() },
    { label: "Total Trades", value: summary.totalTrades.toString() },
    {
      label: "Best Trade",
      value: formatCurrency(bestTrade),
      valueClassName: "text-kpi-metric-positive",
    },
    {
      label: "Worst Trade",
      value: formatCurrency(worstTrade),
      valueClassName: "text-danger",
    },
    { label: "Avg Hold Time", value: `${avgHoldHours.toFixed(1)} Hours` },
    { label: "Max drawdown", value: formatCurrency(drawdown) },
    { label: "Winrate", value: `${summary.winRate.toFixed(1)}%` },
    { label: "Profit Factor", value: profitFactor == null ? "--" : profitFactor.toFixed(2) },
  ];
}

function buildAverageHoldHours(trades: JournalTrade[]) {
  if (!trades.length) return 0;
  const totalMs = trades.reduce((sum, trade) => {
    const opened = new Date(trade.opened_at).getTime();
    const closed = new Date(trade.closed_at).getTime();
    return sum + Math.max(0, closed - opened);
  }, 0);
  return totalMs / trades.length / (1000 * 60 * 60);
}

function buildMaxDrawdown(trades: JournalTrade[], initialBalance: number) {
  let peak = initialBalance;
  let balance = initialBalance;
  let maxDrawdown = 0;
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
  );

  sortedTrades.forEach((trade) => {
    balance += asNumber(trade.net_profit);
    peak = Math.max(peak, balance);
    maxDrawdown = Math.max(maxDrawdown, peak - balance);
  });

  return maxDrawdown;
}
