"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useManualSyncController } from "@/features/journal/hooks/use-manual-sync-controller";
import {
  formatDateParam,
  parseDateParam,
} from "@/features/journal/lib/date-window";
import type { DateRange } from "react-day-picker";
import { JournalCalendarWidget } from "@/features/journal/components/journal-calendar-widget";
import { JournalDayModal } from "@/features/journal/components/journal-day-modal";
import type { JournalCalendarDayStat } from "@/features/journal/types";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import {
  useJournalDashboardAnalytics,
  useJournalEvaluationAnalytics,
  useJournalTimePerformanceAnalytics,
} from "@/features/journal/hooks/use-journal-analytics";
import { toast } from "sonner";
import { JournalPageHeader } from "@/features/journal/components/journal-page-header";
import { JournalKpiStrip } from "@/features/journal/components/journal-kpi-strip";
import { aggregateTradeOutcomes } from "@/features/journal/lib/journal-kpi-aggregates";
import { toTradesPanelRows } from "@/features/journal/lib/journal-widget-mappers";
import { JournalTradesPanel } from "@/features/journal/components/journal-trades-panel";
import { JournalEvaluationPanel } from "@/features/journal/components/journal-evaluation-panel";
import {
  JournalCumulativePnlChart,
  JournalDailyPnlChart,
} from "@/features/journal/components/journal-pnl-charts";
import {
  JournalInstrumentPnlChart,
  JournalWeekdayPnlChart,
} from "@/features/journal/components/journal-performance-charts";
import { useCurve } from "@/features/journal/hooks/use-curve";
import { getDefaultJournalWidgetRegistry } from "@/features/journal/lib/widget-registry";
import { useRouter, useSearchParams } from "next/navigation";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { JournalSyncProgressBanner } from "@/features/journal/components/journal-sync-progress-banner";
import {
  getAccountSyncStatus,
  isAccountSyncBusy,
} from "@/features/journal/lib/account-sync-status";

const journalWidgetRegistry = getDefaultJournalWidgetRegistry().filter(
  (widget) => widget.visible,
);
const showJournalSymbols = journalWidgetRegistry.some(
  (widget) => widget.id === "symbols",
);
const showTimePerformance = journalWidgetRegistry.some(
  (widget) => widget.id === "timePerformance",
);
const analyticsRowCount =
  Number(showJournalSymbols) + Number(showTimePerformance);
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
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  // Dashboard analytics use close-time buckets (the time-basis toggle was retired).
  const timeBasis = "close" as const;

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useJournalAccounts();
  const syncAccountMutation = useSyncJournalAccount();

  const activeAccount = useMemo(
    () => accounts.find((account) => account.id === activeAccountId),
    [accounts, activeAccountId],
  );
  const isConnectionPending = useMemo(
    () =>
      accounts.some(
        (account) =>
          account.connection_state === "pending_verification" ||
          account.connection_state === "bootstrapping",
      ),
    [accounts],
  );

  const activeAccountConnectionBusy =
    !!activeAccount && isAccountSyncBusy(getAccountSyncStatus(activeAccount));

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
    // No date params → no filter (show ALL trades). Only apply a window when
    // the user picks a custom range.
    const queryFromDate = parseDateParam(fromDateParam);
    const queryToDate = parseDateParam(toDateParam);
    const hasCustomRange = !!queryFromDate && !!queryToDate;
    return {
      fromDate: hasCustomRange ? formatDateParam(queryFromDate) : "",
      toDate: hasCustomRange ? formatDateParam(queryToDate) : "",
    };
  }, [fromDateParam, toDateParam]);

  // Date-range control state for the page header (moved out of the global chrome).
  const parsedDateRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateParam(fromDateParam);
    if (!from) return undefined;
    const to = parseDateParam(toDateParam);
    return to ? { from, to } : { from };
  }, [fromDateParam, toDateParam]);

  const applyDateRange = (nextRange: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!nextRange?.from) {
      params.delete("fromDate");
      params.delete("toDate");
      router.replace(
        params.toString() ? `/dashboard?${params.toString()}` : "/dashboard",
      );
      return;
    }
    params.set("fromDate", formatDateParam(nextRange.from));
    if (nextRange.to) {
      params.set("toDate", formatDateParam(nextRange.to));
    } else {
      params.delete("toDate");
    }
    router.replace(
      params.toString() ? `/dashboard?${params.toString()}` : "/dashboard",
    );
  };

  const selectAccount = (accountId: string) => {
    setActiveAccountId(accountId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("accountId", accountId);
    router.replace(
      params.toString() ? `/dashboard?${params.toString()}` : "/dashboard",
    );
  };

  const scopedAccountId = activeAccountId || undefined;

  const dashboardQuery = useJournalDashboardAnalytics({
    accountId: scopedAccountId,
    fromDate,
    toDate,
  });
  const evaluationQuery = useJournalEvaluationAnalytics({
    accountId: scopedAccountId,
    fromDate,
    toDate,
  });
  // Unified daily curve feeds both P&L charts and the Net-P&L KPI sparkline.
  const dailyCurveQuery = useCurve({
    accountId: scopedAccountId,
    fromDate,
    toDate,
    granularity: "daily",
  });
  const dailyCurvePoints = useMemo(
    () => dailyCurveQuery.data?.daily_curve?.points ?? [],
    [dailyCurveQuery.data],
  );
  const netPnlSeries = useMemo(
    () =>
      dailyCurvePoints
        .filter((p) => !p.is_baseline)
        .map((p, i) => ({ i, v: p.cumulative_pnl })),
    [dailyCurvePoints],
  );
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
    accountId: scopedAccountId,
    fromDate,
    toDate,
    timeBasis,
    enabled: timeBasis !== "close",
  });
  const timePerformanceAnalytics =
    timeBasis === "close" ? dashboardQuery.data?.time_performance : timePerformanceQuery.data;

  const visibleCalendar = useMemo(() => {
    const mapped: Record<number, JournalCalendarDayStat> = {};

    for (const day of calendarAnalytics?.days ?? []) {
      const parsedDay = parseDateParam(day.date);
      if (
        !parsedDay ||
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

  useEffect(() => {
    const aid = searchParams.get("accountId");
    const connectLegacy = searchParams.get("connectAccount");

    if (aid && aid !== activeAccountId) {
      setActiveAccountId(aid);
    }
    if (connectLegacy === "1") {
      useJournalUiStore.getState().openConnectModal();
    }
    if (connectLegacy !== "1") return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("connectAccount");
    router.replace(
      params.toString() ? `/dashboard?${params.toString()}` : "/dashboard",
    );
  }, [activeAccountId, router, searchParams, setActiveAccountId]);

  useEffect(() => {
    if (isAccountsLoading || !accounts.length) {
      return;
    }

    const exists = accounts.some((account) => account.id === activeAccountId);
    if (!activeAccountId || !exists) {
      const nextAccountId = accounts[0].id;
      setActiveAccountId(nextAccountId);

      const params = new URLSearchParams(searchParams.toString());
      if (params.get("accountId")) {
        params.set("accountId", nextAccountId);
        router.replace(
          params.toString() ? `/dashboard?${params.toString()}` : "/dashboard",
        );
      }
    }
  }, [
    activeAccountId,
    accounts,
    isAccountsLoading,
    router,
    searchParams,
    setActiveAccountId,
  ]);

  useEffect(() => {
    if (isAccountsError) {
      toast.error("Unable to load accounts right now.");
    }
  }, [isAccountsError]);


  // Memoize derived props so the React.memo'd chart widgets below don't re-render
  // on every 4s poll tick (Rule S7) — a new array/object identity each render
  // would defeat the memo.
  const tradeOutcomeCounts = useMemo(
    () => aggregateTradeOutcomes(calendarAnalytics?.days),
    [calendarAnalytics?.days],
  );
  const recentTradeItems = dashboardQuery.data?.recent_trades?.items;
  const tradesRows = useMemo(
    () => toTradesPanelRows(recentTradeItems ?? []),
    [recentTradeItems],
  );

  return (
    <div className="min-w-0 space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalSyncProgressBanner
        open={showJournalSyncProgress}
        message={journalSyncProgressMessage}
      />
      <JournalPageHeader
        title="Dashboard"
        isSyncPending={isSyncBusy}
        lastSyncedAt={activeAccount?.last_synced_at}
        nextSyncNotBefore={activeAccount?.next_sync_not_before}
        userSyncRateLimitedUntilMs={userSyncRateLimitedUntilMs}
        connectionState={activeAccount?.connection_state}
        syncStatus={activeAccount?.sync_status}
        onSyncAccount={() => void handleRefreshAccounts()}
        accounts={accounts}
        activeAccountId={activeAccountId}
        activeAccountLabel={
          activeAccount?.display_name ||
          activeAccount?.broker_login ||
          (accounts.length === 0 ? "Connect Account" : "Select account")
        }
        onSelectAccount={selectAccount}
        dateRange={parsedDateRange}
        onApplyDateRange={applyDateRange}
      />

      {showKpiStrip ? (
        <JournalKpiStrip
          summary={summaryAnalytics}
          tradeOutcomeCounts={tradeOutcomeCounts}
          netPnlSeries={netPnlSeries}
          isLoading={dashboardQuery.isLoading}
        />
      ) : null}

      {/* Row 1: calendar + evaluation, equal height */}
      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
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
        <JournalEvaluationPanel
          data={evaluationQuery.data}
          isLoading={evaluationQuery.isLoading}
        />
      </div>

      {/* Row 2: recent trades + the two P&L charts, equal height.
          Recent Trades slightly narrower; the two charts share the rest equally. */}
      <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)]">
        {showTradesPanel ? (
          <JournalTradesPanel
            recentRows={tradesRows}
            isRecentLoading={dashboardQuery.isLoading}
          />
        ) : null}
        <JournalDailyPnlChart
          points={dailyCurvePoints}
          isLoading={dailyCurveQuery.isLoading}
        />
        <JournalCumulativePnlChart
          points={dailyCurvePoints}
          isLoading={dailyCurveQuery.isLoading}
        />
      </div>

      {analyticsRowCount > 0 ? (
        <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2">
          {showJournalSymbols ? (
            <JournalInstrumentPnlChart
              instruments={instrumentsAnalytics?.instruments ?? []}
              isLoading={dashboardQuery.isLoading}
            />
          ) : null}
          {showTimePerformance ? (
            <JournalWeekdayPnlChart
              daily={timePerformanceAnalytics?.daily ?? []}
              isLoading={
                timeBasis === "close"
                  ? dashboardQuery.isLoading
                  : timePerformanceQuery.isLoading
              }
            />
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
        <div className="min-w-0 space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
          <div className="h-12 max-w-2xl animate-pulse rounded-lg bg-bg-tertiary" />
          <div className="h-28 animate-pulse rounded-xl bg-bg-tertiary" />
          <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
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
