"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useManualSyncController } from "@/features/journal/hooks/use-manual-sync-controller";
import {
  formatDateParam,
  getLastDaysInclusiveRange,
  parseDateParam,
  resolveBalanceRangeWindow,
  type BalanceRangeOption,
} from "@/features/journal/lib/date-window";
import { JournalCalendarWidget } from "@/features/journal/components/journal-calendar-widget";
import { JournalDayModal } from "@/features/journal/components/journal-day-modal";
import type { JournalCalendarDayStat } from "@/features/journal/types";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import {
  useJournalDashboardAnalytics,
  useJournalBalanceHistoryAnalytics,
  useJournalTimePerformanceAnalytics,
} from "@/features/journal/hooks/use-journal-analytics";
import { toast } from "sonner";
import { JournalToolbar } from "@/features/journal/components/journal-toolbar";
import { JournalKpiStrip } from "@/features/journal/components/journal-kpi-strip";
import {
  aggregateDailyOutcomes,
  aggregateTradeOutcomes,
} from "@/features/journal/lib/journal-kpi-aggregates";
import {
  toOpenPositionsPanelRows,
  toTradesPanelRows,
} from "@/features/journal/lib/journal-widget-mappers";
import { JournalTradesPanel } from "@/features/journal/components/journal-trades-panel";
import { JournalSymbolsWidget } from "@/features/journal/components/journal-symbols-widget";
import { JournalTimePerformanceWidget } from "@/features/journal/components/journal-time-performance-widget";
import { JournalBalanceOverTimeWidget } from "@/features/journal/components/journal-balance-over-time-widget";
import { getDefaultJournalWidgetRegistry } from "@/features/journal/lib/widget-registry";
import { useRouter, useSearchParams } from "next/navigation";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { JournalSyncProgressBanner } from "@/features/journal/components/journal-sync-progress-banner";
import { cn } from "@/lib/utils";
import { useJournalOpenPositions } from "@/features/journal/hooks/use-journal-open-positions";

const journalWidgetRegistry = getDefaultJournalWidgetRegistry().filter(
  (widget) => widget.visible,
);
const showJournalSymbols = journalWidgetRegistry.some(
  (widget) => widget.id === "symbols",
);
const showTimePerformance = journalWidgetRegistry.some(
  (widget) => widget.id === "timePerformance",
);
const showBalanceHistory = journalWidgetRegistry.some(
  (widget) => widget.id === "balanceHistory",
);
const analyticsRowCount =
  Number(showJournalSymbols) +
  Number(showTimePerformance) +
  Number(showBalanceHistory);
const showKpiStrip = journalWidgetRegistry.some(
  (widget) => widget.id === "kpiStrip",
);
const showCalendarWidget = journalWidgetRegistry.some(
  (widget) => widget.id === "calendar",
);
const showTradesPanel = journalWidgetRegistry.some(
  (widget) => widget.id === "tradesPanel",
);

function JournalPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<number | null>(() =>
    new Date().getDate(),
  );
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const hasShownNoAccountToastRef = useRef(false);
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [balanceRange, setBalanceRange] = useState<BalanceRangeOption>("1M");
  const [timeBasis, setTimeBasis] = useState<"open" | "close">("close");

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    isFetched: isAccountsFetched,
    refetch: refetchAccounts,
  } = useJournalAccounts();
  const syncAccountMutation = useSyncJournalAccount();

  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );
  const isConnectionPending = accounts.some(
    (account) =>
      account.connection_state === "pending_verification" ||
      account.connection_state === "bootstrapping",
  );

  const activeAccountConnectionBusy =
    activeAccount?.connection_state === "bootstrapping" ||
    activeAccount?.connection_state === "pending_verification";

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth],
  );

  const daysInMonth = useMemo(
    () =>
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      ).getDate(),
    [currentMonth],
  );
  const monthStartOffset = useMemo(
    () =>
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      ).getDay(),
    [currentMonth],
  );

  const fromDateParam = searchParams.get("fromDate");
  const toDateParam = searchParams.get("toDate");
  const { fromDate, toDate } = useMemo(() => {
    const queryFromDate = parseDateParam(fromDateParam);
    const queryToDate = parseDateParam(toDateParam);
    const hasCustomRange = !!queryFromDate && !!queryToDate;
    const rollingDefaultRange = getLastDaysInclusiveRange(30);
    return {
      fromDate: hasCustomRange
        ? formatDateParam(queryFromDate)
        : rollingDefaultRange.fromDate,
      toDate: hasCustomRange
        ? formatDateParam(queryToDate)
        : rollingDefaultRange.toDate,
    };
  }, [fromDateParam, toDateParam]);

  const readyAccountId =
    activeAccountId && activeAccount?.is_data_ready_for_stats
      ? activeAccountId
      : undefined;

  const dashboardQuery = useJournalDashboardAnalytics({
    accountId: readyAccountId,
    fromDate,
    toDate,
  });
  // `refetch` is referentially stable in TanStack Query v5; depending on the
  // whole `dashboardQuery` object (new identity every render) would tear down and
  // recreate the polling interval/timeout effects on every render (incl. each 4s
  // poll tick) — see P1-7.
  const refetchDashboard = dashboardQuery.refetch;

  const {
    handleRefreshAccounts,
    isSyncBusy,
    showJournalSyncProgress,
    journalSyncProgressMessage,
    userSyncRateLimitedUntilMs,
  } = useManualSyncController({
    accounts,
    activeAccountId,
    activeAccount,
    isConnectionPending,
    activeAccountConnectionBusy,
    syncAccountMutation,
    refetchAccounts,
    refetchDashboard,
    queryClient,
  });

  const calendarAnalytics = dashboardQuery.data?.calendar;
  const summaryAnalytics = dashboardQuery.data?.summary;
  const instrumentsAnalytics = dashboardQuery.data?.instruments;

  const timePerformanceQuery = useJournalTimePerformanceAnalytics({
    accountId: readyAccountId,
    fromDate,
    toDate,
    timeBasis,
    enabled: timeBasis !== "close",
  });
  const timePerformanceAnalytics =
    timeBasis === "close" ? dashboardQuery.data?.time_performance : timePerformanceQuery.data;
  const balanceRangeWindow = useMemo(
    () => resolveBalanceRangeWindow(balanceRange),
    [balanceRange],
  );
  const balanceHistoryQuery = useJournalBalanceHistoryAnalytics({
    accountId:
      activeAccountId && activeAccount?.is_data_ready_for_stats
        ? activeAccountId
        : undefined,
    fromDate: balanceRangeWindow.fromDate,
    toDate: balanceRangeWindow.toDate,
    granularity: balanceRangeWindow.granularity,
  });
  const openPositionsQuery = useJournalOpenPositions({
    accountId: activeAccountId || undefined,
    limit: 10,
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
        hasJournalActivity: Boolean(day.has_journal_activity),
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
    if (!activeAccountId) {
      toast.info("Select an account first", {
        description: "Daily journal requires a specific trading account.",
      });
      return;
    }
    setSelectedDay(day);
    setIsDayModalOpen(true);
  };

  const handleOpenTodayJournalDay = () => {
    if (!activeAccountId) {
      toast.info("Select an account first", {
        description: "Journal Day requires a specific trading account.",
      });
      return;
    }
    const today = new Date();
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(todayMonth);
    setSelectedDay(today.getDate());
    setIsDayModalOpen(true);
  };

  useEffect(() => {
    const aid = searchParams.get("accountId");
    const connectLegacy = searchParams.get("connectAccount");
    if (!aid && connectLegacy !== "1") return;

    if (aid) {
      setActiveAccountId(aid);
    }
    if (connectLegacy === "1") {
      useJournalUiStore.getState().openConnectModal();
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("accountId");
    params.delete("connectAccount");
    router.replace(
      params.toString() ? `/journal?${params.toString()}` : "/journal",
    );
  }, [router, searchParams, setActiveAccountId]);

  useEffect(() => {
    if (isAccountsLoading || !accounts.length) {
      return;
    }

    const exists = accounts.some((account) => account.id === activeAccountId);
    if (!activeAccountId || !exists) {
      setActiveAccountId(accounts[0].id);
    }
  }, [activeAccountId, accounts, isAccountsLoading, setActiveAccountId]);

  useEffect(() => {
    if (isAccountsError) {
      toast.error("Unable to load accounts right now.");
    }
  }, [isAccountsError]);

  useEffect(() => {
    if (
      isAccountsFetched &&
      !isAccountsLoading &&
      !isAccountsError &&
      accounts.length === 0 &&
      !hasShownNoAccountToastRef.current
    ) {
      toast.info("No connected account found", {
        description: "Add an account to get stats and analytics.",
      });
      hasShownNoAccountToastRef.current = true;
      return;
    }

    if (accounts.length > 0) {
      hasShownNoAccountToastRef.current = false;
    }
  }, [accounts.length, isAccountsError, isAccountsFetched, isAccountsLoading]);

  // Memoize derived props so the React.memo'd chart widgets below don't re-render
  // on every 4s poll tick (Rule S7) — a new array/object identity each render
  // would defeat the memo.
  const tradeOutcomeCounts = useMemo(
    () => aggregateTradeOutcomes(calendarAnalytics?.days),
    [calendarAnalytics?.days],
  );
  const dailyOutcomeCounts = useMemo(
    () => aggregateDailyOutcomes(calendarAnalytics?.days),
    [calendarAnalytics?.days],
  );
  const recentTradeItems = dashboardQuery.data?.recent_trades?.items;
  const tradesRows = useMemo(
    () => toTradesPanelRows(recentTradeItems ?? []),
    [recentTradeItems],
  );
  const openPositionItems = openPositionsQuery.data?.items;
  const openPositionRows = useMemo(
    () => toOpenPositionsPanelRows(openPositionItems ?? []),
    [openPositionItems],
  );

  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalSyncProgressBanner
        open={showJournalSyncProgress}
        message={journalSyncProgressMessage}
      />
      <JournalToolbar
        isSyncPending={isSyncBusy}
        lastSyncedAt={activeAccount?.last_synced_at}
        nextSyncNotBefore={activeAccount?.next_sync_not_before}
        userSyncRateLimitedUntilMs={userSyncRateLimitedUntilMs}
        connectionState={activeAccount?.connection_state}
        onSyncAccount={() => void handleRefreshAccounts()}
        onOpenJournalDay={handleOpenTodayJournalDay}
      />

      {showKpiStrip ? (
        <JournalKpiStrip
          summary={summaryAnalytics}
          tradeOutcomeCounts={tradeOutcomeCounts}
          dailyOutcomeCounts={dailyOutcomeCounts}
          isLoading={dashboardQuery.isLoading}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_31%]">
        {showCalendarWidget ? (
          <JournalCalendarWidget
            monthLabel={monthLabel}
            daysInMonth={daysInMonth}
            selectedDay={effectiveSelectedDay}
            onSelectDay={handleCalendarDayClick}
            dayStats={visibleCalendar}
            monthStartOffset={monthStartOffset}
            onPrevMonth={() => handleMonthShift(-1)}
            onNextMonth={() => handleMonthShift(1)}
            currentMonth={currentMonth}
          />
        ) : null}
        {showTradesPanel ? (
          <JournalTradesPanel
            recentRows={tradesRows}
            openRows={openPositionRows}
            isRecentLoading={dashboardQuery.isLoading}
            isOpenLoading={openPositionsQuery.isLoading}
            openErrorMessage={
              openPositionsQuery.isError
                ? "Unable to load live open positions right now."
                : null
            }
          />
        ) : null}
      </div>

      {analyticsRowCount > 0 ? (
        <div
          className={cn(
            "grid min-w-0 gap-3 xl:items-stretch",
            analyticsRowCount === 1 && "xl:grid-cols-1",
            analyticsRowCount === 2 && "xl:grid-cols-2",
            analyticsRowCount >= 3 && "xl:grid-cols-3",
          )}
        >
          {showJournalSymbols ? (
            <div className="min-h-0 min-w-0 order-3 xl:order-none">
              <JournalSymbolsWidget
                compact
                instruments={instrumentsAnalytics?.instruments ?? []}
              />
            </div>
          ) : null}
          {showTimePerformance ? (
            <div className="min-h-0 min-w-0 order-2 xl:order-none">
              {timePerformanceQuery.isLoading ? (
                <div className="h-[396px] animate-pulse rounded-xl bg-kpi-card-bg border border-border-primary/60 flex flex-col justify-between p-4" aria-hidden>
                  <div className="h-6 w-1/3 bg-bg-tertiary rounded" />
                  <div className="h-64 bg-bg-tertiary rounded w-full" />
                </div>
              ) : (
                <JournalTimePerformanceWidget
                  compact
                  hourly={timePerformanceAnalytics?.hourly ?? []}
                  daily={timePerformanceAnalytics?.daily ?? []}
                  timeBasis={timeBasis}
                  onTimeBasisChange={setTimeBasis}
                />
              )}
            </div>
          ) : null}
          {showBalanceHistory ? (
            <div className="min-h-0 min-w-0 order-1 xl:order-none">
              <JournalBalanceOverTimeWidget
                compact
                points={balanceHistoryQuery.data?.points ?? []}
                isLoading={balanceHistoryQuery.isLoading}
                selectedRange={balanceRange}
                onRangeChange={setBalanceRange}
              />
            </div>
          ) : null}
        </div>
      ) : null}

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
