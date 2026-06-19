"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useJournalUiStore } from "../store/journal-ui-store";
import { useJournalAccounts } from "./use-journal-accounts";

/**
 * Resolves the active journal account id, self-correcting against the accounts
 * the current user actually owns.
 *
 * The selection is persisted client-side (localStorage), so it can go stale:
 * a different user logging in on the same browser, or an account that was
 * removed elsewhere, would otherwise leave a foreign/dead id that 404s every
 * analytics call. We therefore treat the persisted (or ?accountId=) value as a
 * HINT: it's only used when it matches one of the fetched accounts; otherwise
 * we fall back to the first account and write the correction back so the stale
 * value can never resurface.
 *
 * Shareable links can still pass ?accountId= to preselect.
 */
export function useResolvedJournalAccountId(): string | undefined {
  const searchParams = useSearchParams();
  const storeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const { data: accounts = [], isSuccess } = useJournalAccounts();

  const urlAccountId = searchParams.get("accountId") || undefined;
  const hint = urlAccountId || storeAccountId || undefined;

  const resolved = useMemo(() => {
    // Until accounts have loaded, optimistically use the hint so the first
    // render isn't empty; it gets validated below once the list arrives.
    if (!isSuccess) return hint;
    if (accounts.length === 0) return undefined;
    const owned = hint && accounts.some((a) => a.id === hint);
    return owned ? hint : accounts[0].id;
  }, [isSuccess, accounts, hint]);

  // Persist the correction: if the stored id doesn't belong to this user (or is
  // empty) and we resolved to a real owned account, overwrite it so a stale /
  // foreign id is cleared from localStorage.
  useEffect(() => {
    if (!isSuccess) return;
    if (resolved && resolved !== storeAccountId && resolved !== urlAccountId) {
      setActiveAccountId(resolved);
    }
  }, [isSuccess, resolved, storeAccountId, urlAccountId, setActiveAccountId]);

  return resolved;
}
