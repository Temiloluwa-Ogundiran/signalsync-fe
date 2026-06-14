import type {
  JournalOpenPosition,
  JournalOpenPositionsPanelRow,
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

/** Compact currency for KPI sub-labels (e.g. `$4.1K`, `$350`). */
export function formatCompactMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatAvgWinLossRatioDisplay(avgWin: number, avgLoss: number): string {
  const loss = Math.abs(avgLoss);
  if (loss === 0) {
    return avgWin > 0 ? "∞" : "0.00";
  }
  return (avgWin / loss).toFixed(2);
}

/** Share of |avg win| in (avg win + |avg loss|) for the dual-tone bar width. */
export function winLossShare(avgWin: number, avgLoss: number): number {
  const w = Math.max(0, avgWin);
  const l = Math.max(0, Math.abs(avgLoss));
  const t = w + l;
  if (t === 0) return 0;
  return w / t;
}

/** Compact hold-time label from open→close (e.g. `45s`, `12m`, `3h 20m`, `2d 4h`). */
export function formatHoldTime(openedAt: string, closedAt: string): string {
  const start = new Date(openedAt).getTime();
  const end = new Date(closedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "—";
  const seconds = Math.max(0, Math.round((end - start) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remMin = minutes % 60;
    return remMin ? `${hours}h ${remMin}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHrs = hours % 24;
  return remHrs ? `${days}d ${remHrs}h` : `${days}d`;
}

export function toTradesPanelRows(trades: JournalTrade[]): JournalTradesPanelRow[] {
  return trades.slice(0, 10).map((trade) => ({
    id: trade.id,
    closeDate: new Date(trade.closed_at).toLocaleDateString("en-GB"),
    symbol: trade.symbol,
    netPnl: Number(trade.net_profit) || 0,
    holdTime: formatHoldTime(trade.opened_at, trade.closed_at),
  }));
}

export function toOpenPositionsPanelRows(
  positions: JournalOpenPosition[],
): JournalOpenPositionsPanelRow[] {
  return positions.slice(0, 10).map((position) => ({
    id: position.position_id,
    openDate: position.opened_at
      ? new Date(position.opened_at).toLocaleDateString("en-GB")
      : "Live",
    symbol: position.symbol,
    floatingPnl: Number(position.floating_profit) || 0,
  }));
}

