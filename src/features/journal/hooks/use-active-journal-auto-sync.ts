"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshJournalQueriesAfterManualSync } from "@/features/journal/lib/manual-sync-refresh";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import type { JournalAccount } from "@/features/journal/types";

const AUTO_SYNC_INTERVAL_MS = 5 * 60_000;
const AUTO_SYNC_CHECK_MS = 30_000;
const ACTIVE_USER_WINDOW_MS = 5 * 60_000;

function getTimeMs(value: string | null | undefined) {
  if (!value) return null;
  const timeMs = new Date(value).getTime();
  return Number.isNaN(timeMs) ? null : timeMs;
}

function isAutoSyncCandidate(account: JournalAccount, nowMs: number) {
  if (account.sync_provider === "csv_import") return false;
  if (account.connection_state !== "ready") return false;

  const nextSyncMs = getTimeMs(account.next_sync_not_before);
  if (nextSyncMs && nextSyncMs > nowMs) return false;

  const lastSyncedMs = getTimeMs(account.last_synced_at);
  return !lastSyncedMs || nowMs - lastSyncedMs >= AUTO_SYNC_INTERVAL_MS;
}

function oldestSyncFirst(a: JournalAccount, b: JournalAccount) {
  return (getTimeMs(a.last_synced_at) ?? 0) - (getTimeMs(b.last_synced_at) ?? 0);
}

export function useActiveJournalAutoSync() {
  const queryClient = useQueryClient();
  const { data: accounts = [], refetch: refetchAccounts } = useJournalAccounts();
  const syncAccount = useSyncJournalAccount();
  const lastUserActivityAtRef = useRef(0);
  const lastAttemptByAccountRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const markActive = () => {
      lastUserActivityAtRef.current = Date.now();
    };
    markActive();

    const activityEvents = [
      "pointerdown",
      "keydown",
      "mousemove",
      "touchstart",
      "focus",
    ] as const;

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, markActive, { passive: true });
    }
    document.addEventListener("visibilitychange", markActive);

    return () => {
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, markActive);
      }
      document.removeEventListener("visibilitychange", markActive);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const nowMs = Date.now();
      if (document.visibilityState !== "visible") return;
      if (nowMs - lastUserActivityAtRef.current > ACTIVE_USER_WINDOW_MS) return;
      if (syncAccount.isPending) return;

      const candidate = accounts
        .filter((account) => {
          const lastAttemptMs = lastAttemptByAccountRef.current[account.id] ?? 0;
          return (
            nowMs - lastAttemptMs >= AUTO_SYNC_INTERVAL_MS &&
            isAutoSyncCandidate(account, nowMs)
          );
        })
        .sort(oldestSyncFirst)[0];

      if (!candidate) return;

      lastAttemptByAccountRef.current[candidate.id] = nowMs;

      try {
        await syncAccount.mutateAsync(candidate.id);
        await refetchAccounts();
        await refreshJournalQueriesAfterManualSync(queryClient);
      } catch {
        await refetchAccounts();
      }
    }, AUTO_SYNC_CHECK_MS);

    return () => window.clearInterval(timer);
  }, [accounts, queryClient, refetchAccounts, syncAccount]);
}
