"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Activity,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { JournalCalendar } from "@/features/journal/components/journal-calendar";
import { JournalDayModal } from "@/features/journal/components/journal-day-modal";
import type {
  JournalCalendarDayStat,
  JournalMonthHeaderStats,
} from "@/features/journal/types";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import { ConnectAccountForm } from "@/features/journal/components/connect-account-form";
import {
  useJournalCalendarAnalytics,
  useJournalSummaryAnalytics,
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

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- Equity Curve ---
function EquityCurve() {
  const bars = [20, 35, 30, 50, 45, 60, 55, 75, 70, 90, 85, 100];
  return (
    <div className="h-24 flex items-end space-x-1 mt-4 px-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-bg-tertiary rounded-t-sm relative group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            style={{ height: `${h}%` }}
            className={`w-full rounded-t-sm ${i === bars.length - 1 ? "bg-success" : "bg-accent"}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function JournalPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(() =>
    new Date().getDate(),
  );
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useJournalAccounts();
  const syncAccountMutation = useSyncJournalAccount();

  const activeAccountId = selectedAccountId || accounts[0]?.id || "";
  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );

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

  const fromDate = formatDateParam(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
  );
  const toDate = formatDateParam(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
  );

  const { data: calendarAnalytics, isLoading: isCalendarLoading } =
    useJournalCalendarAnalytics({
      accountId: activeAccountId || undefined,
      fromDate,
      toDate,
    });

  const { data: summaryAnalytics, isLoading: isSummaryLoading } =
    useJournalSummaryAnalytics({
      accountId: activeAccountId || undefined,
      fromDate,
      toDate,
    });

  const visibleCalendar = useMemo(() => {
    const mapped: Record<number, JournalCalendarDayStat> = {};

    for (const day of calendarAnalytics?.days ?? []) {
      const dayNumber = Number(day.date.split("-")[2]);
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
  }, [calendarAnalytics]);

  const monthHeaderStats = useMemo<JournalMonthHeaderStats>(() => {
    const totalTrades = summaryAnalytics?.total_trades ?? 0;
    const percent = summaryAnalytics?.net_pnl_percent ?? 0;
    const winRate = summaryAnalytics?.win_rate ?? 0;
    const estimatedWins = Math.round((winRate / 100) * totalTrades);

    return {
      trades: totalTrades,
      wins: estimatedWins,
      profits: summaryAnalytics?.total_net_pnl ?? 0,
      percent,
    };
  }, [summaryAnalytics]);

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

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-2">
            <h1 className="text-2xl font-bold text-text-primary">
              Trading Journal
            </h1>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {isAccountsLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-card-bg px-3 py-2 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading accounts...
                  </div>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-card-bg px-2 py-1.5 shadow-sm">
                      <select
                        value={activeAccountId}
                        onChange={(event) =>
                          setSelectedAccountId(event.target.value)
                        }
                        className="max-w-58 bg-transparent px-2 py-1 text-sm font-medium text-text-primary outline-none"
                        aria-label="Select connected account"
                      >
                        {accounts.length ? (
                          accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.display_name ||
                                `Account ${account.broker_login}`}{" "}
                              - {account.platform}
                            </option>
                          ))
                        ) : (
                          <option value="">No accounts connected</option>
                        )}
                      </select>

                      {accounts.length ? (
                        <button
                          onClick={() => void handleRefreshAccounts()}
                          disabled={syncAccountMutation.isPending}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                          title={
                            syncAccountMutation.isPending
                              ? "Syncing account"
                              : "Sync active account"
                          }
                          aria-label={
                            syncAccountMutation.isPending
                              ? "Syncing account"
                              : "Sync active account"
                          }
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${syncAccountMutation.isPending ? "animate-spin" : ""}`}
                          />
                        </button>
                      ) : null}
                    </div>

                    <button
                      onClick={() => setIsConnectModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      {accounts.length ? "Add Account" : "Connect Account"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {isAccountsError && (
            <p className="mt-2 text-sm text-danger">
              Unable to load accounts right now.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <JournalCalendar
            monthLabel={monthLabel}
            daysInMonth={daysInMonth}
            selectedDay={effectiveSelectedDay}
            onSelectDay={handleCalendarDayClick}
            dayStats={visibleCalendar}
            monthStartOffset={monthStartOffset}
            onPrevMonth={() => handleMonthShift(-1)}
            onNextMonth={() => handleMonthShift(1)}
            headerStats={monthHeaderStats}
            isHeaderStatsLoading={isSummaryLoading || isCalendarLoading}
          />
        </div>

        <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-6 hidden md:block">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center">
              <Activity className="h-4 w-4 mr-2 text-accent" /> Performance
              Curve
            </h3>
            <button className="text-xs font-medium text-text-tertiary hover:text-accent">
              View Full Analytics
            </button>
          </div>
          <EquityCurve />
        </div>
      </div>

      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
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
          <ConnectAccountForm onSuccess={() => setIsConnectModalOpen(false)} />
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
