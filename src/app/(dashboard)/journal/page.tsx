"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { JournalCalendarWidget } from "@/features/journal/components/journal-calendar-widget";
import { JournalDayModal } from "@/features/journal/components/journal-day-modal";
import type { JournalCalendarDayStat } from "@/features/journal/types";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import { ConnectAccountForm } from "@/features/journal/components/connect-account-form";
import {
  useJournalDashboardAnalytics,
} from "@/features/journal/hooks/use-journal-analytics";
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
  const [pollingWindowStartedAt, setPollingWindowStartedAt] = useState<number | null>(null);
  const hasShownNoAccountToastRef = useRef(false);
  const wasConnectionPendingRef = useRef(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    isFetched: isAccountsFetched,
    refetch: refetchAccounts,
  } = useJournalAccounts();
  const syncAccountMutation = useSyncJournalAccount();

  const accountIdFromQuery = searchParams.get("accountId");
  const isAllAccountsSelected = !accountIdFromQuery || accountIdFromQuery === "all";
  const activeAccountId = isAllAccountsSelected ? "" : accountIdFromQuery;
  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );
  const isConnectionPending = accounts.some(
    (account) =>
      account.connection_state === "pending_verification" ||
      account.connection_state === "bootstrapping",
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

  const dashboardQuery = useJournalDashboardAnalytics({
    accountId:
      activeAccountId && activeAccount?.is_data_ready_for_stats ? activeAccountId : undefined,
    fromDate,
    toDate,
  });
  const calendarAnalytics = dashboardQuery.data?.calendar;
  const summaryAnalytics = dashboardQuery.data?.summary;
  const instrumentsAnalytics = dashboardQuery.data?.instruments;
  const timePerformanceAnalytics = dashboardQuery.data?.time_performance;

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

  const handleOpenTodayJournalDay = () => {
    const today = new Date();
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(todayMonth);
    setSelectedDay(today.getDate());
    setIsDayModalOpen(true);
  };

  const handleRefreshAccounts = async () => {
    if (!accounts.length) {
      toast.info("No connected account found", {
        description: "Add an account to get stats and analytics.",
      });
      return;
    }

    if (!activeAccountId) {
      toast.info("Select an account to sync", {
        description: "Manual sync runs for a specific account. Choose one from your account filter.",
      });
      await refetchAccounts();
      return;
    }

    try {
      const result = await syncAccountMutation.mutateAsync(activeAccountId);
      await refetchAccounts();
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
        toast.info("Sync queued", {
          description: "Account sync is running in background. Data will refresh shortly.",
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
    if (!activeAccountId || isAccountsLoading) {
      return;
    }
    const exists = accounts.some((account) => account.id === activeAccountId);
    if (!exists) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("accountId");
      router.replace(params.toString() ? `/journal?${params.toString()}` : "/journal");
    }
  }, [activeAccountId, accounts, isAccountsLoading, router, searchParams]);

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
    if (isConnectionPending && !pollingWindowStartedAt) {
      setPollingWindowStartedAt(Date.now());
    }

    if (!isConnectionPending && pollingWindowStartedAt) {
      setPollingWindowStartedAt(null);
    }
  }, [isConnectionPending, pollingWindowStartedAt]);

  useEffect(() => {
    if (!pollingWindowStartedAt || !isConnectionPending) {
      return;
    }

    const elapsedMs = Date.now() - pollingWindowStartedAt;
    if (elapsedMs > 6 * 60 * 1000) {
      setPollingWindowStartedAt(null);
      return;
    }

    const intervalMs = elapsedMs < 90_000 ? 4_000 : 20_000;
    const timer = window.setInterval(() => {
      void refetchAccounts();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isConnectionPending, pollingWindowStartedAt, refetchAccounts]);

  useEffect(() => {
    if (wasConnectionPendingRef.current && !isConnectionPending) {
      void dashboardQuery.refetch();
    }
    wasConnectionPendingRef.current = isConnectionPending;
  }, [dashboardQuery, isConnectionPending]);

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
  const tradesRows = toTradesPanelRows(dashboardQuery.data?.recent_trades?.items ?? []);
  const widgetRegistry = getDefaultJournalWidgetRegistry().filter(
    (widget) => widget.visible,
  );

  return (
    <div className="space-y-4 p-4 pb-20 font-sans md:p-8 md:pb-8">
      <JournalToolbar
        isSyncPending={syncAccountMutation.isPending}
        lastSyncedAt={activeAccount?.last_synced_at}
        connectionState={activeAccount?.connection_state}
        connectionError={
          activeAccount?.bootstrap_error_message || activeAccount?.sync_error_message
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
          />
        ) : null}
        {widgetRegistry.some((widget) => widget.id === "tradesPanel") ? (
          <JournalTradesPanel
            rows={tradesRows}
            isLoading={dashboardQuery.isLoading}
          />
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
              Add your MT5 investor credentials to start syncing trades
              into your journal.
            </DialogDescription>
          </DialogHeader>
          <ConnectAccountForm
            onSuccess={() => {
              setIsConnectModalOpenManual(false);
              setPollingWindowStartedAt(Date.now());
            }}
          />
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
