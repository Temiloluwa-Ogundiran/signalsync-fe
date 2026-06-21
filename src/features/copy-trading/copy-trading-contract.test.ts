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
  assert.match(page, /Analyze channel/);
  assert.match(page, /Edit copy route/);
  assert.match(page, /Reveal source message/);
  assert.match(page, /Emergency controls/);
  assert.match(api, /relearnSource/);
  assert.match(api, /updateRoute/);
  assert.match(api, /deleteRoute/);
  assert.match(page, /Channel learning/);
});

test("Telegram source search refreshes the live dialog list", () => {
  const hooks = readFileSync(
    join(ROOT, "src/features/copy-trading/hooks.ts"),
    "utf8",
  );
  const page = readFileSync(
    join(ROOT, "src/features/copy-trading/copy-trading-page.tsx"),
    "utf8",
  );

  assert.match(hooks, /useTelegramDialogs\(connectionId\?: string, active = true\)/);
  assert.match(hooks, /enabled: enabled && active && !!connectionId/);
  assert.equal(hooks.includes("refetchInterval: 10000"), false);
  assert.match(hooks, /refetchInterval: active \? 15_000 : false/);
  assert.match(page, /useTelegramDialogs\(connectionId, open\)/);
  assert.match(page, /Refresh channels and groups/);
});

test("copy trading navigation uses the approved information architecture", () => {
  const nav = readFileSync(
    join(ROOT, "src/components/layout/nav-registry.ts"),
    "utf8",
  );
  const settingsPage = readFileSync(
    join(ROOT, "src/app/(dashboard)/copy-trading/settings/page.tsx"),
    "utf8",
  );
  const legacyPage = readFileSync(
    join(ROOT, "src/app/(dashboard)/copy-trading/accounts/page.tsx"),
    "utf8",
  );

  for (const label of ["Overview", "Routes", "Activity", "Settings"]) {
    assert.match(nav, new RegExp(`label: "${label}"`));
  }
  assert.doesNotMatch(
    nav,
    /label: "Accounts", route: "\/copy-trading\/accounts"/,
  );
  assert.match(settingsPage, /view="settings"/);
  assert.match(legacyPage, /redirect\("\/copy-trading\/settings"\)/);
});
