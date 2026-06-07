import test from "node:test";
import assert from "node:assert/strict";
import {
  PASSWORD_POLICY_MESSAGE,
  isStrongPassword,
  registerPasswordSchema,
} from "./password-policy.ts";

test("isStrongPassword rejects weak passwords", () => {
  assert.equal(isStrongPassword("password"), false);
  assert.equal(isStrongPassword("PASSWORD123"), false);
  assert.equal(isStrongPassword("Password"), false);
  assert.equal(isStrongPassword("pass1234"), false);
});

test("registerPasswordSchema accepts strong passwords", () => {
  assert.equal(registerPasswordSchema.parse("Password123"), "Password123");
});

test("registerPasswordSchema returns the shared policy message", () => {
  const result = registerPasswordSchema.safeParse("password");

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.message, PASSWORD_POLICY_MESSAGE);
  }
});
