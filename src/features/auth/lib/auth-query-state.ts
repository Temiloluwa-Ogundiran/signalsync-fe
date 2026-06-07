import type { QueryClient } from "@tanstack/react-query";

const AUTH_QUERY_KEYS = [
  ["journal-accounts"],
  ["journal-analytics"],
  ["journal-trade-history"],
  ["journal-day"],
  ["my-streams"],
  ["discover-streams"],
  ["stream-detail"],
  ["my-posts"],
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
