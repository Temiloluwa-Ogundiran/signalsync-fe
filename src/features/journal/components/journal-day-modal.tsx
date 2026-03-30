"use client";

import { useMemo } from "react";
import { Loader2, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useJournalDay,
  useJournalDayTrades,
} from "../hooks/use-journal-day-modal";

interface JournalDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId?: string;
  tradingDate?: string;
}

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`;
}

function formatClock(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JournalDayModal({
  open,
  onOpenChange,
  accountId,
  tradingDate,
}: JournalDayModalProps) {
  const router = useRouter();

  const dayQuery = useJournalDay(accountId, tradingDate, open);
  const tradesQuery = useJournalDayTrades(accountId, tradingDate, open);

  const trades = tradesQuery.data?.items ?? [];
  const chipByTradeId = useMemo(
    () =>
      new Map(
        (dayQuery.data?.trade_chips ?? []).map((chip) => [chip.trade_id, chip]),
      ),
    [dayQuery.data?.trade_chips],
  );

  const summary = useMemo(() => {
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
    const volume = trades.reduce(
      (sum, trade) => sum + asNumber(trade.volume),
      0,
    );

    return {
      totalTrades,
      winners,
      losers,
      breakeven,
      winRate,
      grossPnl,
      commissions,
      volume,
    };
  }, [trades]);

  const dayTitle = useMemo(() => {
    if (!tradingDate) return "Journal Day";
    const date = new Date(`${tradingDate}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [tradingDate]);

  const isLoading = dayQuery.isLoading || tradesQuery.isLoading;

  const getNetRoi = (trade: { net_roi_percent?: number | string | null }) => {
    if (trade.net_roi_percent == null) return null;
    return asNumber(trade.net_roi_percent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[80vw] border border-border-primary bg-card-bg p-0">
        <DialogHeader className="border-b border-border-primary px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="text-base font-semibold text-text-primary">
              {dayTitle}
              <span
                className={`ml-3 text-sm ${summary.grossPnl >= 0 ? "text-success" : "text-danger"}`}
              >
                Net P&L {formatCurrency(summary.grossPnl)}
              </span>
            </DialogTitle>
            <button
              onClick={() => {
                if (!accountId || !tradingDate) return;
                onOpenChange(false);
                router.push(
                  `/journal/chat?accountId=${encodeURIComponent(accountId)}&date=${encodeURIComponent(tradingDate)}&context=day`,
                );
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-light px-3 py-1.5 text-sm font-medium text-accent mr-6"
            >
              <PencilLine className="h-4 w-4" />
              Journal Day
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading day details...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border-primary bg-bg-tertiary/30 p-3 text-sm md:grid-cols-8">
                <div>
                  <p className="text-xs uppercase text-text-tertiary">
                    Total Trades
                  </p>
                  <p className="font-semibold text-text-primary">
                    {summary.totalTrades}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">
                    Winners
                  </p>
                  <p className="font-semibold text-text-primary">
                    {summary.winners}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">Losers</p>
                  <p className="font-semibold text-text-primary">
                    {summary.losers}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">
                    Breakeven
                  </p>
                  <p className="font-semibold text-text-primary">
                    {summary.breakeven}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">
                    Win Rate
                  </p>
                  <p className="font-semibold text-text-primary">
                    {summary.winRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">
                    Gross P&L
                  </p>
                  <p
                    className={`font-semibold ${summary.grossPnl >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {formatCurrency(summary.grossPnl)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">
                    Commissions
                  </p>
                  <p className="font-semibold text-text-primary">
                    ${summary.commissions.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-text-tertiary">Volume</p>
                  <p className="font-semibold text-text-primary">
                    {summary.volume.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-border-primary">
                <table className="min-w-full text-sm">
                  <thead className="bg-bg-tertiary/50 text-left text-xs uppercase tracking-wide text-text-tertiary">
                    <tr>
                      <th className="px-3 py-2">Open Time</th>
                      <th className="px-3 py-2">Close Time</th>
                      <th className="px-3 py-2">Pair</th>
                      <th className="px-3 py-2">Side</th>
                      <th className="px-3 py-2">Volume</th>
                      <th className="px-3 py-2">Net P&amp;L</th>
                      <th className="px-3 py-2">Net ROI</th>
                      <th className="px-3 py-2 text-center">Journal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length ? (
                      trades.map((trade) => {
                        const net = asNumber(trade.net_profit);
                        const roi = getNetRoi(trade);
                        const journalCount =
                          chipByTradeId.get(trade.id)?.journal_message_count ??
                          0;

                        return (
                          <tr
                            key={trade.id}
                            className="border-t border-border-primary/70"
                          >
                            <td className="px-3 py-2 text-text-secondary">
                              {formatClock(trade.opened_at)}
                            </td>
                            <td className="px-3 py-2 text-text-secondary">
                              {formatClock(trade.closed_at)}
                            </td>
                            <td className="px-3 py-2 font-medium text-text-primary">
                              {trade.symbol}
                            </td>
                            <td className="px-3 py-2 uppercase text-text-secondary">
                              {trade.direction}
                            </td>
                            <td className="px-3 py-2 text-text-secondary">
                              {asNumber(trade.volume).toFixed(2)}
                            </td>
                            <td
                              className={`px-3 py-2 font-semibold ${net >= 0 ? "text-success" : "text-danger"}`}
                            >
                              {formatCurrency(net)}
                            </td>
                            <td
                              className={`px-3 py-2 font-semibold ${
                                roi == null
                                  ? "text-text-tertiary"
                                  : roi >= 0
                                    ? "text-success"
                                    : "text-danger"
                              }`}
                            >
                              {roi == null ? "--" : `${roi.toFixed(2)}%`}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => {
                                  if (!accountId || !tradingDate) return;
                                  onOpenChange(false);
                                  router.push(
                                    `/journal/chat?accountId=${encodeURIComponent(accountId)}&date=${encodeURIComponent(tradingDate)}&context=trade&tradeId=${encodeURIComponent(trade.id)}`,
                                  );
                                }}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                                  journalCount > 0
                                    ? "border-accent/40 bg-accent-light text-accent"
                                    : "border-border-primary text-text-tertiary hover:text-accent"
                                }`}
                                title="Open trade chat"
                                aria-label="Open trade chat"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-8 text-center text-sm text-text-tertiary"
                        >
                          No trades for this day.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
