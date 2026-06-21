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

test("complete copy trading workflows are exposed", () => {
  const api = readFileSync(
    join(ROOT, "src/features/copy-trading/api.ts"),
    "utf8",
  );
  const page = readFileSync(
    join(ROOT, "src/features/copy-trading/copy-trading-page.tsx"),
    "utf8",
  );

  for (const contract of [
    "/copy-trading/telegram/connections",
    "/copy-trading/telegram/auth/phone",
    "/copy-trading/telegram/auth/qr",
    "/copy-trading/sources",
    "/copy-trading/emergency",
  ]) {
    assert.match(api, new RegExp(contract.replaceAll("/", "\\/")));
  }
  assert.match(page, /Connect Telegram/);
  assert.match(page, /Channel learning/);
  assert.match(page, /Emergency controls/);
});
