import test from "node:test";
import assert from "node:assert/strict";

import { copyAccountPresentation } from "./copy-account-presentation";

test("provisioning states explain progress in customer language", () => {
  assert.deepEqual(copyAccountPresentation("provisioning"), {
    label: "Finding broker server",
    description: "MetaApi is locating the broker and verifying the MT5 account details.",
    progress: 25,
    tone: "working",
  });
  assert.equal(copyAccountPresentation("connecting").label, "Connecting to broker");
  assert.equal(copyAccountPresentation("synchronizing").progress, 85);
});

test("credential failure tells the user exactly what to change", () => {
  const result = copyAccountPresentation("invalid_credentials");

  assert.equal(result.tone, "action");
  assert.match(result.description, /master password/i);
});
