"use client";

import { useMemo } from "react";
import { useJournalAccounts } from "./use-journal-accounts";
import { useResolvedJournalAccountId } from "./use-resolved-journal-account-id";

/**
 * The ISO-4217 currency of the currently active journal account (e.g. "USD",
 * "NGN"), used to format money in the per-account journal/analytics views.
 *
 * Resolution: the active account id (URL ?accountId= or the persisted picker
 * selection) matched against the accounts list. Falls back to USD before the
 * accounts load or when no account is resolved.
 *
 * Note: this is a per-account view helper. A true cross-account aggregate would
 * need an explicit currency decision — these journal views are scoped to one
 * active account, so the account's own currency is correct.
 */
export function useActiveAccountCurrency(): string {
  const { data: accounts } = useJournalAccounts();
  const accountId = useResolvedJournalAccountId();

  return useMemo(() => {
    if (!accounts || accounts.length === 0) return "USD";
    const active =
      (accountId && accounts.find((a) => a.id === accountId)) || accounts[0];
    return active?.currency || "USD";
  }, [accounts, accountId]);
}
