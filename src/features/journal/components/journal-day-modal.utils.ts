import type { JournalTrade } from "../types";
import type { JournalDaySummary } from "./journal-day-modal.types";

export function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatCurrency(value: number) {
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toFixed(2)}`;
}

export function formatClock(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildDaySummary(
  trades: JournalTrade[],
  dayStartBalance?: number | null,
  dayEndBalance?: number | null,
): JournalDaySummary {
  const totalTrades = trades.length;
  const winners = trades.filter(
    (trade) => asNumber(trade.net_profit) > 0,
  ).length;
  const losers = trades.filter(
    (trade) => asNumber(trade.net_profit) < 0,
  ).length;
  const breakeven = totalTrades - winners - losers;
  const decisionTrades = winners + losers;
  const winRate = decisionTrades ? (winners / decisionTrades) * 100 : 0;
  const grossPnl = trades.reduce(
    (sum, trade) => sum + asNumber(trade.net_profit),
    0,
  );
  const commissions = trades.reduce(
    (sum, trade) => sum + Math.abs(asNumber(trade.commission)),
    0,
  );
  const volume = trades.reduce((sum, trade) => sum + asNumber(trade.volume), 0);

  return {
    totalTrades,
    winners,
    losers,
    breakeven,
    winRate,
    grossPnl,
    commissions,
    volume,
    dayStartBalance:
      dayStartBalance != null && Number.isFinite(dayStartBalance)
        ? dayStartBalance
        : null,
    dayEndBalance:
      dayEndBalance != null && Number.isFinite(dayEndBalance) ? dayEndBalance : null,
  };
}

export function buildProfitFactor(trades: JournalTrade[]) {
  const grossWins = trades
    .filter((trade) => asNumber(trade.net_profit) > 0)
    .reduce((sum, trade) => sum + asNumber(trade.net_profit), 0);
  const grossLossAbs = Math.abs(
    trades
      .filter((trade) => asNumber(trade.net_profit) < 0)
      .reduce((sum, trade) => sum + asNumber(trade.net_profit), 0),
  );
  if (!grossLossAbs) return null;
  return grossWins / grossLossAbs;
}

export function computeNetRoiPercent(trade: JournalTrade) {
  const hasBackendRoi = trade.net_roi_percent != null;

  if (hasBackendRoi) {
    const roi = asNumber(trade.net_roi_percent);
    return Math.abs(roi) <= 1 ? roi * 100 : roi;
  }

  return null;
}
