import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { journalDailyApi } from "../api/journal-daily.api";

const DAY_NOTE_KEYS = {
  dayNote: (accountId?: string, tradingDate?: string) =>
    ["journal-day-note", accountId, tradingDate] as const,
};

/**
 * Fetch the day note for a given account and trading date.
 * The note is created on first access if it doesn't exist.
 */
export function useDayNote(
  accountId?: string,
  tradingDate?: string,
  enabled = true,
) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: DAY_NOTE_KEYS.dayNote(accountId, tradingDate),
    queryFn: () =>
      journalDailyApi.getDayNote(
        accountId as string,
        tradingDate as string,
        session?.accessToken as string,
      ),
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!accountId &&
      !!tradingDate,
    staleTime: 60_000,
  });
}

/**
 * Save the day note for a given account and trading date.
 */
export function useSaveDayNote(accountId?: string, tradingDate?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteHtml: string | null) =>
      journalDailyApi.saveDayNote(
        accountId as string,
        tradingDate as string,
        noteHtml,
        session?.accessToken as string,
      ),
    onSuccess: (data) => {
      // Update the query cache with the new note data
      queryClient.setQueryData(
        DAY_NOTE_KEYS.dayNote(accountId, tradingDate),
        data,
      );
    },
  });
}
