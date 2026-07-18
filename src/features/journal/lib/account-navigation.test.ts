import assert from "node:assert/strict";
import test from "node:test";
import { dashboardPathForAccount } from "./account-navigation";

test("newly connected account replaces the account id in the dashboard URL", () => {
  const path = dashboardPathForAccount(
    new URLSearchParams("accountId=old-demo&fromDate=2026-07-01"),
    "new-live-account",
  );

  assert.equal(
    path,
    "/dashboard?accountId=new-live-account&fromDate=2026-07-01",
  );
});
