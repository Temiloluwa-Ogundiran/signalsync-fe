import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

test("copy trading navigation and API contracts are wired", () => {
  const nav = readFileSync(
    join(ROOT, "src/components/layout/nav-registry.ts"),
    "utf8",
  );
  const api = readFileSync(
    join(ROOT, "src/features/copy-trading/api.ts"),
    "utf8",
  );

  assert.match(nav, /id: "copy-trading"/);
  assert.match(nav, /route: "\/copy-trading"/);
  assert.match(api, /"\/copy-trading\/settings"/);
  assert.match(api, /"\/copy-trading\/routes"/);
  assert.match(api, /"\/copy-trading\/activity"/);
  assert.equal(api.includes("accessToken,"), false);
});
