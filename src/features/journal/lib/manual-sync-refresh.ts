import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { JournalAccount } from "@/features/journal/types";
import { isAccountSyncFailed, getAccountSyncStatus } from "./account-sync-status";

function isMatchingQuery(
  queryKey: QueryKey,
  prefixes: readonly string[],
): boolean {
  return Array.isArray(queryKey) && prefixes.includes(String(queryKey[0]));
}

export async function refreshJournalQueriesAfterManualSync(
  queryClient: QueryClient,
) {
  const prefixes = [
    "journal-accounts",
    "journal-analytics",
    "journal-trade-history",
    "journal-open-positions",
    "journal-day",
    "journal-curve",
    "journal-feed",
  ] as const;

  await Promise.all(
    prefixes.map((prefix) =>
      queryClient.invalidateQueries({
        predicate: (query) => isMatchingQuery(query.queryKey, [prefix]),
      }),
    ),
  );

  await queryClient.refetchQueries({
    predicate: (query) => isMatchingQuery(query.queryKey, prefixes),
    type: "active",
  });
}

type RefetchAccounts = () => Promise<{ data?: JournalAccount[] }>;

export type QueuedSyncWaitResult =
  | { status: "completed"; account: JournalAccount }
  | { status: "failed"; account: JournalAccount }
  | { status: "missing" }
  | { status: "timeout" };

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

function getTimeMs(value: string | null | undefined) {
  if (!value) return null;
  const timeMs = new Date(value).getTime();
  return Number.isNaN(timeMs) ? null : timeMs;
}

export async function waitForQueuedJournalSyncCompletion({
  accountId,
  baselineLastSyncedAt,
  refetchAccounts,
  intervalMs = 4_000,
  maxAttempts = 45,
}: {
  accountId: string;
  baselineLastSyncedAt?: string | null;
  refetchAccounts: RefetchAccounts;
  intervalMs?: number;
  maxAttempts?: number;
}): Promise<QueuedSyncWaitResult> {
  const baselineMs = getTimeMs(baselineLastSyncedAt);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(intervalMs);
    const refreshed = await refetchAccounts();
    const account = (refreshed.data ?? []).find((item) => item.id === accountId);
    if (!account) return { status: "missing" };

    const syncedAtMs = getTimeMs(account.last_synced_at);
    const didSyncAdvance =
      !!syncedAtMs && (!baselineMs || syncedAtMs > baselineMs);
    const didFail = isAccountSyncFailed(getAccountSyncStatus(account));

    if (didSyncAdvance) return { status: "completed", account };
    if (didFail) return { status: "failed", account };
  }

  return { status: "timeout" };
}
