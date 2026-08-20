import { useEffect, useMemo, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import {
  getJournalSyncPollIntervalMs,
  refreshJournalQueriesAfterManualSync,
} from "@/features/journal/lib/manual-sync-refresh";
import type {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import type { JournalAccount } from "@/features/journal/types";
import {
  getAccountSyncStatus,
  isAccountSyncFailed,
  shouldOfferManualJournalResync,
} from "@/features/journal/lib/account-sync-status";
import { useAutomaticJournalSync } from "@/features/journal/hooks/use-automatic-journal-sync";

const MANUAL_SYNC_BURST_WINDOW_MS = 60_000;
const MANUAL_SYNC_BURST_MAX_ATTEMPTS = 5;

function pruneRecentSyncAttempts(attempts: number[], nowMs: number) {
  return attempts.filter(
    (attemptMs) => nowMs - attemptMs < MANUAL_SYNC_BURST_WINDOW_MS,
  );
}

function getBurstRateLimitUntilMs(attempts: number[], nowMs: number) {
  const recentAttempts = pruneRecentSyncAttempts(attempts, nowMs);
  if (recentAttempts.length < MANUAL_SYNC_BURST_MAX_ATTEMPTS) {
    return null;
  }
  return recentAttempts[0] + MANUAL_SYNC_BURST_WINDOW_MS;
}

type RefetchAccounts = ReturnType<typeof useJournalAccounts>["refetch"];

interface UseManualSyncControllerParams {
  accounts: JournalAccount[];
  activeAccountId: string | null;
  activeAccount: JournalAccount | undefined;
  isConnectionPending: boolean;
  activeAccountConnectionBusy: boolean;
  syncAccountMutation: ReturnType<typeof useSyncJournalAccount>;
  refetchAccounts: RefetchAccounts;
  refetchDashboard: () => unknown;
  queryClient: QueryClient;
}

export function useManualSyncController({
  accounts,
  activeAccountId,
  activeAccount,
  isConnectionPending,
  activeAccountConnectionBusy,
  syncAccountMutation,
  refetchAccounts,
  refetchDashboard,
  queryClient,
}: UseManualSyncControllerParams) {
  const [syncUiState, setSyncUiState] = useState<{
    accountId: string;
    startedAt: number;
    baselineLastSyncedAtMs: number | null;
  } | null>(null);
  const [recentManualSyncAttemptMs, setRecentManualSyncAttemptMs] = useState<
    number[]
  >([]);
  const [userSyncRateLimitedUntilMs, setUserSyncRateLimitedUntilMs] = useState<
    number | null
  >(null);
  const wasConnectionPendingRef = useRef(false);
  const pollingWindowStartedAtRef = useRef<number | null>(null);

  const isSyncBusy =
    activeAccountConnectionBusy ||
    syncAccountMutation.isPending ||
    !!syncUiState;
  // The Journal pages own the visible, icon-only sync indicator. It covers
  // both an initial account bootstrap and each automatic/background resync.
  const showJournalSyncProgress = isSyncBusy;

  const journalSyncProgressMessage = useMemo(() => {
    if (syncAccountMutation.isPending) return "Contacting server...";
    if (syncUiState) return "Waiting for background sync...";
    if (activeAccount) {
      const syncStatus = getAccountSyncStatus(activeAccount);
      if (syncStatus.severity === "pending") return syncStatus.detail;
    }
    return "Sync in progress...";
  }, [
    syncAccountMutation.isPending,
    syncUiState,
    activeAccount,
  ]);

  const handleRefreshAccounts = async (options?: {
    accountId?: string;
  }) => {
    const targetAccountId = options?.accountId ?? activeAccountId;
    const nowMs = Date.now();
    const prunedAttempts = pruneRecentSyncAttempts(
      recentManualSyncAttemptMs,
      nowMs,
    );
    setRecentManualSyncAttemptMs(prunedAttempts);

    if (syncAccountMutation.isPending || syncUiState) {
      return;
    }

    if (!accounts.length) {
      return;
    }

    if (!targetAccountId) {
      await refetchAccounts();
      return;
    }
    const targetAccount = accounts.find(
      (account) => account.id === targetAccountId,
    );
    if (
      userSyncRateLimitedUntilMs &&
      userSyncRateLimitedUntilMs > nowMs
    ) {
      return;
    }

    const localBurstRateLimitUntilMs = getBurstRateLimitUntilMs(
      prunedAttempts,
      nowMs,
    );
    if (localBurstRateLimitUntilMs && localBurstRateLimitUntilMs > nowMs) {
      setUserSyncRateLimitedUntilMs(localBurstRateLimitUntilMs);
      return;
    }

    const targetAccountCooldownUntilMs = targetAccount?.next_sync_not_before
      ? new Date(targetAccount.next_sync_not_before).getTime()
      : null;
    if (
      targetAccountCooldownUntilMs &&
      !Number.isNaN(targetAccountCooldownUntilMs) &&
      targetAccountCooldownUntilMs > nowMs
    ) {
      await refetchAccounts();
      return;
    }

    const baselineLastSyncedAtMs = targetAccount?.last_synced_at
      ? new Date(targetAccount.last_synced_at).getTime()
      : null;
    setRecentManualSyncAttemptMs([...prunedAttempts, nowMs]);
    setSyncUiState({
      accountId: targetAccountId,
      startedAt: Date.now(),
      baselineLastSyncedAtMs:
        baselineLastSyncedAtMs && !Number.isNaN(baselineLastSyncedAtMs)
          ? baselineLastSyncedAtMs
          : null,
    });

    try {
      const result = await syncAccountMutation.mutateAsync(targetAccountId);
      await refetchAccounts();
      if ("inserted_trades" in result) {
        await refreshJournalQueriesAfterManualSync(queryClient);
        setSyncUiState(null);
        return;
      }

      if (result.status === "in_progress") {
        return;
      }

      if (result.status === "queued") {
        // The animated sync control is the visual acknowledgement. Keep the
        // queued state quiet so automatic and manual syncs share one surface.
        return;
      }

      setSyncUiState(null);

      if (
        result.status === "cooldown" ||
        result.status === "rate_limited" ||
        result.status === "backpressure"
      ) {
        if (
          result.status === "rate_limited" &&
          result.retry_after_seconds &&
          result.retry_after_seconds > 0
        ) {
          setUserSyncRateLimitedUntilMs(
            Date.now() + result.retry_after_seconds * 1000,
          );
        }
        return;
      }
    } catch {
      setSyncUiState(null);
      await refetchAccounts();
    }
  };

  useAutomaticJournalSync({
    activeAccount,
    activeAccountId,
    isConnectionPending,
    isSyncBusy,
    refetchAccounts,
    requestSync: handleRefreshAccounts,
  });

  useEffect(() => {
    if (isConnectionPending) {
      if (!pollingWindowStartedAtRef.current) {
        pollingWindowStartedAtRef.current = Date.now();
      }
      return;
    }

    pollingWindowStartedAtRef.current = null;
  }, [isConnectionPending]);

  useEffect(() => {
    const pollingWindowStartedAt = pollingWindowStartedAtRef.current;
    if (!pollingWindowStartedAt || !isConnectionPending) {
      return;
    }

    const elapsedMs = Date.now() - pollingWindowStartedAt;
    if (elapsedMs > 6 * 60 * 1000) {
      pollingWindowStartedAtRef.current = null;
      return;
    }

    const intervalMs = elapsedMs < 90_000 ? 750 : 20_000;
    const timer = window.setInterval(() => {
      void refetchAccounts();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isConnectionPending, refetchAccounts]);

  useEffect(() => {
    if (wasConnectionPendingRef.current && !isConnectionPending) {
      void refetchDashboard();
    }
    wasConnectionPendingRef.current = isConnectionPending;
  }, [refetchDashboard, isConnectionPending]);

  useEffect(() => {
    if (!syncUiState) {
      return;
    }

    const elapsedMs = Date.now() - syncUiState.startedAt;
    const timeoutMs = Math.max(3 * 60_000 - elapsedMs, 0);
    const expiryTimer = window.setTimeout(() => {
      setSyncUiState(null);
    }, timeoutMs);

    const timer = window.setInterval(async () => {
      const refreshed = await refetchAccounts();
      const trackedAccount = (refreshed.data ?? []).find(
        (account) => account.id === syncUiState.accountId,
      );
      if (!trackedAccount) {
        setSyncUiState(null);
        return;
      }

      const trackedLastSyncedAtMs = trackedAccount.last_synced_at
        ? new Date(trackedAccount.last_synced_at).getTime()
        : null;
      const didSyncTimestampAdvance =
        !!trackedLastSyncedAtMs &&
        !Number.isNaN(trackedLastSyncedAtMs) &&
        (!syncUiState.baselineLastSyncedAtMs ||
          trackedLastSyncedAtMs > syncUiState.baselineLastSyncedAtMs);
      const isFailureState = isAccountSyncFailed(
        getAccountSyncStatus(trackedAccount),
      );

      if (didSyncTimestampAdvance || isFailureState) {
        setSyncUiState(null);
        void refetchDashboard();
        // Background sync finished → invalidate ALL journal queries (trade
        // history, open positions, day, analytics) so other pages like Trade
        // View pick up the newly-ingested trades without a manual refresh.
        void refreshJournalQueriesAfterManualSync(queryClient);
      }
    }, getJournalSyncPollIntervalMs(elapsedMs));

    return () => {
      window.clearTimeout(expiryTimer);
      window.clearInterval(timer);
    };
  }, [refetchDashboard, refetchAccounts, syncUiState, queryClient]);

  const manualSyncAvailable = shouldOfferManualJournalResync(activeAccount);

  return {
    handleRefreshAccounts,
    isSyncBusy,
    manualSyncAvailable,
    showJournalSyncProgress,
    journalSyncProgressMessage,
    userSyncRateLimitedUntilMs,
  };
}
