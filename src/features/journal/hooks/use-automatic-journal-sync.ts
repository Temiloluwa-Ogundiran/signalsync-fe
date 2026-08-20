import { useEffect, useRef } from "react";
import type { JournalAccount } from "@/features/journal/types";
import type { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import {
  JOURNAL_AUTO_SYNC_INTERVAL_MS,
  shouldStartAutomaticJournalSync,
} from "@/features/journal/lib/automatic-journal-sync";

type RefetchAccounts = ReturnType<typeof useJournalAccounts>["refetch"];

interface UseAutomaticJournalSyncParams {
  activeAccount: JournalAccount | undefined;
  activeAccountId: string | null;
  isConnectionPending: boolean;
  isSyncBusy: boolean;
  refetchAccounts: RefetchAccounts;
  requestSync: (options?: { accountId?: string }) => Promise<void>;
}

/**
 * Keeps the active Journal account current while its page is visible. The
 * caller owns the visual state, so an automatic sync uses the same disabled
 * control and icon-only indicator as any recovery sync.
 */
export function useAutomaticJournalSync({
  activeAccount,
  activeAccountId,
  isConnectionPending,
  isSyncBusy,
  refetchAccounts,
  requestSync,
}: UseAutomaticJournalSyncParams) {
  const lastAttemptAtByAccountRef = useRef(new Map<string, number>());
  const checkInFlightRef = useRef(false);
  const latestStateRef = useRef({
    activeAccount,
    activeAccountId,
    isConnectionPending,
    isSyncBusy,
    refetchAccounts,
    requestSync,
  });
  latestStateRef.current = {
    activeAccount,
    activeAccountId,
    isConnectionPending,
    isSyncBusy,
    refetchAccounts,
    requestSync,
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const runIfDue = async () => {
      if (
        document.visibilityState !== "visible" ||
        checkInFlightRef.current
      ) {
        return;
      }

      const initial = latestStateRef.current;
      const initialAccount = initial.activeAccount;
      const initialAttemptAtMs = initialAccount
        ? lastAttemptAtByAccountRef.current.get(initialAccount.id) ?? null
        : null;
      if (
        !shouldStartAutomaticJournalSync({
          account: initialAccount,
          nowMs: Date.now(),
          lastAutomaticSyncAtMs: initialAttemptAtMs,
          isVisible: true,
          isSyncBusy: initial.isSyncBusy,
          isConnectionPending: initial.isConnectionPending,
        })
      ) {
        return;
      }

      checkInFlightRef.current = true;
      try {
        const refreshed = await initial.refetchAccounts();
        const latest = latestStateRef.current;
        const target = (refreshed.data ?? []).find(
          (account) => account.id === latest.activeAccountId,
        ) ?? latest.activeAccount;
        if (!target) return;

        const nowMs = Date.now();
        const lastAttemptAtMs =
          lastAttemptAtByAccountRef.current.get(target.id) ?? null;
        if (
          !shouldStartAutomaticJournalSync({
            account: target,
            nowMs,
            lastAutomaticSyncAtMs: lastAttemptAtMs,
            isVisible: document.visibilityState === "visible",
            isSyncBusy: latest.isSyncBusy,
            isConnectionPending: latest.isConnectionPending,
          })
        ) {
          return;
        }

        lastAttemptAtByAccountRef.current.set(target.id, nowMs);
        await latest.requestSync({ accountId: target.id });
      } finally {
        checkInFlightRef.current = false;
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
  }, [activeAccount?.id]);
}
