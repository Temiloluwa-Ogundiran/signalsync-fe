import test from "node:test";
import assert from "node:assert/strict";
import { resetAuthSensitiveQueries } from "./auth-query-state.ts";
import { queryKeys } from "@/lib/api/query-keys";

test("resetAuthSensitiveQueries clears auth-sensitive query keys", () => {
  const calls: Array<unknown> = [];
  const queryClient = {
    removeQueries: (args: unknown) => calls.push(args),
  } as const;

  resetAuthSensitiveQueries(queryClient as never);

  assert.deepEqual(calls, [
    { queryKey: ["journal-accounts"] },
    { queryKey: ["journal-analytics"] },
    { queryKey: ["journal-trade-history"] },
    { queryKey: ["journal-day"] },
    { queryKey: queryKeys.streams.mine() },
    { queryKey: queryKeys.streams.discover() },
    { queryKey: queryKeys.streams.detailRoot() },
    { queryKey: queryKeys.posts.mine() },
  ]);
});
