"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import type { DateRange } from "react-day-picker";
import {
  format,
  endOfMonth,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/icons/syncgram-nav-icons";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface JournalPageHeaderProps {
  isSyncPending: boolean;
  lastSyncedAt?: string | null;
  nextSyncNotBefore?: string | null;
  userSyncRateLimitedUntilMs?: number | null;
  connectionState?: string;
  onSyncAccount: () => void;
  /** Date-range control (moved out of the global chrome into page-view controls). */
  dateRange: DateRange | undefined;
  dateRangeLabel: string;
  onApplyDateRange: (range: DateRange | undefined) => void;
}

function getLastSyncDate(lastSyncedAt?: string | null) {
  if (!lastSyncedAt) return null;
  const syncedAtMs = new Date(lastSyncedAt).getTime();
  if (Number.isNaN(syncedAtMs)) return null;
  // Absolute timestamp, e.g. "Mar 27, 2026 08:41 AM"
  return new Date(syncedAtMs).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getCountdownText(targetMs: number) {
  const remainingMs = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

/**
 * ROW 2 of the dashboard header zone — the page header.
 *
 * Left: small muted sync metadata ("Last sync: … · Resync").
 * Right: page-view controls (date range + currency/return-% unit toggle),
 * visually distinct from ROW 1's global chrome.
 *
 * Replaces the old standalone full-width JournalToolbar sync row.
 */
export function JournalPageHeader({
  isSyncPending,
  lastSyncedAt,
  nextSyncNotBefore,
  userSyncRateLimitedUntilMs,
  connectionState,
  onSyncAccount,
  dateRange,
  dateRangeLabel,
  onApplyDateRange,
}: JournalPageHeaderProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  const nextSyncNotBeforeMs = nextSyncNotBefore
    ? new Date(nextSyncNotBefore).getTime()
    : null;
  const activeUserRateLimitUntilMs =
    userSyncRateLimitedUntilMs && userSyncRateLimitedUntilMs > nowMs
      ? userSyncRateLimitedUntilMs
      : null;
  const activeAccountCooldownUntilMs =
    nextSyncNotBeforeMs &&
    !Number.isNaN(nextSyncNotBeforeMs) &&
    nextSyncNotBeforeMs > nowMs
      ? nextSyncNotBeforeMs
      : null;
  const isUserRateLimited = !!activeUserRateLimitUntilMs;
  const cooldownUntilMs =
    activeUserRateLimitUntilMs ?? activeAccountCooldownUntilMs;
  const isCooldownActive = !!cooldownUntilMs;
  const syncCooldownLabel = isUserRateLimited
    ? `Manual sync limit reached. Retry in ${getCountdownText(cooldownUntilMs as number)}.`
    : isCooldownActive
      ? `Manual sync cooldown active. Retry in ${getCountdownText(cooldownUntilMs as number)}.`
      : null;

  useEffect(() => {
    const intervalMs =
      lastSyncedAt || isCooldownActive || isSyncPending ? 1_000 : 60_000;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isCooldownActive, isSyncPending, lastSyncedAt]);

  const stateLabelMap: Record<string, string> = {
    pending_verification: "Verifying credentials...",
    bootstrapping: "Syncing account history for stats...",
    ready: "Ready",
    verification_failed: "Needs attention",
    bootstrap_failed: "Connected with sync warning",
  };
  const connectionLabel = (() => {
    if (!connectionState || connectionState === "ready") return null;
    // If an account already synced before, don't regress UX to "verifying credentials".
    if (connectionState === "pending_verification" && !!lastSyncedAt)
      return null;
    return stateLabelMap[connectionState] ?? "Needs attention";
  })();

  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left: muted sync metadata */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="inline-flex flex-wrap items-center gap-1.5 text-[13px] text-text-tertiary">
          <span className="truncate">
            Last sync: {getLastSyncDate(lastSyncedAt) ?? "never"}
          </span>
          <span aria-hidden className="text-text-tertiary/60">
            ·
          </span>
          <button
            onClick={onSyncAccount}
            className="inline-flex cursor-pointer items-center gap-1 text-text-tertiary underline underline-offset-2 transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
            aria-label={
              isSyncPending
                ? "Syncing account"
                : syncCooldownLabel || "Sync active account"
            }
            title={
              isSyncPending
                ? "Syncing account"
                : syncCooldownLabel || "Sync active account"
            }
            disabled={isSyncPending || isCooldownActive}
          >
            {isSyncPending && <RefreshCw className="h-3 w-3 animate-spin" />}
            {isSyncPending ? "Syncing…" : "Resync"}
          </button>
        </div>
        {connectionLabel ? (
          <p className="text-[13px] text-text-secondary">
            Connection status:{" "}
            <span className="font-medium text-text-primary">
              {connectionLabel}
            </span>
          </p>
        ) : null}
      </div>

      {/* Right: page-view controls — date range + unit toggle, grouped together */}
      <div className="flex shrink-0 items-stretch gap-2">
        <PageHeaderDateRangePicker
          range={dateRange}
          rangeLabel={dateRangeLabel}
          onApply={onApplyDateRange}
        />
        <UnitToggle />
      </div>
    </section>
  );
}

type DateRangePreset = {
  id: string;
  label: string;
  getRange: () => Required<DateRange>;
};

/**
 * Quick-pick presets shown alongside the dual calendar. `now` is injected so the
 * function stays pure/testable; the picker passes a fresh `new Date()` at open.
 */
function buildDateRangePresets(now: Date): DateRangePreset[] {
  return [
    { id: "today", label: "Today", getRange: () => ({ from: now, to: now }) },
    {
      id: "this-week",
      label: "This week",
      getRange: () => ({
        from: startOfWeek(now, { weekStartsOn: 0 }),
        to: now,
      }),
    },
    {
      id: "this-month",
      label: "This month",
      getRange: () => ({ from: startOfMonth(now), to: now }),
    },
    {
      id: "last-30-days",
      label: "Last 30 days",
      getRange: () => ({ from: subDays(now, 29), to: now }),
    },
    {
      id: "last-month",
      label: "Last month",
      getRange: () => {
        const lastMonth = subMonths(now, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
    },
    {
      id: "this-quarter",
      label: "This quarter",
      getRange: () => ({ from: startOfQuarter(now), to: now }),
    },
    {
      id: "ytd",
      label: "YTD (year to date)",
      getRange: () => ({ from: startOfYear(now), to: now }),
    },
  ];
}

function isSameDay(a: Date | undefined, b: Date | undefined) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Date-range selector styled as a page-view control (not global chrome).
 * Dual-month calendar with a quick-pick presets sidebar (Today, This week,
 * This month, Last 30 days, Last month, This quarter, YTD).
 */
function PageHeaderDateRangePicker({
  range,
  rangeLabel,
  onApply,
}: {
  range: DateRange | undefined;
  rangeLabel: string;
  onApply: (range: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(range?.from);
  // Recompute presets each time the popover opens so "Today" etc. stay current.
  const [presets, setPresets] = useState<DateRangePreset[]>(() =>
    buildDateRangePresets(new Date()),
  );
  const hasRange = !!range?.from && !!range?.to;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPresets(buildDateRangePresets(new Date()));
      setMonth(range?.from ?? new Date());
    }
    setOpen(nextOpen);
  };

  const applyPreset = (preset: DateRangePreset) => {
    const next = preset.getRange();
    onApply(next);
    setMonth(next.from);
    setOpen(false);
  };

  const activePresetId = presets.find(
    (preset) =>
      hasRange &&
      isSameDay(preset.getRange().from, range?.from) &&
      isSameDay(preset.getRange().to, range?.to),
  )?.id;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-chrome-control-border bg-card-bg px-3.5 py-2 font-semibold text-sidebar-nav-active-text transition-colors hover:cursor-pointer hover:bg-sidebar-nav-active-bg"
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={18}
            strokeWidth={1.5}
            className="shrink-0"
          />
          <span className="truncate text-sm font-semibold text-sidebar-nav-active-text">
            {hasRange ? rangeLabel : "Date range"}
          </span>
          <IconChevronDown />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-chrome-control-border bg-card-bg p-0"
        align="end"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="min-w-0">
            <CalendarWidget
              mode="range"
              selected={range}
              onSelect={onApply}
              numberOfMonths={2}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown"
              startMonth={new Date(2015, 0)}
              endMonth={new Date(2035, 11)}
              classNames={{ button_previous: "hidden", button_next: "hidden" }}
            />
            {/* Selected-range summary + clear */}
            <div className="flex items-center justify-between gap-3 border-t border-chrome-control-border px-3 py-2.5">
              <span className="truncate text-xs font-medium text-text-secondary">
                {range?.from ? (
                  <>
                    <span className="text-text-primary">
                      {format(range.from, "MMM d, yyyy")}
                    </span>
                    {range.to ? (
                      <>
                        {" – "}
                        <span className="text-text-primary">
                          {format(range.to, "MMM d, yyyy")}
                        </span>
                      </>
                    ) : (
                      " – select end date"
                    )}
                  </>
                ) : (
                  "No date range selected"
                )}
              </span>
              {range?.from ? (
                <button
                  type="button"
                  onClick={() => onApply(undefined)}
                  className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {/* Presets sidebar */}
          <div className="flex shrink-0 flex-col gap-0.5 border-t border-chrome-control-border p-2 sm:border-l sm:border-t-0 sm:py-3">
            {presets.map((preset) => {
              const isActive = preset.id === activePresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  aria-pressed={isActive}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
                      : "text-text-secondary hover:bg-sidebar-nav-active-bg hover:text-text-primary",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Currency vs Return% unit toggle (visual only for now — not yet wired to data).
 * Segmented control: "$" = currency, "%" = Return%.
 */
function UnitToggle() {
  const [unit, setUnit] = useState<"currency" | "percent">("currency");

  return (
    <div
      role="group"
      aria-label="Value unit"
      className="inline-flex items-stretch rounded-lg border border-chrome-control-border bg-card-bg p-0.5"
    >
      <button
        type="button"
        onClick={() => setUnit("currency")}
        aria-pressed={unit === "currency"}
        title="Currency"
        className={cn(
          "flex min-w-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors cursor-pointer",
          unit === "currency"
            ? "bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
            : "text-text-secondary hover:text-text-primary",
        )}
      >
        $
      </button>
      <button
        type="button"
        onClick={() => setUnit("percent")}
        aria-pressed={unit === "percent"}
        title="Return %"
        className={cn(
          "flex min-w-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors cursor-pointer",
          unit === "percent"
            ? "bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
            : "text-text-secondary hover:text-text-primary",
        )}
      >
        %
      </button>
    </div>
  );
}
