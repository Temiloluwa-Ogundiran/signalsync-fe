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
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getLastDaysInclusiveRange(days: number, anchor?: Date) {
  // Window of `days` ending at `anchor` (default today). Anchoring lets the
  // default view follow an account's most recent activity, not just "now".
  const to = anchor ? new Date(anchor) : new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { fromDate: formatDateParam(from), toDate: formatDateParam(to) };
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

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

  // Once the user pages the calendar, this holds their chosen month; the fetch
  // window and calendar then follow it. Until then both follow the default
  // (last 30 days anchored to the account's latest activity).
  const [pickedMonth, setPickedMonth] = useState<Date | null>(null);

  const queryFrom = parseDateParam(searchParams.get("fromDate"));
  const queryTo = parseDateParam(searchParams.get("toDate"));
  const hasCustomRange = !!queryFrom && !!queryTo;
  // Default view: last 30 days. Anchored to the account's most recent activity
  // (last_synced_at) rather than "today", so accounts whose latest trades aren't
  // in the current month (e.g. seeded demo data) still open on a populated range.
  const anchorTo = activeAccount?.last_synced_at
    ? new Date(activeAccount.last_synced_at)
    : undefined;
  const rolling = getLastDaysInclusiveRange(30, anchorTo);
  const fromDate = hasCustomRange
    ? formatDateParam(queryFrom)
    : pickedMonth
      ? formatDateParam(startOfMonth(pickedMonth))
      : rolling.fromDate;
  const toDate = hasCustomRange
    ? formatDateParam(queryTo)
    : pickedMonth
      ? formatDateParam(endOfMonth(pickedMonth))
      : rolling.toDate;

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
  // The calendar follows the picked month; before any navigation it follows the
  // fetch window's end (anchored to the account's latest activity), so the
  // calendar/summary match the feed even when the account loads after render.
  const monthAnchor = pickedMonth ?? parseDateParam(toDate) ?? new Date();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const calMonth = monthAnchor.getMonth();
  const calYear = monthAnchor.getFullYear();

  // Days that fall in the displayed calendar month, keyed by day-of-month.
  const calendarStats = useMemo(() => {
    const map: Record<number, MonthCalendarDay> = {};
    for (const d of allDays) {
      const [y, m, day] = d.date.split("-").map(Number);
      if (y === calYear && m - 1 === calMonth && d.tradeCount > 0) {
        map[day] = { pnl: d.netPnl, trades: d.tradeCount };
      }
    }
    return map;
  }, [allDays, calYear, calMonth]);

  // Period summary over the displayed month's trading days.
  const periodSummary = useMemo<PeriodSummary>(() => {
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
  }, [allDays, calYear, calMonth, monthAnchor]);

  const shiftMonth = (delta: number) => {
    setSelectedDay(null);
    setPickedMonth(
      new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + delta, 1),
    );
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
  const requestFocus = (date: string) => {
    setExpandedDate(date);
    setFocus((prev) => ({ date, nonce: (prev?.nonce ?? 0) + 1 }));
  };

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
    requestFocus(formatDateParam(new Date(calYear, calMonth, day)));
  };

  // "Write" expands the day's card and focuses the inline session note.
  const openDayNote = (date: string) => requestFocus(date);
  // "Continue with coach" opens the Partna AI dock scoped to this day.
  const openCoach = (date: string) =>
    openAi({ source: `Day Journal · ${date}`, accountId: activeAccountId });

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
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
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
            <div className="flex h-[40vh] items-center justify-center text-sm text-danger">
              Failed to load journal. Please retry.
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
