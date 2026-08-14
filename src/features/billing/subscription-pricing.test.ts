import assert from "node:assert/strict";
import test from "node:test";

import {
  copyMonthlyPrice,
  normalizeCopyAccountCount,
  planRequest,
} from "./subscription-pricing";

test("copy trading includes one account at 30 dollars", () => {
  assert.equal(copyMonthlyPrice(1), 30);
});

test("each additional copy account costs 20 dollars", () => {
  assert.equal(copyMonthlyPrice(2), 50);
  assert.equal(copyMonthlyPrice(10), 210);
});

test("copy account count is clamped to supported tiers", () => {
  assert.equal(normalizeCopyAccountCount(0), 1);
  assert.equal(normalizeCopyAccountCount(14), 10);
  assert.deepEqual(planRequest("copy", 0), { plan: "copy", copy_accounts: 1 });
  assert.deepEqual(planRequest("copy", 14), { plan: "copy", copy_accounts: 10 });
});

test("journal checkout ignores copy account count", () => {
  assert.deepEqual(planRequest("journal", 7), {
    plan: "journal",
    copy_accounts: 1,
  });
});
