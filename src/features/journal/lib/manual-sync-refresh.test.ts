import assert from "node:assert/strict";
import test from "node:test";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { refreshJournalQueriesAfterManualSync } from "./manual-sync-refresh";

const journalPrefixes = [
  "journal-accounts",
  "journal-analytics",
  "journal-trade-history",
  "journal-open-positions",
  "journal-day",
  "journal-curve",
  "journal-feed",
] as const;

test("manual sync refresh covers every trade-derived journal query", async () => {
  const invalidatedPrefixes: string[] = [];
  let activeRefetchPredicate:
    | ((query: { queryKey: QueryKey }) => boolean)
    | undefined;

  const queryClient = {
    invalidateQueries: async ({
      predicate,
    }: {
      predicate: (query: { queryKey: QueryKey }) => boolean;
    }) => {
      for (const prefix of journalPrefixes) {
        if (predicate({ queryKey: [prefix] })) invalidatedPrefixes.push(prefix);
      }
    },
    refetchQueries: async ({
      predicate,
    }: {
      predicate: (query: { queryKey: QueryKey }) => boolean;
    }) => {
      activeRefetchPredicate = predicate;
    },
  } as unknown as QueryClient;

  await refreshJournalQueriesAfterManualSync(queryClient);

  assert.deepEqual(
    new Set(invalidatedPrefixes),
    new Set(journalPrefixes),
  );
  assert.ok(activeRefetchPredicate);
  assert.equal(activeRefetchPredicate({ queryKey: ["journal-curve"] }), true);
  assert.equal(activeRefetchPredicate({ queryKey: ["unrelated"] }), false);
});
