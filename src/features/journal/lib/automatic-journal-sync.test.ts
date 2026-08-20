import assert from "node:assert/strict";
import test from "node:test";
import type { JournalAccount } from "../types";
import {
  JOURNAL_AUTO_SYNC_INTERVAL_MS,
  shouldStartAutomaticJournalSync,
} from "./automatic-journal-sync";

const readyAccount = (overrides: Partial<JournalAccount> = {}) =>
  ({
    import_method: "auto_sync",
    connection_state: "ready",
    next_sync_not_before: null,
    is_demo: false,
    ...overrides,
  }) as Pick<
    JournalAccount,
    "import_method" | "connection_state" | "next_sync_not_before" | "is_demo"
  >;

test("automatic journal sync starts when the visible account is due", () => {
  assert.equal(
    shouldStartAutomaticJournalSync({
      account: readyAccount(),
      nowMs: 10_000,
      lastAutomaticSyncAtMs: null,
      isVisible: true,
      isSyncBusy: false,
      isConnectionPending: false,
    }),
    true,
  );
});

test("automatic journal sync respects the five-minute client interval", () => {
  assert.equal(
    shouldStartAutomaticJournalSync({
      account: readyAccount(),
      nowMs: JOURNAL_AUTO_SYNC_INTERVAL_MS - 1,
      lastAutomaticSyncAtMs: 0,
      isVisible: true,
      isSyncBusy: false,
      isConnectionPending: false,
    }),
    false,
  );
  assert.equal(
    shouldStartAutomaticJournalSync({
      account: readyAccount(),
      nowMs: JOURNAL_AUTO_SYNC_INTERVAL_MS,
      lastAutomaticSyncAtMs: 0,
      isVisible: true,
      isSyncBusy: false,
      isConnectionPending: false,
    }),
    true,
  );
});

test("automatic journal sync skips hidden, busy, demo, and cooldown accounts", () => {
  const base = {
    nowMs: 10_000,
    lastAutomaticSyncAtMs: null,
    isVisible: true,
    isSyncBusy: false,
    isConnectionPending: false,
  };

  for (const options of [
    { isVisible: false },
    { isSyncBusy: true },
    { account: readyAccount({ is_demo: true }) },
    { account: readyAccount({ connection_state: "bootstrapping" }) },
    {
      account: readyAccount({
        next_sync_not_before: new Date(20_000).toISOString(),
      }),
    },
  ]) {
    assert.equal(
      shouldStartAutomaticJournalSync({
        ...base,
        account: readyAccount(),
        ...options,
      }),
      false,
    );
  }
});
