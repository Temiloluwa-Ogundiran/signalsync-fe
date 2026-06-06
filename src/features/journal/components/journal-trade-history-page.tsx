"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useInfiniteTradeHistory } from "@/features/journal/hooks/use-infinite-trade-history";
import type { JournalTrade } from "@/features/journal/types";
import { JournalDayModal } from "@/features/journal/components/journal-day-modal";
import { formatTradeTimestamp } from "./journal-day-modal.utils";
import { JournalTradeHistoryToolbar } from "./journal-trade-history-toolbar";
import { JournalTradeHistoryTable } from "./journal-trade-history-table";
import type { TradeHistoryRow } from "./journal-trade-history.types";
import { useDeleteManualTrade } from "@/features/journal/hooks/use-manual-trade";

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateParam(value: string | null) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Inclusive rolling window: `days` calendar days ending today (local). Matches journal dashboard stats. */
function getLastDaysInclusiveRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    fromDate: formatDateParam(from),
    toDate: formatDateParam(to),
  };
}

function mapTradeRows(items: JournalTrade[]): TradeHistoryRow[] {
  return items.map((item) => {
    return {
      ...item,
      openedDateLabel: formatTradeTimestamp(item.opened_at),
      closedDateLabel: formatTradeTimestamp(item.closed_at),
      tradingDate: item.trading_date,
    };
  });
}

export function JournalTradeHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [journalDayTradingDate, setJournalDayTradingDate] = useState<string>();
  const { data: accounts = [] } = useJournalAccounts();

  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";

  const deleteManualTrade = useDeleteManualTrade(activeAccountId);

  const handleDeleteManualTrade = async (tradeId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this manual trade?");
    if (!confirmDelete) return;

    try {
      await deleteManualTrade.mutateAsync(tradeId);
      toast.success("Manual trade deleted successfully");
    } catch (err: unknown) {
      const description =
        err instanceof Error ? err.message : "An error occurred.";
      toast.error("Failed to delete manual trade", {
        description,
      });
    }
  };
  const queryFromDate = parseDateParam(searchParams.get("fromDate"));
  const queryToDate = parseDateParam(searchParams.get("toDate"));
  const hasCustomRange = !!queryFromDate && !!queryToDate;
  const rollingDefaultRange = getLastDaysInclusiveRange(30);
  const fromDate = hasCustomRange
    ? formatDateParam(queryFromDate)
    : rollingDefaultRange.fromDate;
  const toDate = hasCustomRange
    ? formatDateParam(queryToDate)
    : rollingDefaultRange.toDate;

  const tradeHistoryQuery = useInfiniteTradeHistory({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  const allRows = useMemo(
    () =>
      mapTradeRows(
        tradeHistoryQuery.data?.pages.flatMap((page) => page.items) ?? [],
      ),
    [tradeHistoryQuery.data],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allRows;

    return allRows.filter((row) => {
      const side = row.direction.toLowerCase();
      return (
        row.symbol.toLowerCase().includes(query) ||
        side.includes(query) ||
        row.openedDateLabel.toLowerCase().includes(query) ||
        row.closedDateLabel.toLowerCase().includes(query)
      );
    });
  }, [allRows, search]);

  const onOpenJournal = (row: TradeHistoryRow) => {
    if (!activeAccountId) return;
    router.push(
      `/journal/trade?date=${encodeURIComponent(row.tradingDate)}&tradeId=${encodeURIComponent(row.id)}`,
    );
  };

  const handleOpenTodayJournalDay = () => {
    if (!activeAccountId) {
      toast.info("Select an account first", {
        description: "Journal Day requires a specific trading account.",
      });
      return;
    }
    setJournalDayTradingDate(formatDateParam(new Date()));
    setIsDayModalOpen(true);
  };

  if (!activeAccountId) {
    return (
      <div className="p-6 text-sm text-text-secondary">
        Connect an account to view trade history.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalTradeHistoryToolbar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
        }}
        onOpenJournalDay={handleOpenTodayJournalDay}
      />

      <JournalDayModal
        open={isDayModalOpen}
        onOpenChange={setIsDayModalOpen}
        accountId={activeAccountId}
        tradingDate={journalDayTradingDate}
      />

      {tradeHistoryQuery.isLoading ? (
        <div className="flex h-[40vh] items-center justify-center text-sm text-text-secondary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading trade history...
        </div>
      ) : tradeHistoryQuery.isError ? (
        <div className="flex h-[40vh] items-center justify-center text-sm text-danger">
          Failed to load trade history. Please retry.
        </div>
      ) : (
        <JournalTradeHistoryTable
          rows={filteredRows}
          onOpenJournal={onOpenJournal}
          onDeleteManualTrade={handleDeleteManualTrade}
          canLoadMore={tradeHistoryQuery.hasNextPage}
          isLoadingMore={tradeHistoryQuery.isFetchingNextPage}
          onLoadMore={() => void tradeHistoryQuery.fetchNextPage()}
        />
      )}
    </div>
  );
}
