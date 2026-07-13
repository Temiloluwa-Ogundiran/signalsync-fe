import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { aiApi } from "../api/ai.api";
import type { CoachRead } from "../types";

const COACH_READ_KEYS = {
  all: ["ai-coach-read"] as const,
  day: (accountId: string, date: string) =>
    ["ai-coach-read", accountId, date] as const,
};

/**
 * Day-level "Coach's Read". Fetches (and the backend caches) a short AI
 * narrative for one trading day. Only runs when `enabled` — the day card
 * enables it on expand so we don't generate reads for collapsed days.
 */
export function useCoachRead(
  accountId: string | undefined,
  date: string | undefined,
  enabled = true,
) {
  const { data: session, status } = useSession();
  return useQuery<CoachRead>({
    queryKey: COACH_READ_KEYS.day(accountId ?? "", date ?? ""),
    queryFn: () =>
      aiApi.getCoachRead(
        accountId as string,
        date as string,
        undefined,
        session?.accessToken,
      ),
    enabled: status === "authenticated" && !!accountId && !!date && enabled,
    staleTime: 5 * 60_000,
  });
}

/** Regenerate the read for a day (refresh=true), then update the cache. */
export function useRefreshCoachRead(accountId: string | undefined) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation<CoachRead, Error, string>({
    mutationFn: (date: string) =>
      aiApi.getCoachRead(
        accountId as string,
        date,
        { refresh: true },
        session?.accessToken,
      ),
    onSuccess: (data) => {
      if (accountId) {
        queryClient.setQueryData(
          COACH_READ_KEYS.day(accountId, data.trading_date),
          data,
        );
      }
    },
  });
}
