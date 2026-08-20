"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  refreshJournalQueriesAfterManualSync,
  waitForQueuedJournalSyncCompletion,
} from "@/features/journal/lib/manual-sync-refresh";
import {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import {
  JOURNAL_AUTO_SYNC_INTERVAL_MS,
  shouldStartAutomaticJournalSync,
} from "@/features/journal/lib/automatic-journal-sync";

interface UseOnMountSyncOptions {
  enabled?: boolean;
}

/**
 * Keeps the selected account current on dashboard pages that do not render the
 * Journal's visible sync control. Dashboard and Journal own their own visible
 * scheduler so this hook is disabled there to prevent duplicate requests.
 */
export function useOnMountSync({ enabled = true }: UseOnMountSyncOptions = {}) {
  const queryClient = useQueryClient();
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const { data: accounts = [], refetch: refetchAccounts } = useJournalAccounts();
  const syncAccount = useSyncJournalAccount();
  const lastAttemptAtByAccountRef = useRef(new Map<string, number>());
  const syncInFlightRef = useRef(false);
  const latestStateRef = useRef({
    activeAccountId,
    accounts,
    refetchAccounts,
    syncAccount,
    queryClient,
  });
  latestStateRef.current = {
    activeAccountId,
    accounts,
    refetchAccounts,
    syncAccount,
    queryClient,
  };

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const runIfDue = async () => {
      if (document.visibilityState !== "visible" || syncInFlightRef.current) {
        return;
      }

      const initial = latestStateRef.current;
      const initialAccount = initial.accounts.find(
        (account) => account.id === initial.activeAccountId,
      );
      const initialAttemptAtMs = initialAccount
        ? lastAttemptAtByAccountRef.current.get(initialAccount.id) ?? null
        : null;
      if (
        !shouldStartAutomaticJournalSync({
          account: initialAccount,
          nowMs: Date.now(),
          lastAutomaticSyncAtMs: initialAttemptAtMs,
          isVisible: true,
          isSyncBusy: initial.syncAccount.isPending,
          isConnectionPending: false,
        })
      ) {
        return;
      }

      syncInFlightRef.current = true;
      try {
        const refreshed = await initial.refetchAccounts();
        const latest = latestStateRef.current;
        const account =
          (refreshed.data ?? []).find(
            (candidate) => candidate.id === latest.activeAccountId,
          ) ??
          latest.accounts.find(
            (candidate) => candidate.id === latest.activeAccountId,
          );
        if (!account) return;

        const nowMs = Date.now();
        const lastAttemptAtMs =
          lastAttemptAtByAccountRef.current.get(account.id) ?? null;
        if (
          !shouldStartAutomaticJournalSync({
            account,
            nowMs,
            lastAutomaticSyncAtMs: lastAttemptAtMs,
            isVisible: document.visibilityState === "visible",
            isSyncBusy: latest.syncAccount.isPending,
            isConnectionPending: false,
          })
        ) {
          return;
        }

        lastAttemptAtByAccountRef.current.set(account.id, nowMs);
        const result = await latest.syncAccount.mutateAsync(account.id);
        if ("inserted_trades" in result) {
          await refreshJournalQueriesAfterManualSync(latest.queryClient);
          return;
        }
        if (result.status === "queued") {
          const waitResult = await waitForQueuedJournalSyncCompletion({
            accountId: account.id,
            baselineLastSyncedAt: account.last_synced_at,
            refetchAccounts: latest.refetchAccounts,
          });
          if (waitResult.status === "completed" || waitResult.status === "failed") {
            await refreshJournalQueriesAfterManualSync(latest.queryClient);
          }
        }
      } catch {
        // A later focus event or five-minute interval safely retries.
      } finally {
        syncInFlightRef.current = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void runIfDue();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", runIfDue);
    const interval = window.setInterval(
      () => void runIfDue(),
      JOURNAL_AUTO_SYNC_INTERVAL_MS,
    );
    void runIfDue();

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", runIfDue);
      window.clearInterval(interval);
    };
  }, [activeAccountId, enabled]);
}
