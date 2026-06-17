"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Settings02Icon } from "@hugeicons/core-free-icons";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/icons/syncgram-nav-icons";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface JournalPageHeaderProps {
  /** Sync metadata line ("Last sync · Resync"). Dashboard shows it; other pages
   *  (e.g. Trade View) reuse the filter family without the sync line. */
  showSyncMeta?: boolean;
  /** Optional left-side content shown in place of the sync metadata. */
  leftContent?: React.ReactNode;
  /** Optional page title (h1) rendered above the left content / sync line. */
  title?: string;
  isSyncPending?: boolean;
  lastSyncedAt?: string | null;
  nextSyncNotBefore?: string | null;
  userSyncRateLimitedUntilMs?: number | null;
  connectionState?: string;
  onSyncAccount?: () => void;
  /** Account selector (moved out of the global chrome into page-view controls). */
  accounts: AccountOption[];
  activeAccountId: string;
  activeAccountLabel: string;
  onSelectAccount: (accountId: string) => void;
  /** Date-range control (moved out of the global chrome into page-view controls). */
  dateRange: DateRange | undefined;
  onApplyDateRange: (range: DateRange | undefined) => void;
}

interface AccountOption {
  id: string;
  display_name?: string | null;
  broker_login?: string | null;
  is_demo?: boolean;
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
  showSyncMeta = true,
  leftContent,
  title,
  isSyncPending = false,
  lastSyncedAt,
  nextSyncNotBefore,
  userSyncRateLimitedUntilMs,
  connectionState,
  onSyncAccount,
  accounts,
  activeAccountId,
  activeAccountLabel,
  onSelectAccount,
  dateRange,
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
      ? `Next sync available in ${getCountdownText(cooldownUntilMs as number)}.`
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
      {/* Left: muted sync metadata (dashboard) or custom content (other pages) */}
      <div className="flex min-w-0 flex-col gap-1">
        {title ? (
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
        ) : null}
        {showSyncMeta ? (
          <>
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
          </>
        ) : (
          leftContent ?? <span />
        )}
      </div>

      {/* Right: page-view controls joined into one filter family — single frame,
          internal dividers between account · date range · unit toggle. */}
      <div className="flex shrink-0 items-stretch divide-x divide-chrome-control-border overflow-hidden rounded-lg border border-chrome-control-border bg-card-bg">
        <AccountSelector
          accounts={accounts}
          activeAccountId={activeAccountId}
          activeLabel={activeAccountLabel}
          onSelect={onSelectAccount}
        />
        <DateRangePicker
          value={dateRange?.from ? { from: dateRange.from, to: dateRange.to } : undefined}
          max={new Date()}
          onChange={onApplyDateRange}
        />
      </div>
    </section>
  );
}

/**
 * Account selector styled as a page-view control, sitting next to the date
 * range (moved out of the global top bar).
 */
function AccountSelector({
  accounts,
  activeAccountId,
  activeLabel,
  onSelect,
}: {
  accounts: AccountOption[];
  activeAccountId: string;
  activeLabel: string;
  onSelect: (accountId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const manageAccounts = (
    <button
      type="button"
      onClick={() => {
        router.push("/accounts");
        setOpen(false);
      }}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={1.5} />
      </span>
      Manage accounts
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-sidebar-nav-active-text transition-colors hover:cursor-pointer hover:bg-sidebar-nav-active-bg"
        >
          <HugeiconsIcon
            icon={CreditCardIcon}
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-text-secondary"
          />
          <span className="truncate">{activeLabel}</span>
          <IconChevronDown />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 rounded-xl border border-hairline bg-popover p-1.5"
      >
        {accounts.length ? (
          <>
            <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              My accounts
            </p>
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((account) => {
                const isActive = account.id === activeAccountId;
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      if (!isActive) onSelect(account.id);
                      setOpen(false);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-subtle"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center",
                        isActive ? "text-ai-accent" : "text-text-secondary",
                      )}
                    >
                      <HugeiconsIcon
                        icon={CreditCardIcon}
                        size={18}
                        strokeWidth={1.5}
                      />
                    </span>
                    <span
                      className={cn(
                        "flex-1 truncate text-sm font-medium",
                        isActive ? "text-text-primary" : "text-text-secondary",
                      )}
                    >
                      {account.display_name ||
                        `Account ${account.broker_login}`}
                    </span>
                    {account.is_demo ? (
                      <span className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                        Demo
                      </span>
                    ) : null}
                    {isActive ? (
                      <span className="shrink-0 rounded-full bg-ai-soft-bg px-2 py-0.5 text-[10px] font-semibold text-ai-accent">
                        Active
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="my-1.5 h-px bg-hairline" />
            {manageAccounts}
          </>
        ) : (
          manageAccounts
        )}
      </PopoverContent>
    </Popover>
  );
}
