"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useJournalUiStore } from "../store/journal-ui-store";

/**
 * Shareable links can still pass ?accountId=; otherwise the persisted
 * journal account picker selection is used.
 */
export function useResolvedJournalAccountId(): string | undefined {
  const searchParams = useSearchParams();
  const storeAccountId = useJournalUiStore((s) => s.activeAccountId);

  return useMemo(
    () => searchParams.get("accountId") || storeAccountId || undefined,
    [searchParams, storeAccountId],
  );
}
