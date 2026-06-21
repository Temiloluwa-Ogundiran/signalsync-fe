import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const feature = (file: string) =>
  readFileSync(join(ROOT, "src/features/copy-trading", file), "utf8");

test("copy trading API and complete workflows remain exposed", () => {
  const api = feature("api.ts");
  const ui = [
    "setup/setup-workspace.tsx",
    "setup/channel-analysis-step.tsx",
    "routes/copy-rule-form.tsx",
    "activity/activity-item.tsx",
    "emergency-actions-dialog.tsx",
  ]
    .map(feature)
    .join("\n");

  for (const contract of [
    "/copy-trading/settings",
    "/copy-trading/routes",
    "/copy-trading/activity",
    "/copy-trading/telegram/connections",
    "/copy-trading/telegram/auth/phone",
    "/copy-trading/telegram/auth/qr",
    "/copy-trading/sources",
    "/copy-trading/emergency",
  ]) {
    assert.match(api, new RegExp(contract.replaceAll("/", "\\/")));
  }
  for (const wording of [
    "Connect Telegram",
    "Analyze again",
    "Edit copy rule",
    "Reveal source message",
    "Emergency actions",
  ]) {
    assert.match(ui, new RegExp(wording));
  }
  assert.match(api, /relearnSource/);
  assert.match(api, /updateRoute/);
  assert.match(api, /deleteRoute/);
  assert.equal(api.includes("accessToken,"), false);
});

test("Telegram source search refreshes the live dialog list", () => {
  const hooks = feature("hooks.ts");
  const picker = feature("setup/channel-picker.tsx");
  assert.match(
    hooks,
    /useTelegramDialogs\(connectionId\?: string, active = true\)/,
  );
  assert.match(hooks, /enabled: enabled && active && !!connectionId/);
  assert.match(hooks, /refetchInterval: active \? 15_000 : false/);
  assert.match(picker, /useTelegramDialogs\(connectionId, open\)/);
  assert.match(picker, /Refresh channels and groups/);
});

test("copy trading navigation uses the approved information architecture", () => {
  const nav = readFileSync(
    join(ROOT, "src/components/layout/nav-registry.ts"),
    "utf8",
  );
  for (const label of ["Overview", "Routes", "Activity", "Settings"]) {
    assert.match(nav, new RegExp(`label: "${label}"`));
  }
  assert.doesNotMatch(
    nav,
    /label: "Accounts", route: "\/copy-trading\/accounts"/,
  );
  assert.match(
    readFileSync(
      join(ROOT, "src/app/(dashboard)/copy-trading/settings/page.tsx"),
      "utf8",
    ),
    /view="settings"/,
  );
});

test("safety and help components use impact-focused wording", () => {
  assert.match(feature("copy-safety-bar.tsx"), /Pause copying/);
  assert.match(feature("copy-safety-bar.tsx"), /Emergency actions/);
  assert.match(feature("shared/field-help.tsx"), /role="tooltip"/);
  assert.match(feature("shared/field-help.tsx"), /aria-describedby/);
  assert.match(
    feature("emergency-actions-dialog.tsx"),
    /manual trades are never affected/i,
  );
  assert.match(feature("emergency-actions-dialog.tsx"), /Type EMERGENCY/);
});

test("guided setup exposes the approved journey and progressive controls", () => {
  const workspace = feature("setup/setup-workspace.tsx");
  const preferences = feature("setup/preferences-step.tsx");
  const analysis = feature("setup/channel-analysis-step.tsx");
  for (const heading of [
    "Connect Telegram",
    "Choose a signal channel",
    "Review how this channel sends signals",
    "Choose where trades should be copied",
    "Set your copying preferences",
    "Start copying",
  ]) {
    assert.match(workspace, new RegExp(heading));
  }
  assert.match(preferences, /Trade size/);
  assert.match(preferences, /Take-profit handling/);
  assert.match(preferences, /Advanced settings/);
  assert.match(preferences, /take_profit_mode === "all"/);
  assert.match(
    analysis,
    /Copying is available, but review activity closely/,
  );
});

test("copy rule minimum details match the backend enum contract", () => {
  const preferences = feature("setup/preferences-step.tsx");
  for (const value of [
    "direction_symbol",
    "direction_symbol_entry",
    "direction_symbol_sl",
    "direction_symbol_tp",
    "direction_symbol_sl_tp",
  ]) {
    assert.match(preferences, new RegExp(`value=\"${value}\"`));
  }
  assert.match(preferences, /minimum_fields: "direction_symbol_sl_tp"/);
  assert.doesNotMatch(preferences, /value="direction,/);
});

test("monitoring, rules, activity, and settings use the approved hierarchy", () => {
  assert.match(feature("overview/monitoring-overview.tsx"), /Live activity/);
  assert.match(feature("overview/monitoring-overview.tsx"), /HealthStrip/);
  assert.match(feature("routes/copy-rules-page.tsx"), /Copy Rules/);
  assert.match(feature("routes/copy-rules-page.tsx"), /New copy rule/);
  assert.match(feature("activity/copy-activity-page.tsx"), /Copy Activity/);
  const settings = feature("settings/copy-trading-settings-page.tsx");
  assert.match(settings, /Telegram accounts/);
  assert.match(settings, /Signal channels/);
  assert.match(settings, /Trading accounts/);
});

test("copy trading page is thin orchestration after decomposition", () => {
  const page = feature("copy-trading-page.tsx");
  assert.match(page, /deriveCopyTradingMode/);
  assert.match(page, /view === "settings"/);
  assert.ok(page.split("\n").length < 220);
});
