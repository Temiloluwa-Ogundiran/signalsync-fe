"use client";

import { Plus, RefreshCw } from "lucide-react";

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
  const deltaSeconds = Math.max(
    1,
    Math.floor((Date.now() - new Date(lastSyncedAt).getTime()) / 1000),
  );
  if (deltaSeconds < 60) return `Last sync: ${deltaSeconds} seconds ago`;
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `Last sync: ${deltaMinutes} minutes ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  return `Last sync: ${deltaHours} hours ago`;
}

export function JournalToolbar({
  isSyncPending,
  lastSyncedAt,
  connectionState,
  connectionError,
  onSyncAccount,
  onOpenJournalDay,
}: JournalToolbarProps) {
  const stateLabelMap: Record<string, string> = {
    pending_verification: "Verifying credentials...",
    bootstrapping: "Syncing account history for stats...",
    ready: "Ready",
    verification_failed: "Needs attention",
    bootstrap_failed: "Needs attention",
  };
  const connectionLabel =
    connectionState && connectionState !== "ready" ? stateLabelMap[connectionState] : null;

  return (
    <section className="flex flex-col gap-4 border-b border-border-primary/35 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <span>{getLastSyncText(lastSyncedAt)}</span>
          <button
            onClick={onSyncAccount}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            aria-label={isSyncPending ? "Syncing account" : "Sync active account"}
            title={isSyncPending ? "Syncing account" : "Sync active account"}
            disabled={isSyncPending}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncPending ? "animate-spin" : ""}`} />
          </button>
        </div>
        {connectionLabel ? (
          <p className="text-sm text-text-secondary">
            Connection status: <span className="font-medium text-text-primary">{connectionLabel}</span>
            {connectionError ? ` - ${connectionError}` : ""}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onOpenJournalDay}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Journal Day
        </button>
        <button className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-chrome-control-border bg-card-bg px-5 text-sm font-semibold text-text-primary">
          Export Stats
        </button>
      </div>
    </section>
  );
}

