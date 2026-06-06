"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
import { JournalBalanceOverTimeWidget } from "@/features/journal/components/journal-balance-over-time-widget";
import { getDefaultJournalWidgetRegistry } from "@/features/journal/lib/widget-registry";
import { useRouter, useSearchParams } from "next/navigation";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { JournalSyncProgressBanner } from "@/features/journal/components/journal-sync-progress-banner";
import { cn } from "@/lib/utils";

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
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/** Inclusive rolling window: `days` calendar days ending today (local). */
function getLastDaysInclusiveRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    fromDate: formatDateParam(from),
    toDate: formatDateParam(to),
  };
}

type BalanceRangeOption = "1D" | "1W" | "1M" | "1Y" | "All";

function resolveBalanceRangeWindow(range: BalanceRangeOption) {
  const now = new Date();
  const end = formatDateParam(now);
  if (range === "All") {
    return { fromDate: "2000-01-01", toDate: end, granularity: "day" as const };
  }
  if (range === "1D") {
    return { fromDate: end, toDate: end, granularity: "intraday" as const };
  }
  const start = new Date(now);
  if (range === "1W") start.setDate(start.getDate() - 7);
  if (range === "1M") start.setMonth(start.getMonth() - 1);
  if (range === "1Y") start.setFullYear(start.getFullYear() - 1);
  return {
    fromDate: formatDateParam(start),
    toDate: end,
    granularity: "day" as const,
  };
}

function JournalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<number | null>(() =>
    new Date().getDate(),
  );
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [syncUiState, setSyncUiState] = useState<{
    accountId: string;
    startedAt: number;
    baselineLastSyncedAtMs: number | null;
  } | null>(null);
  const hasShownNoAccountToastRef = useRef(false);
  const wasConnectionPendingRef = useRef(false);
  const pollingWindowStartedAtRef = useRef<number | null>(null);
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  // const connectModalOpen = useJournalUiStore((s) => s.connectModalOpen);
  // const setConnectModalOpen = useJournalUiStore((s) => s.setConnectModalOpen);
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

  const showJournalSyncProgress =
    syncAccountMutation.isPending ||
    !!syncUiState ||
    activeAccountConnectionBusy;

  const journalSyncProgressMessage = useMemo(() => {
    if (syncAccountMutation.isPending) return "Contacting server...";
    if (syncUiState) return "Waiting for background sync...";
    if (activeAccount?.connection_state === "bootstrapping") {
      return "Syncing account history for stats...";
    }
    if (activeAccount?.connection_state === "pending_verification") {
      return "Verifying credentials...";
    }
    return "Sync in progress...";
  }, [
    syncAccountMutation.isPending,
    syncUiState,
    activeAccount?.connection_state,
  ]);

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
  const rollingDefaultRange = getLastDaysInclusiveRange(30);
  const fromDate = hasCustomRange
    ? formatDateParam(queryFromDate)
    : rollingDefaultRange.fromDate;
  const toDate = hasCustomRange
    ? formatDateParam(queryToDate)
    : rollingDefaultRange.toDate;

  const dashboardQuery = useJournalDashboardAnalytics({
    accountId:
      activeAccountId && activeAccount?.is_data_ready_for_stats
        ? activeAccountId
        : undefined,
    fromDate,
    toDate,
  });
  const calendarAnalytics = dashboardQuery.data?.calendar;
  const summaryAnalytics = dashboardQuery.data?.summary;
  const instrumentsAnalytics = dashboardQuery.data?.instruments;

  const timePerformanceQuery = useJournalTimePerformanceAnalytics({
    accountId:
      activeAccountId && activeAccount?.is_data_ready_for_stats
        ? activeAccountId
        : undefined,
    fromDate,
    toDate,
    timeBasis,
  });
  const timePerformanceAnalytics = timePerformanceQuery.data;
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

  const handleRefreshAccounts = async (options?: {
    silent?: boolean;
    accountId?: string;
  }) => {
    const silent = options?.silent ?? false;
    const targetAccountId = options?.accountId ?? activeAccountId;
    if (!accounts.length) {
      if (!silent) {
        toast.info("No connected account found", {
          description: "Add an account to get stats and analytics.",
        });
      }
      return;
    }

    if (!targetAccountId) {
      if (!silent) {
        toast.info("Select an account to sync", {
          description:
            "Manual sync runs for a specific account. Choose one from your account filter.",
        });
      }
      await refetchAccounts();
      return;
    }
    const targetAccount = accounts.find(
      (account) => account.id === targetAccountId,
    );
    const baselineLastSyncedAtMs = targetAccount?.last_synced_at
      ? new Date(targetAccount.last_synced_at).getTime()
      : null;
    setSyncUiState({
      accountId: targetAccountId,
      startedAt: Date.now(),
      baselineLastSyncedAtMs:
        baselineLastSyncedAtMs && !Number.isNaN(baselineLastSyncedAtMs)
          ? baselineLastSyncedAtMs
          : null,
    });

    try {
      const result = await syncAccountMutation.mutateAsync(targetAccountId);
      const refreshed = await refetchAccounts();
      const refreshedAccount = (refreshed.data ?? []).find(
        (account) => account.id === targetAccountId,
      );
      const refreshedLastSyncedAtMs = refreshedAccount?.last_synced_at
        ? new Date(refreshedAccount.last_synced_at).getTime()
        : null;
      const didSyncTimestampAdvance =
        !!refreshedLastSyncedAtMs &&
        !Number.isNaN(refreshedLastSyncedAtMs) &&
        (!baselineLastSyncedAtMs ||
          refreshedLastSyncedAtMs > baselineLastSyncedAtMs);
      if ("inserted_trades" in result || didSyncTimestampAdvance) {
        setSyncUiState(null);
      }
      if (!silent) {
        if ("inserted_trades" in result) {
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
        } else {
          toast.info("Sync deferred", {
            description:
              result.message || "Backend deferred this sync attempt. It will retry when allowed.",
          });
        }
      }
    } catch (error) {
      setSyncUiState(null);
      await refetchAccounts();
      if (!silent) {
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
    }
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

  useEffect(() => {
    if (isConnectionPending) {
      if (!pollingWindowStartedAtRef.current) {
        pollingWindowStartedAtRef.current = Date.now();
      }
      return;
    }

    pollingWindowStartedAtRef.current = null;
  }, [isConnectionPending]);

  useEffect(() => {
    const pollingWindowStartedAt = pollingWindowStartedAtRef.current;
    if (!pollingWindowStartedAt || !isConnectionPending) {
      return;
    }

    const elapsedMs = Date.now() - pollingWindowStartedAt;
    if (elapsedMs > 6 * 60 * 1000) {
      pollingWindowStartedAtRef.current = null;
      return;
    }

    const intervalMs = elapsedMs < 90_000 ? 4_000 : 20_000;
    const timer = window.setInterval(() => {
      void refetchAccounts();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isConnectionPending, refetchAccounts]);

  useEffect(() => {
    if (wasConnectionPendingRef.current && !isConnectionPending) {
      void dashboardQuery.refetch();
    }
    wasConnectionPendingRef.current = isConnectionPending;
  }, [dashboardQuery, isConnectionPending]);

  useEffect(() => {
    if (!syncUiState) {
      return;
    }

    const elapsedMs = Date.now() - syncUiState.startedAt;
    const timeoutMs = Math.max(3 * 60_000 - elapsedMs, 0);
    const expiryTimer = window.setTimeout(() => {
      setSyncUiState(null);
    }, timeoutMs);

    const timer = window.setInterval(async () => {
      const refreshed = await refetchAccounts();
      const trackedAccount = (refreshed.data ?? []).find(
        (account) => account.id === syncUiState.accountId,
      );
      if (!trackedAccount) {
        setSyncUiState(null);
        return;
      }

      const trackedLastSyncedAtMs = trackedAccount.last_synced_at
        ? new Date(trackedAccount.last_synced_at).getTime()
        : null;
      const didSyncTimestampAdvance =
        !!trackedLastSyncedAtMs &&
        !Number.isNaN(trackedLastSyncedAtMs) &&
        (!syncUiState.baselineLastSyncedAtMs ||
          trackedLastSyncedAtMs > syncUiState.baselineLastSyncedAtMs);
      const isFailureState =
        trackedAccount.connection_state === "bootstrap_failed" ||
        trackedAccount.connection_state === "verification_failed";

      if (didSyncTimestampAdvance || isFailureState) {
        setSyncUiState(null);
        void dashboardQuery.refetch();
      }
    }, 4_000);

    return () => {
      window.clearTimeout(expiryTimer);
      window.clearInterval(timer);
    };
  }, [dashboardQuery, refetchAccounts, syncUiState]);

  const tradeOutcomeCounts = aggregateTradeOutcomes(calendarAnalytics?.days);
  const dailyOutcomeCounts = aggregateDailyOutcomes(calendarAnalytics?.days);
  const tradesRows = toTradesPanelRows(
    dashboardQuery.data?.recent_trades?.items ?? [],
  );
  const widgetRegistry = getDefaultJournalWidgetRegistry().filter(
    (widget) => widget.visible,
  );
  const showJournalSymbols = widgetRegistry.some(
    (widget) => widget.id === "symbols",
  );
  const showTimePerformance = widgetRegistry.some(
    (widget) => widget.id === "timePerformance",
  );
  const showBalanceHistory = widgetRegistry.some(
    (widget) => widget.id === "balanceHistory",
  );
  const analyticsRowCount =
    Number(showJournalSymbols) +
    Number(showTimePerformance) +
    Number(showBalanceHistory);

  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalSyncProgressBanner
        open={showJournalSyncProgress}
        message={journalSyncProgressMessage}
      />
      <JournalToolbar
        isSyncPending={syncAccountMutation.isPending || !!syncUiState}
        lastSyncedAt={activeAccount?.last_synced_at}
        connectionState={activeAccount?.connection_state}
        connectionError={
          activeAccount?.bootstrap_error_message ||
          activeAccount?.sync_error_message
        }
        onSyncAccount={() => void handleRefreshAccounts()}
        onOpenJournalDay={handleOpenTodayJournalDay}
      />

      {widgetRegistry.some((widget) => widget.id === "kpiStrip") ? (
        <JournalKpiStrip
          summary={summaryAnalytics}
          tradeOutcomeCounts={tradeOutcomeCounts}
          dailyOutcomeCounts={dailyOutcomeCounts}
          isLoading={dashboardQuery.isLoading}
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
            currentMonth={currentMonth}
          />
        ) : null}
        {widgetRegistry.some((widget) => widget.id === "tradesPanel") ? (
          <JournalTradesPanel
            rows={tradesRows}
            isLoading={dashboardQuery.isLoading}
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
