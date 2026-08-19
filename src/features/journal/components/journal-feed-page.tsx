"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { AppLoader } from "@/components/app-loader";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useJournalDashboardAnalytics } from "@/features/journal/hooks/use-journal-analytics";
import { useCurve } from "../hooks/use-curve";
import type { CurveIntradayDay } from "../types";
import { useJournalUiStore } from "../store/journal-ui-store";
import { useAiDockStore } from "@/features/ai/store/ai-dock-store";
import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { JournalPageHeader } from "./journal-page-header";
import { JournalDayCard } from "./journal-day-card";
import { JournalEmptyState } from "./journal-empty-state";
import {
  JournalMonthCalendar,
  type MonthCalendarDay,
} from "./journal-month-calendar";
import {
  JournalPeriodSummary,
  type PeriodSummary,
} from "./journal-period-summary";
import { buildAccountLabel } from "../lib/account-label";
import {
  formatDateParam,
  getCalendarMonthDateRange,
  getCurrentMonthDateRange,
  getDateRangeFromParams,
} from "../lib/date-window";

export function JournalFeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: accounts = [] } = useJournalAccounts();
  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const openConnectModal = useJournalUiStore((s) => s.openConnectModal);
  const openAi = useAiDockStore((s) => s.open);

  const resolvedDateRange = useMemo(
    () => getDateRangeFromParams(
      searchParams.get("fromDate"),
      searchParams.get("toDate"),
    ),
    [searchParams],
  );
  const fromDate = formatDateParam(resolvedDateRange.from);
  const toDate = formatDateParam(resolvedDateRange.to);

  const parsedDateRange: DateRange = resolvedDateRange;

  const applyDateRange = (next: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    const range =
      next?.from && next.to
        ? { from: next.from, to: next.to }
        : getCurrentMonthDateRange();
    params.set("fromDate", formatDateParam(range.from));
    params.set("toDate", formatDateParam(range.to));
    const q = params.toString();
    router.replace(q ? `/journal?${q}` : "/journal");
  };

  const selectAccount = (accountId: string) => {
    setActiveAccountId(accountId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("accountId", accountId);
    const q = params.toString();
    router.replace(q ? `/journal?${q}` : "/journal");
  };

  const dashboardQuery = useJournalDashboardAnalytics({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  // One intraday fetch covers every day's curve + stats → date → day map.
  const curvesQuery = useCurve({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
    granularity: "intraday",
  });
  const dayByDate = useMemo(() => {
    const map = new Map<string, CurveIntradayDay>();
    for (const d of curvesQuery.data?.intraday_curve?.days ?? []) {
      map.set(d.date, d);
    }
    return map;
  }, [curvesQuery.data]);

  // Most recent day first.
  const allDays = useMemo(() => {
    const raw = dashboardQuery.data?.calendar?.days ?? [];
    return [...raw]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((d) => ({
        date: d.date,
        netPnl: d.total_pnl,
        tradeCount: d.trade_count,
        winCount: d.win_count,
        lossCount: d.loss_count,
        hasNote: Boolean(d.has_journal_activity),
      }));
  }, [dashboardQuery.data]);

  const days = allDays;

  // ----- Right rail: month calendar + period summary -----
  // The calendar and period summary follow the same range used by the feed.
  const monthAnchor = resolvedDateRange.to;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const calMonth = monthAnchor.getMonth();
  const calYear = monthAnchor.getFullYear();

  // Days that fall in the displayed calendar month, keyed by day-of-month.
  const calendarStats = (() => {
    const map: Record<number, MonthCalendarDay> = {};
    for (const d of allDays) {
      const [y, m, day] = d.date.split("-").map(Number);
      if (y === calYear && m - 1 === calMonth && d.tradeCount > 0) {
        map[day] = { pnl: d.netPnl, trades: d.tradeCount };
      }
    }
    return map;
  })();

  // Period summary over the displayed month's trading days.
  const periodSummary: PeriodSummary = (() => {
    const monthDays = allDays.filter((d) => {
      const [y, m] = d.date.split("-").map(Number);
      return y === calYear && m - 1 === calMonth && d.tradeCount > 0;
    });
    const netPnl = monthDays.reduce((s, d) => s + d.netPnl, 0);
    const wins = monthDays.reduce((s, d) => s + d.winCount, 0);
    const losses = monthDays.reduce((s, d) => s + d.lossCount, 0);
    const decided = wins + losses;
    const grossWin = monthDays
      .filter((d) => d.netPnl > 0)
      .reduce((s, d) => s + d.netPnl, 0);
    const grossLoss = Math.abs(
      monthDays.filter((d) => d.netPnl < 0).reduce((s, d) => s + d.netPnl, 0),
    );
    return {
      title: `${monthAnchor.toLocaleDateString("en-US", { month: "long" }).toUpperCase()} SO FAR`,
      netPnl,
      winRate: decided ? (wins / decided) * 100 : 0,
      profitFactor: grossLoss ? grossWin / grossLoss : null,
      daysJournaled: monthDays.filter((d) => d.hasNote).length,
      tradingDays: monthDays.length,
    };
  })();

  const shiftMonth = (delta: number) => {
    setSelectedDay(null);
    const nextMonth = new Date(
      monthAnchor.getFullYear(),
      monthAnchor.getMonth() + delta,
      1,
    );
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (nextMonth > currentMonth) return;
    applyDateRange(getCalendarMonthDateRange(nextMonth));
  };

  // Accordion: at most one day card is expanded at a time.
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const setDayExpanded = useCallback((date: string, open: boolean) => {
    setExpandedDate((cur) => (open ? date : cur === date ? null : cur));
  }, []);

  // The day whose card should auto-expand + focus its session note. `nonce`
  // bumps on every request so re-focusing the same day re-triggers the ring.
  const [focus, setFocus] = useState<{ date: string; nonce: number } | null>(
    null,
  );
  // Focus = expand AND scroll to / flash the day's session note. Use ONLY for
  // the explicit "Write" intent, not for plain view/expand.
  const requestFocus = (date: string) => {
    setExpandedDate(date);
    setFocus((prev) => ({ date, nonce: (prev?.nonce ?? 0) + 1 }));
  };

  // Expand a day to view it (calendar-day click) WITHOUT jumping to the note —
  // it just opens the dropdown in place. (Bumping the focus nonce here is what
  // made viewing a day scroll the page down to the note editor.)
  const expandDay = (date: string) => setExpandedDate(date);

  // Deep-link: ?focusDate=YYYY-MM-DD (from trade history / trade form / day modal)
  // expands and focuses that day's note, then strips the param.
  useEffect(() => {
    const target = searchParams.get("focusDate");
    if (!target) return;
    const id = requestAnimationFrame(() => {
      requestFocus(target);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("focusDate");
      const q = params.toString();
      router.replace(q ? `/journal?${q}` : "/journal");
    });
    return () => cancelAnimationFrame(id);
  }, [searchParams, router]);

  const onSelectCalendarDay = (day: number) => {
    setSelectedDay(day);
    // View intent: expand the day's card in place, don't scroll to its note.
    expandDay(formatDateParam(new Date(calYear, calMonth, day)));
  };

  // "Write" expands the day's card and focuses the inline session note.
  const openDayNote = (date: string) => requestFocus(date);
  // "Continue with coach" opens the Partna AI dock in a day-scoped session and
  // drops a seed message so the coach starts reviewing that day right away.
  const openCoach = (date: string) =>
    openAi({
      source: `Day Journal · ${date}`,
      accountId: activeAccountId,
      contextType: "journal_day",
      contextRef: date,
      seedMessage: `Review my trading day on ${date}. Walk me through what happened, what I did well, and where I can improve.`,
    });

  if (!activeAccountId) {
    return (
      <JournalEmptyState
        icon={BookOpen01Icon}
        title="No account connected yet"
        description="Connect a trading account to start journaling your days. Your trades sync automatically so Partna AI can read your behavior and coach you."
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
          <h1 className="text-xl font-semibold text-text-primary">
            Day Journal
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

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: day feed */}
        <div className="min-w-0 flex-1 space-y-4">
          {dashboardQuery.isLoading ? (
            <AppLoader label="Loading journal" />
          ) : dashboardQuery.isError ? (
            <div
              role="alert"
              className="flex h-[40vh] flex-col items-center justify-center gap-3 text-center text-sm text-danger"
            >
              <p>Failed to load journal.</p>
              <button
                type="button"
                onClick={() => void dashboardQuery.refetch()}
                className="rounded-md border border-danger/30 px-3 py-2 font-semibold text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                Try again
              </button>
            </div>
          ) : days.length === 0 ? (
            <div className="flex h-[40vh] items-center justify-center text-sm text-text-secondary">
              No trading days in this range.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {days.map((day) => (
                <JournalDayCard
                  key={day.date}
                  date={day.date}
                  accountId={activeAccountId}
                  focusNoteNonce={focus?.date === day.date ? focus.nonce : null}
                  expanded={expandedDate === day.date}
                  onExpandedChange={(open) => setDayExpanded(day.date, open)}
                  day={dayByDate.get(day.date)}
                  netPnl={day.netPnl}
                  tradeCount={day.tradeCount}
                  winCount={day.winCount}
                  lossCount={day.lossCount}
                  hasNote={day.hasNote}
                  onNote={openDayNote}
                  onContinueCoach={openCoach}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right rail: calendar + period summary */}
        <aside className="w-full shrink-0 space-y-5 lg:w-[340px]">
          <JournalMonthCalendar
            monthDate={monthAnchor}
            dayStats={calendarStats}
            selectedDay={selectedDay}
            onSelectDay={onSelectCalendarDay}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
          />
          <JournalPeriodSummary summary={periodSummary} />
        </aside>
      </div>
    </div>
  );
}
