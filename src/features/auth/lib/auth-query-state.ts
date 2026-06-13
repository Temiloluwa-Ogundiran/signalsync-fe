import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";

const AUTH_QUERY_KEYS = [
  ["journal-accounts"],
  ["journal-analytics"],
  ["journal-trade-history"],
  ["journal-day"],
  queryKeys.streams.mine(),
  queryKeys.streams.discover(),
  queryKeys.streams.detailRoot(),
  queryKeys.posts.mine(),
] as const;

export function resetAuthSensitiveQueries(queryClient: QueryClient) {
  for (const queryKey of AUTH_QUERY_KEYS) {
    queryClient.removeQueries({ queryKey: [...queryKey] });
  }
}

export function refreshAuthSensitiveQueries(queryClient: QueryClient) {
  for (const queryKey of AUTH_QUERY_KEYS) {
    queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }
}
