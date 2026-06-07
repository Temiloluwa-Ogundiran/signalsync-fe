"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalTradesApi } from "../api/journal-trades.api";

interface UseJournalOpenPositionsInput {
  accountId?: string;
  limit?: number;
}

export function useJournalOpenPositions({
  accountId,
  limit = 50,
}: UseJournalOpenPositionsInput) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["journal-open-positions", session?.accessToken, accountId, limit],
    queryFn: () =>
      journalTradesApi.listOpenPositions(
        accountId as string,
        limit,
        session?.accessToken as string,
      ),
    enabled: status === "authenticated" && !!session?.accessToken && !!accountId,
    staleTime: 15_000,
  });
}
