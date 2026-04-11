"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useTradeHistory } from "@/features/journal/hooks/use-trade-history";
import type { JournalTrade } from "@/features/journal/types";
import { JournalTradeHistoryToolbar } from "./journal-trade-history-toolbar";
import { JournalTradeHistoryTable } from "./journal-trade-history-table";
import type { TradeHistoryRow } from "./journal-trade-history.types";

const PAGE_SIZE = 15;

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateParam(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTradeTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function mapTradeRows(items: JournalTrade[]): TradeHistoryRow[] {
  return items.map((item) => {
    const openedAt = new Date(item.opened_at);
    const tradingDate = Number.isNaN(openedAt.getTime())
      ? item.opened_at.slice(0, 10)
      : formatDateParam(openedAt);

    return {
      ...item,
      openedDateLabel: formatTradeTimestamp(item.opened_at),
      closedDateLabel: formatTradeTimestamp(item.closed_at),
      tradingDate,
    };
  });
}

export function JournalTradeHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: accounts = [] } = useJournalAccounts();

  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";
  const queryFromDate = parseDateParam(searchParams.get("fromDate"));
  const queryToDate = parseDateParam(searchParams.get("toDate"));
  const fromDate = queryFromDate
    ? formatDateParam(queryFromDate)
    : formatDateParam(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const toDate = queryToDate
    ? formatDateParam(queryToDate)
    : formatDateParam(new Date());

  const tradeHistoryQuery = useTradeHistory({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  const allRows = useMemo(
    () => mapTradeRows(tradeHistoryQuery.data?.items ?? []),
    [tradeHistoryQuery.data?.items],
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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const onOpenJournal = (row: TradeHistoryRow) => {
    if (!activeAccountId) return;
    router.push(
      `/journal/trade?date=${encodeURIComponent(row.tradingDate)}&tradeId=${encodeURIComponent(row.id)}`,
    );
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
          setPage(1);
        }}
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
          rows={pageRows}
          page={safePage}
          totalPages={totalPages}
          onFirstPage={() => setPage(1)}
          onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
          onNextPage={() =>
            setPage((current) => Math.min(totalPages, current + 1))
          }
          onLastPage={() => setPage(totalPages)}
          onOpenJournal={onOpenJournal}
        />
      )}
    </div>
  );
}
