"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { JournalCalendarWidget } from "@/features/journal/components/journal-calendar-widget";
import { JournalDayModal } from "@/features/journal/components/journal-day-modal";
import type { JournalCalendarDayStat } from "@/features/journal/types";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import { ConnectAccountForm } from "@/features/journal/components/connect-account-form";
import {
  useJournalCalendarAnalytics,
  useJournalInstrumentsAnalytics,
  useJournalSummaryAnalytics,
  useJournalTimePerformanceAnalytics,
} from "@/features/journal/hooks/use-journal-analytics";
import { useJournalDayTrades } from "@/features/journal/hooks/use-journal-day-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiException } from "@/lib/api/types";
import { toast } from "sonner";
import { JournalToolbar } from "@/features/journal/components/journal-toolbar";
import { JournalKpiStrip } from "@/features/journal/components/journal-kpi-strip";
import {
  aggregateDailyOutcomes,
  aggregateTradeOutcomes,
} from "@/features/journal/lib/journal-kpi-aggregates";
import { toTradesPanelRows } from "@/features/journal/lib/journal-widget-mappers";
import { JournalTradesPanel } from "@/features/journal/components/journal-trades-panel";
import { JournalSymbolsWidget } from "@/features/journal/components/journal-symbols-widget";
import { JournalTimePerformanceWidget } from "@/features/journal/components/journal-time-performance-widget";
import { getDefaultJournalWidgetRegistry } from "@/features/journal/lib/widget-registry";
import { useRouter, useSearchParams } from "next/navigation";

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateParam(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function JournalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<number | null>(() =>
    new Date().getDate(),
  );
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isConnectModalOpenManual, setIsConnectModalOpenManual] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const {
    data: accounts = [],
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useJournalAccounts();
  const syncAccountMutation = useSyncJournalAccount();

  const accountIdFromQuery = searchParams.get("accountId");
  const activeAccountId = accountIdFromQuery || accounts[0]?.id || "";
  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );
  const shouldOpenConnect = searchParams.get("connectAccount") === "1";
  const isConnectModalOpen = shouldOpenConnect || isConnectModalOpenManual;

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth],
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const monthStartOffset = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const queryFromDate = parseDateParam(searchParams.get("fromDate"));
  const queryToDate = parseDateParam(searchParams.get("toDate"));
  const hasCustomRange = !!queryFromDate && !!queryToDate;
  const fromDate = hasCustomRange
    ? formatDateParam(queryFromDate)
    : formatDateParam(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
  const toDate = hasCustomRange
    ? formatDateParam(queryToDate)
    : formatDateParam(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));

  const { data: calendarAnalytics } = useJournalCalendarAnalytics({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  const { data: summaryAnalytics } = useJournalSummaryAnalytics({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });
  const { data: instrumentsAnalytics } = useJournalInstrumentsAnalytics({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });
  const { data: timePerformanceAnalytics } = useJournalTimePerformanceAnalytics({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  const visibleCalendar = useMemo(() => {
    const mapped: Record<number, JournalCalendarDayStat> = {};

    for (const day of calendarAnalytics?.days ?? []) {
      const parsedDay = new Date(day.date);
      if (
        Number.isNaN(parsedDay.getTime()) ||
        parsedDay.getMonth() !== currentMonth.getMonth() ||
        parsedDay.getFullYear() !== currentMonth.getFullYear()
      ) {
        continue;
      }
      const dayNumber = parsedDay.getDate();
      if (!dayNumber || Number.isNaN(dayNumber)) continue;

      mapped[dayNumber] = {
        date: dayNumber,
        pnl: day.total_pnl,
        trades: day.trade_count,
        winRate: day.trade_count ? (day.win_count / day.trade_count) * 100 : 0,
        hasJournal: day.trade_count > 0,
      };
    }

    return mapped;
  }, [calendarAnalytics, currentMonth]);

  const effectiveSelectedDay =
    selectedDay && selectedDay <= daysInMonth ? selectedDay : 1;

  const handleMonthShift = (direction: -1 | 1) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
    setSelectedDay(1);
  };

  const selectedTradingDate = formatDateParam(
    new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      effectiveSelectedDay,
    ),
  );

  const handleCalendarDayClick = (day: number) => {
    setSelectedDay(day);
    setIsDayModalOpen(true);
  };

  const dayTradesQuery = useJournalDayTrades(
    activeAccountId || undefined,
    selectedTradingDate,
    !!activeAccountId,
  );

  const handleRefreshAccounts = async () => {
    if (!activeAccountId) {
      await refetchAccounts();
      return;
    }

    try {
      const result = await syncAccountMutation.mutateAsync(activeAccountId);
      await refetchAccounts();
      if (result.inserted_trades === 0) {
        toast.info("No new trades found", {
          description:
            "Sync completed successfully, but there were no new closed trades to ingest.",
        });
      } else {
        toast.success("Account sync complete", {
          description: `Inserted ${result.inserted_trades} trade(s) across ${result.touched_trading_dates} day(s).`,
        });
      }
    } catch (error) {
      await refetchAccounts();
      if (error instanceof ApiException && error.status === 503) {
        toast.error("Sync failed (MetaAPI timeout)", {
          description: error.message,
        });
      } else {
        const description =
          error instanceof ApiException
            ? error.message
            : "Unable to sync this account right now.";
        toast.error("Account sync failed", { description });
      }
    }
  };

  useEffect(() => {
    if (isAccountsError) {
      toast.error("Unable to load accounts right now.");
    }
  }, [isAccountsError]);

  const handleConnectModalChange = (open: boolean) => {
    setIsConnectModalOpenManual(open);
    if (!open && shouldOpenConnect) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("connectAccount");
      router.replace(params.toString() ? `/journal?${params.toString()}` : "/journal");
    }
  };

  const tradeOutcomeCounts = aggregateTradeOutcomes(calendarAnalytics?.days);
  const dailyOutcomeCounts = aggregateDailyOutcomes(calendarAnalytics?.days);
  const tradesRows = toTradesPanelRows(dayTradesQuery.data?.items ?? []);
  const widgetRegistry = getDefaultJournalWidgetRegistry().filter(
    (widget) => widget.visible,
  );

  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalToolbar
        isSyncPending={syncAccountMutation.isPending}
        lastSyncedAt={activeAccount?.last_synced_at}
        onSyncAccount={() => void handleRefreshAccounts()}
        onOpenConnect={() => setIsConnectModalOpenManual(true)}
      />

      {widgetRegistry.some((widget) => widget.id === "kpiStrip") ? (
        <JournalKpiStrip
          summary={summaryAnalytics}
          tradeOutcomeCounts={tradeOutcomeCounts}
          dailyOutcomeCounts={dailyOutcomeCounts}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_31%]">
        {widgetRegistry.some((widget) => widget.id === "calendar") ? (
          <JournalCalendarWidget
            monthLabel={monthLabel}
            daysInMonth={daysInMonth}
            selectedDay={effectiveSelectedDay}
            onSelectDay={handleCalendarDayClick}
            dayStats={visibleCalendar}
            monthStartOffset={monthStartOffset}
            onPrevMonth={() => handleMonthShift(-1)}
            onNextMonth={() => handleMonthShift(1)}
          />
        ) : null}
        {widgetRegistry.some((widget) => widget.id === "tradesPanel") ? (
          <JournalTradesPanel rows={tradesRows} />
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[32%_1fr]">
        {widgetRegistry.some((widget) => widget.id === "symbols") ? (
          <JournalSymbolsWidget instruments={instrumentsAnalytics?.instruments ?? []} />
        ) : null}
        {widgetRegistry.some((widget) => widget.id === "timePerformance") ? (
          <JournalTimePerformanceWidget
            hourly={timePerformanceAnalytics?.hourly ?? []}
            daily={timePerformanceAnalytics?.daily ?? []}
          />
        ) : null}
      </div>

      <Dialog open={isConnectModalOpen} onOpenChange={handleConnectModalChange}>
        <DialogContent className="max-w-xl border border-border-primary bg-card-bg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-text-primary">
              Connect Trading Account
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Add your MT4 or MT5 investor credentials to start syncing trades
              into your journal.
            </DialogDescription>
          </DialogHeader>
          <ConnectAccountForm onSuccess={() => setIsConnectModalOpenManual(false)} />
        </DialogContent>
      </Dialog>

      <JournalDayModal
        open={isDayModalOpen}
        onOpenChange={setIsDayModalOpen}
        accountId={activeAccountId || undefined}
        tradingDate={selectedTradingDate}
      />
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
          <div className="h-12 max-w-2xl animate-pulse rounded-lg bg-bg-tertiary" />
          <div className="h-28 animate-pulse rounded-xl bg-bg-tertiary" />
          <div className="grid gap-4 xl:grid-cols-[1fr_31%]">
            <div className="min-h-[320px] animate-pulse rounded-xl bg-bg-tertiary" />
            <div className="min-h-[200px] animate-pulse rounded-xl bg-bg-tertiary" />
          </div>
        </div>
      }
    >
      <JournalPageContent />
    </Suspense>
  );
}
