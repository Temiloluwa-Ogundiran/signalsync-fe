"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/api/query-keys";
import { journalTradesApi } from "../api/journal-trades.api";

interface UseJournalOpenPositionsInput {
  accountId?: string;
  limit?: number;
}

export function useJournalOpenPositions({
  accountId,
  limit = 50,
}: UseJournalOpenPositionsInput) {
  const { status } = useSession();

  return useQuery({
    queryKey: queryKeys.journal.openPositions(accountId, limit),
    queryFn: () =>
      journalTradesApi.listOpenPositions(
        accountId as string,
        limit,
      ),
    enabled: status === "authenticated" && !!accountId,
    staleTime: 15_000,
  });
}
