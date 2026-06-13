import test from "node:test";
import assert from "node:assert/strict";
import { isExpectedAuthFlowError } from "./auth-error-logging.ts";

test("isExpectedAuthFlowError returns true for credentials sign-in errors", () => {
  const error = new Error("invalid credentials") as Error & {
    type: string;
  };
  error.type = "CredentialsSignin";

  assert.equal(isExpectedAuthFlowError(error), true);
});

test("isExpectedAuthFlowError returns false for unexpected errors", () => {
  assert.equal(isExpectedAuthFlowError(new Error("boom")), false);
});
