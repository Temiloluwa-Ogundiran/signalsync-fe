"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useJournalDay } from "../hooks/use-journal-day-modal";
import { JournalDayModalFooter } from "./journal-day-modal-footer";
import { JournalDayModalHeader } from "./journal-day-modal-header";
import { JournalDayModalOverview } from "./journal-day-modal-overview";
import { JournalDayModalTradesTable } from "./journal-day-modal-trades-table";
import type { JournalDayTradeRow } from "./journal-day-modal.types";
import {
  buildDaySummary,
  computeNetRoiPercent,
} from "./journal-day-modal.utils";

interface JournalDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId?: string;
  tradingDate?: string;
}

export function JournalDayModal({
  open,
  onOpenChange,
  accountId,
  tradingDate,
}: JournalDayModalProps) {
  const router = useRouter();

  const goToDayNote = () => {
    if (!accountId || !tradingDate) return;
    onOpenChange(false);
    const params = new URLSearchParams();
    params.set("accountId", accountId);
    params.set("focusDate", tradingDate);
    router.push(`/journal?${params.toString()}`);
  };

  const dayQuery = useJournalDay(accountId, tradingDate, open, {
    includeMessages: false,
  });
  const trades = useMemo(
    () => dayQuery.data?.trades ?? [],
    [dayQuery.data?.trades],
  );
  // Broker account currency for this day — money is shown in the account's own
  // currency. Defaults to USD until the day data loads.
  const currency = dayQuery.data?.account_currency ?? "USD";
  const chipByTradeId = useMemo(
    () =>
      new Map(
        (dayQuery.data?.trade_chips ?? []).map((chip) => [chip.trade_id, chip]),
      ),
    [dayQuery.data?.trade_chips],
  );

  const summary = useMemo(
    () =>
      buildDaySummary(
        trades,
        dayQuery.data?.day_start_balance ?? null,
        dayQuery.data?.day_end_balance ?? null,
      ),
    [trades, dayQuery.data?.day_start_balance, dayQuery.data?.day_end_balance],
  );

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

  const isLoading = dayQuery.isLoading;
  const tradeRows = useMemo<JournalDayTradeRow[]>(
    () =>
      trades.map((trade) => ({
        ...trade,
        net_roi_percent: computeNetRoiPercent(trade),
        journalMessageCount:
          chipByTradeId.get(trade.id)?.journal_message_count ?? 0,
      })),
    [trades, chipByTradeId],
  );

  const openDayJournal = goToDayNote;

  // Trade-level journaling will be rebuilt; for now any trade opens the day note.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openTradeJournal = (tradeId: string) => goToDayNote();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[92vw] max-w-[92vw] flex-col overflow-hidden rounded-3xl border border-border-primary bg-card-bg p-0 sm:max-w-[92vw] lg:max-w-[1180px]">
        <JournalDayModalHeader
          dayTitle={dayTitle}
          summary={summary}
          currency={currency}
        />

        {/* Single scroll region: the whole body (overview + trades) scrolls,
            not just the trades table. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading day details...
            </div>
          ) : (
            <>
              <JournalDayModalOverview
                summary={summary}
                trades={trades}
                currency={currency}
              />
              <JournalDayModalTradesTable
                rows={tradeRows}
                onOpenTradeJournal={openTradeJournal}
                currency={currency}
              />
            </>
          )}
        </div>

        <JournalDayModalFooter
          onClose={() => onOpenChange(false)}
          onOpenDayJournal={openDayJournal}
        />
      </DialogContent>
    </Dialog>
  );
}
