import test from "node:test";
import assert from "node:assert/strict";
import { completeOnboardingNavigation } from "./onboarding-completion.ts";

test("onboarding navigation continues when the session update stalls", async () => {
  let navigated = false;

  await completeOnboardingNavigation(
    () => new Promise(() => undefined),
    () => {
      navigated = true;
    },
    5,
  );

  assert.equal(navigated, true);
});

test("onboarding navigation waits for a successful session update", async () => {
  const events: string[] = [];

  await completeOnboardingNavigation(
    async () => {
      events.push("session");
    },
    () => {
      events.push("navigate");
    },
    50,
  );

  assert.deepEqual(events, ["session", "navigate"]);
});
