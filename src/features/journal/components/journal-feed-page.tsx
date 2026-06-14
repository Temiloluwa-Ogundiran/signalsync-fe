"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { AppLoader } from "@/components/app-loader";
import { cn } from "@/lib/utils";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import {
  useJournalDashboardAnalytics,
  useJournalIntradayCurves,
} from "@/features/journal/hooks/use-journal-analytics";
import { useJournalUiStore } from "../store/journal-ui-store";
import { JournalPageHeader } from "./journal-page-header";
import { JournalDayCard } from "./journal-day-card";
import type { JournalIntradayCurvePoint } from "../types";

type FeedFilter = "all" | "journaled" | "not-journaled";

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

function getLastDaysInclusiveRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { fromDate: formatDateParam(from), toDate: formatDateParam(to) };
}

export function JournalFeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: accounts = [] } = useJournalAccounts();
  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);

  const queryFrom = parseDateParam(searchParams.get("fromDate"));
  const queryTo = parseDateParam(searchParams.get("toDate"));
  const hasCustomRange = !!queryFrom && !!queryTo;
  const rolling = getLastDaysInclusiveRange(30);
  const fromDate = hasCustomRange ? formatDateParam(queryFrom) : rolling.fromDate;
  const toDate = hasCustomRange ? formatDateParam(queryTo) : rolling.toDate;

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

  const [filter, setFilter] = useState<FeedFilter>("all");

  const dashboardQuery = useJournalDashboardAnalytics({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });
  const curvesQuery = useJournalIntradayCurves({
    accountId: activeAccountId || undefined,
    fromDate,
    toDate,
  });

  // date → intraday curve points (one fetch covers every day).
  const curveByDate = useMemo(() => {
    const map = new Map<string, JournalIntradayCurvePoint[]>();
    for (const d of curvesQuery.data?.days ?? []) map.set(d.date, d.points);
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

  const days = useMemo(() => {
    if (filter === "journaled") return allDays.filter((d) => d.hasNote);
    if (filter === "not-journaled") return allDays.filter((d) => !d.hasNote);
    return allDays;
  }, [allDays, filter]);

  const journaledCount = allDays.filter((d) => d.hasNote).length;

  // Notes are the primary journaling action → open the day-details page (note
  // editor lives there). AI review opens the assistant chat for the day.
  const openDayNote = (date: string) => {
    router.push(`/journal/day?date=${encodeURIComponent(date)}`);
  };
  const openDayReview = (date: string) => {
    router.push(`/dashboard/chat?date=${encodeURIComponent(date)}&context=day`);
  };

  if (!activeAccountId) {
    return (
      <div className="p-6 text-sm text-text-secondary">
        Connect an account to view your journal.
      </div>
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
          activeAccount?.display_name ||
          activeAccount?.broker_login ||
          (accounts.length === 0 ? "Connect Account" : "Select account")
        }
        onSelectAccount={selectAccount}
        dateRange={parsedDateRange}
        onApplyDateRange={applyDateRange}
      />

      {/* Journaled filter chips */}
      <div className="flex items-center gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={allDays.length}
        />
        <FilterChip
          active={filter === "journaled"}
          onClick={() => setFilter("journaled")}
          label="Journaled"
          count={journaledCount}
        />
        <FilterChip
          active={filter === "not-journaled"}
          onClick={() => setFilter("not-journaled")}
          label="Not journaled"
          count={allDays.length - journaledCount}
        />
      </div>

      {dashboardQuery.isLoading ? (
        <AppLoader fullScreen={false} label="Loading journal" />
      ) : dashboardQuery.isError ? (
        <div className="flex h-[40vh] items-center justify-center text-sm text-danger">
          Failed to load journal. Please retry.
        </div>
      ) : days.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center text-sm text-text-secondary">
          {allDays.length === 0
            ? "No trading days in this range."
            : "No days match this filter."}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {days.map((day) => (
            <JournalDayCard
              key={day.date}
              day={day}
              curve={curveByDate.get(day.date) ?? []}
              onReview={openDayReview}
              onNote={openDayNote}
              onOpenDay={openDayNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
        active
          ? "bg-white/[0.08] text-text-primary"
          : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary",
      )}
    >
      {label}
      <span className="tabular-nums text-text-tertiary">{count}</span>
    </button>
  );
}
