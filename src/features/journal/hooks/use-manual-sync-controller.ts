import { useEffect, useMemo, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiException } from "@/lib/api/types";
import { refreshJournalQueriesAfterManualSync } from "@/features/journal/lib/manual-sync-refresh";
import type {
  useJournalAccounts,
  useSyncJournalAccount,
} from "@/features/journal/hooks/use-journal-accounts";
import type { JournalAccount } from "@/features/journal/types";

function formatSyncTimestamp(dateString: string | null | undefined) {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

function formatRetryCountdown(retryAfterSeconds: number) {
  const totalSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
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

  // The full-width progress banner is reserved for the initial account
  // bootstrap/verification. Manual resync surfaces only the spinner next to the
  // "Resync" control (via `isSyncBusy`), so don't show the banner for it.
  const showJournalSyncProgress = activeAccountConnectionBusy;

  const journalSyncProgressMessage = useMemo(() => {
    if (syncAccountMutation.isPending) return "Contacting server...";
    if (syncUiState) return "Waiting for background sync...";
    if (activeAccount?.connection_state === "bootstrapping") {
      return "Syncing account history for stats...";
    }
    if (activeAccount?.connection_state === "pending_verification") {
      return "Verifying credentials...";
    }
    return "Sync in progress...";
  }, [
    syncAccountMutation.isPending,
    syncUiState,
    activeAccount?.connection_state,
  ]);

  const handleRefreshAccounts = async (options?: {
    silent?: boolean;
    accountId?: string;
  }) => {
    const silent = options?.silent ?? false;
    const targetAccountId = options?.accountId ?? activeAccountId;
    const nowMs = Date.now();
    const prunedAttempts = pruneRecentSyncAttempts(
      recentManualSyncAttemptMs,
      nowMs,
    );
    setRecentManualSyncAttemptMs(prunedAttempts);

    if (syncAccountMutation.isPending || syncUiState) {
      if (!silent) {
        toast.info("Processing", {
          description: "Sync is already running. We'll refresh your stats shortly.",
        });
      }
      return;
    }

    if (!accounts.length) {
      return;
    }

    if (!targetAccountId) {
      if (!silent) {
        toast.info("Select an account to sync", {
          description:
            "Manual sync runs for a specific account. Choose one from your account filter.",
        });
      }
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
      if (!silent) {
        toast.info("Manual sync limit reached", {
          description: `Retry in ${formatRetryCountdown(
            (userSyncRateLimitedUntilMs - nowMs) / 1000,
          )}.`,
        });
      }
      return;
    }

    const localBurstRateLimitUntilMs = getBurstRateLimitUntilMs(
      prunedAttempts,
      nowMs,
    );
    if (localBurstRateLimitUntilMs && localBurstRateLimitUntilMs > nowMs) {
      setUserSyncRateLimitedUntilMs(localBurstRateLimitUntilMs);
      if (!silent) {
        toast.info("Manual sync limit reached", {
          description: `Retry in ${formatRetryCountdown(
            (localBurstRateLimitUntilMs - nowMs) / 1000,
          )}.`,
        });
      }
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
      if (!silent) {
        toast.info("Sync is already up to date", {
          description: `Retry in ${formatRetryCountdown(
            (targetAccountCooldownUntilMs - nowMs) / 1000,
          )}.`,
        });
      }
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
      const refreshed = await refetchAccounts();
      const refreshedAccount = (refreshed.data ?? []).find(
        (account) => account.id === targetAccountId,
      );
      const refreshedLastSyncedAtMs = refreshedAccount?.last_synced_at
        ? new Date(refreshedAccount.last_synced_at).getTime()
        : null;
      const refreshedSyncLabel = formatSyncTimestamp(
        refreshedAccount?.last_synced_at ?? null,
      );
      const didSyncTimestampAdvance =
        !!refreshedLastSyncedAtMs &&
        !Number.isNaN(refreshedLastSyncedAtMs) &&
        (!baselineLastSyncedAtMs ||
          refreshedLastSyncedAtMs > baselineLastSyncedAtMs);
      if ("inserted_trades" in result) {
        await refreshJournalQueriesAfterManualSync(queryClient);
        setSyncUiState(null);
        if (!silent) {
          if (result.inserted_trades === 0) {
            toast.info("Account already up to date", {
              description:
                didSyncTimestampAdvance
                  ? `Sync completed${refreshedSyncLabel ? ` at ${refreshedSyncLabel}` : ""}. There were no additional closed trades to ingest.`
                  : "There were no additional closed trades to ingest yet. Live open positions are shown separately in the Open Positions tab.",
            });
          } else {
            toast.success("Account sync complete", {
              description: `Inserted ${result.inserted_trades} trade(s) across ${result.touched_trading_dates} day(s).`,
            });
          }
        }
        return;
      }

      if (result.status === "in_progress") {
        if (!silent) {
          toast.info("Sync already in progress", {
            description:
              result.message ||
              "This account is already syncing. We'll refresh the dashboard when it finishes.",
          });
        }
        return;
      }

      if (result.status === "queued") {
        if (!silent) {
          toast.info("Processing", {
            description: "Sync started. We'll refresh your stats when it's ready.",
          });
        }
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

        if (!silent) {
          const title =
            result.status === "cooldown"
              ? "Sync is already up to date"
              : result.status === "rate_limited"
                ? "Manual sync limit reached"
                : "Sync deferred";
          const description =
            result.retry_after_seconds && result.retry_after_seconds > 0
              ? `${result.message || "Please retry shortly."} Retry in ${formatRetryCountdown(
                  result.retry_after_seconds,
                )}.`
              : result.message || "Please retry shortly.";
          toast.info(title, { description });
        }
        return;
      }

      if (!silent) {
        toast.error("Account sync failed", {
          description:
            result.message || "Unable to sync this account right now.",
        });
      }
    } catch (error) {
      setSyncUiState(null);
      await refetchAccounts();
      if (!silent) {
        if (
          error instanceof ApiException &&
          (error.status === 409 || error.status === 429)
        ) {
          if (error.status === 429 && error.retryAfterSeconds) {
            setUserSyncRateLimitedUntilMs(
              Date.now() + error.retryAfterSeconds * 1000,
            );
          }
          const retryDescription =
            error.retryAfterSeconds && error.retryAfterSeconds > 0
              ? ` Retry in ${formatRetryCountdown(error.retryAfterSeconds)}.`
              : "";
          toast.info("Sync unavailable right now", {
            description: `${error.message}${retryDescription}`,
          });
        } else if (error instanceof ApiException && error.status === 503) {
          toast.error("Sync failed (MetaAPI timeout)", {
            description: error.message,
          });
        } else {
          const description =
            error instanceof ApiException
              ? error.message
              : "Unable to sync this account right now.";
          toast.error("Account sync failed", { description });
        }
      }
    }
  };

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

    const intervalMs = elapsedMs < 90_000 ? 4_000 : 20_000;
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
      const isFailureState =
        trackedAccount.connection_state === "bootstrap_failed" ||
        trackedAccount.connection_state === "verification_failed";

      if (didSyncTimestampAdvance || isFailureState) {
        setSyncUiState(null);
        void refetchDashboard();
        // Background sync finished → invalidate ALL journal queries (trade
        // history, open positions, day, analytics) so other pages like Trade
        // View pick up the newly-ingested trades without a manual refresh.
        void refreshJournalQueriesAfterManualSync(queryClient);
      }
    }, 4_000);

    return () => {
      window.clearTimeout(expiryTimer);
      window.clearInterval(timer);
    };
  }, [refetchDashboard, refetchAccounts, syncUiState, queryClient]);

  return {
    handleRefreshAccounts,
    isSyncBusy: syncAccountMutation.isPending || !!syncUiState,
    showJournalSyncProgress,
    journalSyncProgressMessage,
    userSyncRateLimitedUntilMs,
  };
}
