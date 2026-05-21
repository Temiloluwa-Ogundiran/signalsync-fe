"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface JournalToolbarProps {
  isSyncPending: boolean;
  lastSyncedAt?: string | null;
  connectionState?: string;
  connectionError?: string | null;
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

export function JournalToolbar({
  isSyncPending,
  lastSyncedAt,
  connectionState,
  connectionError,
  onSyncAccount,
  onOpenJournalDay,
}: JournalToolbarProps) {
  const [, setNowTick] = useState(0);

  useEffect(() => {
    const intervalMs = lastSyncedAt ? 1_000 : 60_000;
    const timer = window.setInterval(() => {
      setNowTick((value) => value + 1);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [lastSyncedAt]);

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
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            aria-label={
              isSyncPending ? "Syncing account" : "Sync active account"
            }
            title={isSyncPending ? "Syncing account" : "Sync active account"}
            disabled={isSyncPending}
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        {connectionLabel ? (
          <p className="text-sm text-text-secondary">
            Connection status:{" "}
            <span className="font-medium text-text-primary">
              {connectionLabel}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onOpenJournalDay}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Journal Day
        </button>
        {/* <button className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-chrome-control-border bg-card-bg px-5 text-sm font-semibold text-text-primary">
          Export Stats
        </button> */}
      </div>
    </section>
  );
}
