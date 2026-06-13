import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { csvImportApi } from "../api/csv-import.api";
import { JOURNAL_ACCOUNT_KEYS } from "./use-journal-accounts";

export const CSV_IMPORT_KEYS = {
  all: ["csv-import"] as const,
  platforms: () => ["csv-import", "platforms"] as const,
};

export function useCSVPlatforms() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: CSV_IMPORT_KEYS.platforms(),
    queryFn: () => csvImportApi.listPlatforms(session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken,
  });
}

export function useCSVPreview() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (payload: { file: File; platformId: string; timezone: string }) =>
      csvImportApi.previewImport(
        payload.file,
        payload.platformId,
        payload.timezone,
        session?.accessToken as string,
      ),
  });
}

export function useCSVConfirm() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      file: File;
      platformId: string;
      timezone: string;
      displayName: string;
      accountId?: string;
    }) =>
      csvImportApi.confirmImport(payload, session?.accessToken as string),
    onSuccess: () => {
      // Invalidate journal accounts queries to refresh listing
      queryClient.invalidateQueries({
        queryKey: JOURNAL_ACCOUNT_KEYS.all,
      });
      // Invalidate calendar and day logs to reflect imported trades immediately
      queryClient.invalidateQueries({
        queryKey: ["journal-analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["journal-day"],
      });
    },
  });
}
