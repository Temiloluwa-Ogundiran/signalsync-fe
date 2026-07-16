import test from "node:test";
import assert from "node:assert/strict";
import { isPublicBackendPath } from "./public-backend-paths.ts";

test("auth paths are public", () => {
  assert.equal(isPublicBackendPath("auth/login"), true);
  assert.equal(isPublicBackendPath("auth/register"), true);
});

test("product analytics ingestion is public but bounded to the exact path", () => {
  assert.equal(isPublicBackendPath("events"), true);
  assert.equal(isPublicBackendPath("events/private"), false);
});

test("protected backend paths are not public", () => {
  assert.equal(isPublicBackendPath("journal/trades"), false);
  assert.equal(isPublicBackendPath("users/me"), false);
});
