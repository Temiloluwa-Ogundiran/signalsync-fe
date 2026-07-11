"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLoader } from "@/components/app-loader";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useInfiniteTradeHistory } from "@/features/journal/hooks/use-infinite-trade-history";
import { useUpdateTradeRating } from "@/features/journal/hooks/use-journal-tags";
import type { JournalTrade } from "@/features/journal/types";
import { formatTradeTimestamp } from "./journal-day-modal.utils";
import { JournalTradeTable } from "./journal-trade-table";
import { TradeDetailPanel } from "./trade-detail-panel";
import { ChartLineData01Icon } from "@hugeicons/core-free-icons";
import { JournalPageHeader } from "./journal-page-header";
import { JournalEmptyState } from "./journal-empty-state";
import { useJournalUiStore } from "../store/journal-ui-store";
import type { TradeHistoryRow } from "./journal-trade-history.types";
import { buildAccountLabel } from "../lib/account-label";

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

function mapTradeRows(items: JournalTrade[]): TradeHistoryRow[] {
  return items.map((item) => ({
    ...item,
    openedDateLabel: formatTradeTimestamp(item.opened_at),
    closedDateLabel: formatTradeTimestamp(item.closed_at),
    tradingDate: item.trading_date,
  }));
}

export function JournalTradeHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: accounts = [] } = useJournalAccounts();

  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";

  const updateTradeRating = useUpdateTradeRating(activeAccountId);

  const handleRateTrade = (tradeId: string, rating: number) => {
    updateTradeRating.mutate(
      { tradeId, rating },
      {
        onError: () => toast.error("Couldn't save rating. Please try again."),
      },
    );
  };

  // Shared page-header filter family (account + date range), reused from the
  // dashboard. Sync metadata is hidden here (Trade View has no sync line).
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const openConnectModal = useJournalUiStore((s) => s.openConnectModal);
  const activeAccount = accounts.find((a) => a.id === activeAccountId);

  const queryFromDate = parseDateParam(searchParams.get("fromDate"));
  const queryToDate = parseDateParam(searchParams.get("toDate"));
  const hasCustomRange = !!queryFromDate && !!queryToDate;
  // No default range: fetch ALL trades (paginated). Date is an optional filter
  // the user can apply via the date picker.
  const fromDate = hasCustomRange ? formatDateParam(queryFromDate) : undefined;
  const toDate = hasCustomRange ? formatDateParam(queryToDate) : undefined;
  const [tradeQuery, setTradeQuery] = useQueryState("q", {
    defaultValue: "",
    history: "replace",
    shallow: true,
    clearOnDefault: true,
  });
  const [direction, setDirection] = useQueryState(
    "direction",
    parseAsStringEnum(["all", "buy", "sell"] as const)
      .withDefault("all")
      .withOptions({ history: "replace", shallow: true, clearOnDefault: true }),
  );
  const [outcome, setOutcome] = useQueryState(
    "outcome",
    parseAsStringEnum(["all", "win", "loss"] as const)
      .withDefault("all")
      .withOptions({ history: "replace", shallow: true, clearOnDefault: true }),
  );

  const parsedDateRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateParam(searchParams.get("fromDate"));
    if (!from) return undefined;
    const to = parseDateParam(searchParams.get("toDate"));
    return to ? { from, to } : { from };
  }, [searchParams]);

  const applyDateRange = (next: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!next?.from) {
      params.delete("fromDate");
      params.delete("toDate");
    } else {
      params.set("fromDate", formatDateParam(next.from));
      if (next.to) params.set("toDate", formatDateParam(next.to));
      else params.delete("toDate");
    }
    const q = params.toString();
    router.replace(q ? `/trade-history?${q}` : "/trade-history");
  };

  const selectAccount = (accountId: string) => {
    setActiveAccountId(accountId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("accountId", accountId);
    const q = params.toString();
    router.replace(q ? `/trade-history?${q}` : "/trade-history");
  };

  const tradeHistoryQuery = useInfiniteTradeHistory({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  const rows = useMemo(
    () =>
      mapTradeRows(
        tradeHistoryQuery.data?.pages.flatMap((page) => page.items) ?? [],
      ),
    [tradeHistoryQuery.data],
  );

  // Trade-detail side panel. The open trade can come from two places:
  //   - a row click (local state), or
  //   - a deep-link from the AI copilot: /trade-history?tradeId=<uuid>.
  // Derive the effective id from both so the URL drives the panel without a
  // setState-in-effect. A local click takes precedence over the param.
  const [clickedTradeId, setClickedTradeId] = useState<string | null>(null);
  const deepLinkTradeId = searchParams.get("tradeId");
  const selectedTradeId = clickedTradeId ?? deepLinkTradeId;
  const setSelectedTradeId = setClickedTradeId;

  const selectedTrade = useMemo(
    () => rows.find((r) => r.id === selectedTradeId) ?? null,
    [rows, selectedTradeId],
  );

  // The target trade may live on a later page (history is paginated, recent
  // first). While we have a selection that isn't loaded yet, keep pulling pages
  // until it surfaces or we run out — AI-referenced trades are usually recent,
  // so this converges in a page or two.
  const selectionLoaded = !selectedTradeId || !!selectedTrade;
  useEffect(() => {
    if (
      selectedTradeId &&
      !selectionLoaded &&
      tradeHistoryQuery.hasNextPage &&
      !tradeHistoryQuery.isFetchingNextPage
    ) {
      void tradeHistoryQuery.fetchNextPage();
    }
  }, [
    selectedTradeId,
    selectionLoaded,
    tradeHistoryQuery.hasNextPage,
    tradeHistoryQuery.isFetchingNextPage,
    tradeHistoryQuery,
  ]);

  const closeTradePanel = () => {
    setSelectedTradeId(null);
    // Drop ?tradeId from the URL so a refresh / back doesn't re-open the panel.
    if (searchParams.get("tradeId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tradeId");
      const q = params.toString();
      router.replace(q ? `/trade-history?${q}` : "/trade-history");
    }
  };

  // Journaling lives on the Day Journal feed now — jump there and focus the
  // day's session note via ?focusDate.
  const onOpenJournal = (row: TradeHistoryRow) => {
    if (!activeAccountId) return;
    const params = new URLSearchParams();
    params.set("accountId", activeAccountId);
    params.set("focusDate", row.tradingDate);
    router.push(`/journal?${params.toString()}`);
  };

  if (!activeAccountId) {
    return (
      <JournalEmptyState
        icon={ChartLineData01Icon}
        title="No account connected yet"
        description="Connect a trading account to see your trade history here. Every entry, exit, and lot syncs automatically once an account is linked."
        actionLabel="Connect an account"
        onAction={openConnectModal}
      />
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalPageHeader
        showSyncMeta={false}
        leftContent={
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Trade View
          </h1>
        }
        accounts={accounts}
        activeAccountId={activeAccountId}
        activeAccountLabel={
          activeAccount
            ? buildAccountLabel(activeAccount)
            : accounts.length === 0
              ? "Connect Account"
              : "Select account"
        }
        onSelectAccount={selectAccount}
        dateRange={parsedDateRange}
        onApplyDateRange={applyDateRange}
      />

      {tradeHistoryQuery.isLoading ? (
        <AppLoader label="Loading trades" />
      ) : tradeHistoryQuery.isError ? (
        <div className="flex h-[40vh] items-center justify-center text-sm text-danger">
          Failed to load trade history. Please retry.
        </div>
      ) : (
        <JournalTradeTable
          rows={rows}
          query={tradeQuery}
          direction={direction}
          outcome={outcome}
          onQueryChange={(value) => void setTradeQuery(value)}
          onDirectionChange={(value) => void setDirection(value)}
          onOutcomeChange={(value) => void setOutcome(value)}
          onClearFilters={() => {
            void setTradeQuery(null);
            void setDirection(null);
            void setOutcome(null);
          }}
          onOpenJournal={onOpenJournal}
          onRowClick={(row) => setSelectedTradeId(row.id)}
          onRateTrade={handleRateTrade}
          canLoadMore={tradeHistoryQuery.hasNextPage}
          isLoadingMore={tradeHistoryQuery.isFetchingNextPage}
          onLoadMore={() => void tradeHistoryQuery.fetchNextPage()}
        />
      )}

      {/* Deep-linked trade still loading from a later page. */}
      {selectedTradeId && !selectionLoaded && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border-secondary/60 bg-card-bg px-3 py-1.5 text-xs text-text-secondary shadow-sm">
          Finding trade…
        </div>
      )}

      <TradeDetailPanel
        trade={selectedTrade}
        accountId={activeAccountId || ""}
        open={!!selectedTrade}
        onClose={closeTradePanel}
        // TODO(share): wire to real share flow once the backend share endpoint exists.
        onShare={(t) => console.log("share trade", t.id)}
      />
    </div>
  );
}
