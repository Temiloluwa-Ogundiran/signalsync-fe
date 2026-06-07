"use client";

import {
  PencilLine,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useJournalUiStore } from "../store/journal-ui-store";
import { Switch } from "@/components/ui/switch";

interface JournalToolbarProps {
  isSyncPending: boolean;
  lastSyncedAt?: string | null;
  nextSyncNotBefore?: string | null;
  userSyncRateLimitedUntilMs?: number | null;
  connectionState?: string;
  onSyncAccount: () => void;
  onOpenJournalDay: () => void;
}

function getLastSyncText(lastSyncedAt?: string | null) {
  if (!lastSyncedAt) return "Last sync: never";
  const syncedAtMs = new Date(lastSyncedAt).getTime();
  if (Number.isNaN(syncedAtMs)) return "Last sync: never";
  const deltaSeconds = Math.max(
    1,
    Math.floor((Date.now() - syncedAtMs) / 1000),
  );
  if (deltaSeconds < 60) return `Last sync: ${deltaSeconds} seconds ago`;
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `Last sync: ${deltaMinutes} minutes ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `Last sync: ${deltaHours} hours ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `Last sync: ${deltaDays} days ago`;
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

export function JournalToolbar({
  isSyncPending,
  lastSyncedAt,
  nextSyncNotBefore,
  userSyncRateLimitedUntilMs,
  connectionState,
  onSyncAccount,
  onOpenJournalDay,
}: JournalToolbarProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  const openAddTradeModal = useJournalUiStore((s) => s.openAddTradeModal);
  const includeManualTrades = useJournalUiStore((s) => s.includeManualTrades);
  const setIncludeManualTrades = useJournalUiStore(
    (s) => s.setIncludeManualTrades,
  );

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
    <section className="flex flex-col gap-4 border-b border-border-primary/35 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <span>{getLastSyncText(lastSyncedAt)}</span>
          <button
            onClick={onSyncAccount}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
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
            <RefreshCw
              className={`h-4 w-4 ${isSyncPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        {syncCooldownLabel ? (
          <p className="text-sm text-text-secondary">{syncCooldownLabel}</p>
        ) : null}
        {connectionLabel ? (
          <p className="text-sm text-text-secondary">
            Connection status:{" "}
            <span className="font-medium text-text-primary">
              {connectionLabel}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-row items-center gap-3 md:gap-4 md:flex-nowrap shrink-0 flex-wrap">
        {/* Compact Analytics Toggle */}
        <div className="flex items-center gap-3 border border-border-primary/45 bg-bg-tertiary/40 rounded-full py-1.5 px-4 h-11 transition-all hover:border-border-primary select-none shrink-0">
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Include manual trades
          </span>
          <Switch
            checked={includeManualTrades}
            onCheckedChange={setIncludeManualTrades}
            title={
              includeManualTrades
                ? "Click to exclude manual trades from stats"
                : "Click to include manual trades in stats"
            }
          />
        </div>

        {/* Add Trade Button (secondary bordered style) */}
        <button
          onClick={() => openAddTradeModal(null)}
          className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-border-primary/60 bg-card-bg px-5 text-sm font-semibold text-text-primary transition-all hover:bg-bg-secondary hover:border-border-primary cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Trade
        </button>

        {/* Journal Day Button */}
        <button
          onClick={onOpenJournalDay}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover cursor-pointer shrink-0"
        >
          <PencilLine className="h-4 w-4" />
          Journal Day
        </button>
      </div>
    </section>
  );
}
