import test from "node:test";
import assert from "node:assert/strict";

import { resolveSubscriptionGate } from "./subscription-gate";

const activeCopy = {
  plan: "copy" as const,
  has_journal_access: true,
  has_copy_access: true,
};

test("session hydration never redirects to subscription", () => {
  assert.equal(
    resolveSubscriptionGate({
      pathname: "/copy-trading",
      sessionStatus: "loading",
      queryPending: false,
      queryError: false,
      subscription: undefined,
    }),
    "loading",
  );
});

test("copy access is evaluated only after subscription data settles", () => {
  assert.equal(
    resolveSubscriptionGate({
      pathname: "/copy-trading",
      sessionStatus: "authenticated",
      queryPending: false,
      queryError: false,
      subscription: activeCopy,
    }),
    "allow",
  );
  assert.equal(
    resolveSubscriptionGate({
      pathname: "/copy-trading",
      sessionStatus: "authenticated",
      queryPending: false,
      queryError: false,
      subscription: undefined,
    }),
    "redirect",
  );
});

test("subscription page remains reachable without an entitlement", () => {
  assert.equal(
    resolveSubscriptionGate({
      pathname: "/settings/subscription",
      sessionStatus: "authenticated",
      queryPending: true,
      queryError: false,
      subscription: undefined,
    }),
    "allow",
  );
});
