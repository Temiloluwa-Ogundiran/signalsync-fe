"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useJournalDay } from "../hooks/use-journal-day-modal";
import { useDeleteManualTrade } from "../hooks/use-manual-trade";
import { toast } from "sonner";
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

  const deleteManualTrade = useDeleteManualTrade(accountId || "");

  const handleDeleteManualTrade = async (tradeId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this manual trade?");
    if (!confirmDelete) return;

    try {
      await deleteManualTrade.mutateAsync(tradeId);
      toast.success("Manual trade deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete manual trade", {
        description: err?.message || "An error occurred.",
      });
    }
  };

  const dayQuery = useJournalDay(accountId, tradingDate, open, {
    includeMessages: false,
  });
  const trades = useMemo(
    () => dayQuery.data?.trades ?? [],
    [dayQuery.data?.trades],
  );
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

  const openDayJournal = () => {
    if (!accountId || !tradingDate) return;
    onOpenChange(false);
    router.push(
      `/journal/chat?date=${encodeURIComponent(tradingDate)}&context=day`,
    );
  };

  const openTradeJournal = (tradeId: string) => {
    if (!accountId || !tradingDate) return;
    onOpenChange(false);
    router.push(
      `/journal/trade?date=${encodeURIComponent(tradingDate)}&tradeId=${encodeURIComponent(tradeId)}&from=day&context=day`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-[95vw] sm:max-w-[95vw] lg:max-w-[1500px] overflow-hidden rounded-3xl border border-border-primary bg-card-bg p-0">
        <JournalDayModalHeader dayTitle={dayTitle} summary={summary} />

        <div className="flex h-[calc(90vh-188px)] min-h-0 flex-col overflow-hidden px-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading day details...
            </div>
          ) : (
            <>
              <JournalDayModalOverview summary={summary} trades={trades} />
              <JournalDayModalTradesTable
                rows={tradeRows}
                onOpenTradeJournal={openTradeJournal}
                onDeleteManualTrade={handleDeleteManualTrade}
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
