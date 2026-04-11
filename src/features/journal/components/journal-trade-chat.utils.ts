import type { JournalTrade } from "@/features/journal/types";
import type { CurvePoint, MetricRow } from "./journal-day-chat.types";
import { asNumber, computeNetRoiPercent, formatCurrency } from "./journal-day-modal.utils";

export function formatTradeHeaderDate(iso?: string) {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTradeDateTime(iso?: string) {
  if (!iso) return "--";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildTradeMetrics(trade?: JournalTrade): MetricRow[] {
  if (!trade) {
    return [];
  }

  const roiPercent = computeNetRoiPercent(trade);
  const direction = trade.direction.toUpperCase();

  return [
    { label: "Side", value: direction, valueClassName: direction === "BUY" ? "text-kpi-metric-positive" : "text-danger" },
    { label: "Net ROI", value: roiPercent == null ? "--" : `${roiPercent.toFixed(2)}%`, valueClassName: roiPercent == null ? "text-text-tertiary" : roiPercent >= 0 ? "text-kpi-metric-positive" : "text-danger" },
    { label: "Lot Size", value: asNumber(trade.volume).toFixed(2) },
    { label: "Open Time", value: formatTradeDateTime(trade.opened_at) },
    { label: "Close Time", value: formatTradeDateTime(trade.closed_at) },
    { label: "Open Price", value: asNumber(trade.open_price).toFixed(4) },
    { label: "Close Price", value: asNumber(trade.close_price).toFixed(4) },
    { label: "Commission", value: formatCurrency(asNumber(trade.commission)) },
    { label: "Swap", value: "$0.00" },
    { label: "Fee", value: "$0.00" },
  ];
}

export function buildTradeRunningPnlCurve(trade?: JournalTrade): CurvePoint[] {
  if (!trade) return [];
  const net = asNumber(trade.net_profit);
  const openedAt = new Date(trade.opened_at).getTime();
  const closedAt = new Date(trade.closed_at).getTime();
  const durationMs = Math.max(closedAt - openedAt, 60_000);

  const segments = durationMs <= 60 * 60 * 1000
    ? 4
    : durationMs <= 4 * 60 * 60 * 1000
      ? 6
      : durationMs <= 24 * 60 * 60 * 1000
        ? 8
        : 10;

  const points: CurvePoint[] = [];
  for (let idx = 0; idx <= segments; idx += 1) {
    const ratio = idx / segments;
    const timestamp = new Date(openedAt + durationMs * ratio);
    points.push({
      label: timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      value: net * ratio,
    });
  }
  return points;
}

export function buildTradePercentCurve(trade?: JournalTrade): CurvePoint[] {
  if (!trade) return [];
  const roiPercent = computeNetRoiPercent(trade) ?? 0;
  return [
    { label: "Open", value: 0 },
    { label: "Mid", value: roiPercent * 0.5 },
    { label: "Close", value: roiPercent },
  ];
}
