import test from "node:test";
import assert from "node:assert/strict";
import { isPublicBackendPath } from "./public-backend-paths.ts";

test("username availability checks are public", () => {
  assert.equal(isPublicBackendPath("users/check-username"), true);
});

test("protected backend paths are not public", () => {
  assert.equal(isPublicBackendPath("journal/trades"), false);
});
