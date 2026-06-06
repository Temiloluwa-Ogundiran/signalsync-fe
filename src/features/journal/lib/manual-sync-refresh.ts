import type { QueryClient, QueryKey } from "@tanstack/react-query";

function isMatchingQuery(
  queryKey: QueryKey,
  prefixes: readonly string[],
): boolean {
  return Array.isArray(queryKey) && prefixes.includes(String(queryKey[0]));
}

export async function refreshJournalQueriesAfterManualSync(
  queryClient: QueryClient,
) {
  const prefixes = [
    "journal-accounts",
    "journal-analytics",
    "journal-trade-history",
    "journal-day",
  ] as const;

  await Promise.all(
    prefixes.map((prefix) =>
      queryClient.invalidateQueries({
        predicate: (query) => isMatchingQuery(query.queryKey, [prefix]),
      }),
    ),
  );

  await queryClient.refetchQueries({
    predicate: (query) => isMatchingQuery(query.queryKey, prefixes),
    type: "active",
  });
}
