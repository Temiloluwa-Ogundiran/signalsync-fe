import type { JournalAccount } from "../types";

export const JOURNAL_AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;

type AutomaticSyncAccount = Pick<
  JournalAccount,
  "import_method" | "connection_state" | "next_sync_not_before" | "is_demo"
>;

interface AutomaticJournalSyncOptions {
  account: AutomaticSyncAccount | undefined;
  nowMs: number;
  lastAutomaticSyncAtMs: number | null;
  isVisible: boolean;
  isSyncBusy: boolean;
  isConnectionPending: boolean;
}

export function shouldStartAutomaticJournalSync({
  account,
  nowMs,
  lastAutomaticSyncAtMs,
  isVisible,
  isSyncBusy,
  isConnectionPending,
}: AutomaticJournalSyncOptions) {
  if (
    !account ||
    !isVisible ||
    isSyncBusy ||
    isConnectionPending ||
    account.is_demo ||
    account.import_method !== "auto_sync" ||
    account.connection_state !== "ready"
  ) {
    return false;
  }

  const cooldownUntilMs = account.next_sync_not_before
    ? new Date(account.next_sync_not_before).getTime()
    : null;
  if (cooldownUntilMs && !Number.isNaN(cooldownUntilMs) && cooldownUntilMs > nowMs) {
    return false;
  }

  return (
    lastAutomaticSyncAtMs === null ||
    nowMs - lastAutomaticSyncAtMs >= JOURNAL_AUTO_SYNC_INTERVAL_MS
  );
}
