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
import type { JournalAccount } from "@/features/journal/types";

function isSyncable(account: JournalAccount): boolean {
  // Demo accounts are synthetic — never sync them (the backend no-ops too).
  if (account.is_demo) return false;
  if (account.import_method === "csv_upload") return false;
  if (account.connection_state !== "ready") return false;
  // Respect the backend cooldown — a sync within next_sync_not_before would be
  // rejected anyway, so skip silently on a quick reload.
  if (account.next_sync_not_before) {
    const nextMs = new Date(account.next_sync_not_before).getTime();
    if (!Number.isNaN(nextMs) && nextMs > Date.now()) return false;
  }
  return true;
}

/**
 * Sync the active account ONCE when the dashboard shell mounts (i.e. on page
 * load / reload). This is the only form of auto-sync — there is no interval or
 * activity-based syncing. Skips silently for CSV / not-ready / in-cooldown
 * accounts.
 */
export function useOnMountSync() {
  const queryClient = useQueryClient();
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const { data: accounts = [], refetch: refetchAccounts } = useJournalAccounts();
  const syncAccount = useSyncJournalAccount();

  // Guard so we fire at most once per mount, even under StrictMode double-mount
  // or re-renders once accounts load in.
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) return;
    if (!activeAccountId || accounts.length === 0) return;

    const account = accounts.find((a) => a.id === activeAccountId);
    if (!account || !isSyncable(account)) return;

    hasSyncedRef.current = true;

    (async () => {
      try {
        const result = await syncAccount.mutateAsync(account.id);
        if ("inserted_trades" in result) {
          await refreshJournalQueriesAfterManualSync(queryClient);
          return;
        }
        if (result.status === "queued") {
          const waitResult = await waitForQueuedJournalSyncCompletion({
            accountId: account.id,
            baselineLastSyncedAt: account.last_synced_at,
            refetchAccounts,
          });
          if (waitResult.status === "completed" || waitResult.status === "failed") {
            await refreshJournalQueriesAfterManualSync(queryClient);
          }
          return;
        }
        // cooldown / rate_limited / backpressure — silently ignore.
      } catch {
        // Network/transient error — leave the UI as-is; the user can Resync.
      }
    })();
  }, [activeAccountId, accounts, syncAccount, refetchAccounts, queryClient]);
}
