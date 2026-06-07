import test from "node:test";
import assert from "node:assert/strict";
import {
  ErrorCodes,
  extractValidationFieldErrors,
  normalizeError,
} from "./types.ts";

test("normalizeError handles FastAPI validation arrays", () => {
  const error = normalizeError(422, {
    detail: [
      {
        loc: ["body", "password"],
        msg: "Password must be strong.",
        type: "value_error",
      },
    ],
  });

  assert.equal(error.code, ErrorCodes.VALIDATION_ERROR);
  assert.equal(error.message, "Password must be strong.");
});

test("extractValidationFieldErrors maps field names to messages", () => {
  const fieldErrors = extractValidationFieldErrors({
    detail: [
      {
        loc: ["body", "password"],
        msg: "Password must be strong.",
        type: "value_error",
      },
      {
        loc: ["body", "email"],
        msg: "Invalid email address.",
        type: "value_error",
      },
    ],
  });

  assert.deepEqual(fieldErrors, {
    password: "Password must be strong.",
    email: "Invalid email address.",
  });
});
