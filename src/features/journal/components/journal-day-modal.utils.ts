import { formatMoney } from "@/lib/format/money";
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

/**
 * Format a monetary amount in the given broker-account currency (ISO-4217, e.g.
 * "USD", "NGN"); omit to default to USD ($). Display-only — no conversion is
 * performed on `value`.
 */
export function formatCurrency(value: number, currency?: string | null) {
  return formatMoney(value, { currency });
}

export function formatClock(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTradeTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

/** Coerce API `Decimal` (often JSON string) to a finite number, or null if absent. */
function normalizeApiBalance(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = asNumber(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Resolve start/end of day balances: coerce API decimals, then apply the same
 * fill-forward rules as the backend / day chat metrics (start+PnL=end, etc.).
 */
function resolveDayBookends(
  trades: JournalTrade[],
  apiDayStart?: number | string | null,
  apiDayEnd?: number | string | null,
): { dayStartBalance: number | null; dayEndBalance: number | null } {
  const grossPnl = trades.reduce(
    (sum, trade) => sum + asNumber(trade.net_profit),
    0,
  );
  let start = normalizeApiBalance(apiDayStart);
  let end = normalizeApiBalance(apiDayEnd);

  if (end == null && start != null) {
    end = start + grossPnl;
  }
  if (start == null && end != null) {
    start = end - grossPnl;
  }

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
  );

  if (start == null && sortedTrades.length > 0) {
    const raw = sortedTrades[0].balance_before_trade;
    if (raw != null && raw !== "") {
      const first = asNumber(raw);
      if (Number.isFinite(first)) start = first;
    }
  }

  if (end == null && start != null) {
    end = start + grossPnl;
  }

  return { dayStartBalance: start, dayEndBalance: end };
}

function formatHoldTime(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.round(ms / 1000);
  const totalMinutes = Math.round(totalSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

function calculateAverageHoldTime(trades: JournalTrade[]): string {
  if (trades.length === 0) return "--";

  let totalMs = 0;
  let count = 0;

  for (const trade of trades) {
    if (!trade.opened_at || !trade.closed_at) continue;
    const opened = new Date(trade.opened_at).getTime();
    const closed = new Date(trade.closed_at).getTime();
    if (!Number.isNaN(opened) && !Number.isNaN(closed)) {
      totalMs += Math.max(closed - opened, 0);
      count++;
    }
  }

  if (count === 0) return "--";
  const avgMs = totalMs / count;
  return formatHoldTime(avgMs);
}

export function buildDaySummary(
  trades: JournalTrade[],
  dayStartBalance?: number | string | null,
  dayEndBalance?: number | string | null,
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

  const { dayStartBalance: resolvedStart, dayEndBalance: resolvedEnd } =
    resolveDayBookends(trades, dayStartBalance ?? null, dayEndBalance ?? null);

  const avgHoldTime = calculateAverageHoldTime(trades);

  return {
    totalTrades,
    winners,
    losers,
    breakeven,
    winRate,
    grossPnl,
    commissions,
    volume,
    dayStartBalance: resolvedStart,
    dayEndBalance: resolvedEnd,
    avgHoldTime,
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

/**
 * Net ROI %: prefer `net_profit / balance_before_trade` when the backend
 * supplies equity-before-trade; otherwise use normalized `net_roi_percent`
 * from the API (0–1 treated as fraction).
 */
export function computeNetRoiPercent(trade: JournalTrade): number | null {
  const profit = asNumber(trade.net_profit);
  const bal =
    trade.balance_before_trade != null && trade.balance_before_trade !== ""
      ? asNumber(trade.balance_before_trade)
      : null;

  const direct =
    bal != null && Math.abs(bal) > 1e-9 ? (profit / bal) * 100 : null;
  if (direct != null) {
    return direct;
  }

  if (trade.net_roi_percent != null) {
    const roi = asNumber(trade.net_roi_percent);
    return Math.abs(roi) <= 1 ? roi * 100 : roi;
  }

  return null;
}
