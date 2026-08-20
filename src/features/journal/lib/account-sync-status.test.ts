import assert from "node:assert/strict";
import test from "node:test";
import type { JournalAccount } from "../types";
import { shouldOfferManualJournalResync } from "./account-sync-status";

const account = (overrides: Partial<JournalAccount> = {}) =>
  ({
    import_method: "auto_sync",
    connection_state: "ready",
    last_sync_outcome: null,
    sync_error_message: null,
    bootstrap_error_message: null,
    sync_status: null,
    ...overrides,
  }) as JournalAccount;

test("healthy automatically synced accounts do not expose manual resync", () => {
  assert.equal(shouldOfferManualJournalResync(account()), false);
  assert.equal(
    shouldOfferManualJournalResync(account({ last_sync_outcome: "success_empty" })),
    false,
  );
});

test("manual resync remains available as recovery for failed MT5 syncs", () => {
  assert.equal(
    shouldOfferManualJournalResync(
      account({ connection_state: "bootstrap_failed" }),
    ),
    true,
  );
  assert.equal(
    shouldOfferManualJournalResync(
      account({ connection_state: "verification_failed" }),
    ),
    true,
  );
});

test("manual resync is never offered for CSV accounts", () => {
  assert.equal(
    shouldOfferManualJournalResync(
      account({ import_method: "csv_upload", connection_state: "ready" }),
    ),
    false,
  );
});
