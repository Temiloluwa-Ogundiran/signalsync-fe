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
    "routes/copy-rule-form.tsx",
    "activity/activity-item.tsx",
    "emergency-actions-dialog.tsx",
  ]
    .map(feature)
    .join("\n");

  for (const contract of [
    "/copy-trading/settings",
    "/copy-trading/routes",
    "/copy-trading/connections",
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
    "Edit Copy Route",
    "Reveal source message",
    "Emergency actions",
  ]) {
    assert.match(ui, new RegExp(wording));
  }
  assert.doesNotMatch(api, /relearnSource/);
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
  assert.match(hooks, /refetchInterval: active \? 3_000 : false/);
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
  assert.match(feature("shared/field-help.tsx"), /Tooltip\.Portal/);
  assert.match(
    feature("emergency-actions-dialog.tsx"),
    /manual trades are never affected/i,
  );
  assert.match(feature("emergency-actions-dialog.tsx"), /Type EMERGENCY/);
});

test("guided setup exposes the approved journey and progressive controls", () => {
  const workspace = feature("setup/setup-workspace.tsx");
  const preferences = feature("setup/preferences-step.tsx");
  for (const heading of [
    "Connect Telegram",
    "Choose a signal channel",
    "Choose where trades should be copied",
    "Set your copying preferences",
    "Start copying",
  ]) {
    assert.match(workspace, new RegExp(heading));
  }
  assert.match(preferences, /Trade size/);
  assert.match(preferences, /Take-profit handling/);
  assert.match(preferences, /When to enter/);
  assert.match(preferences, /Enter immediately without SL or TP/);
  assert.match(preferences, /signal is marked as missed/);
  assert.match(preferences, /Advanced settings/);
  assert.match(preferences, /take_profit_mode === "all"/);
  assert.doesNotMatch(workspace, /channel analysis|confidence|unsupported/i);
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
  assert.match(feature("routes/copy-rules-page.tsx"), /Copy Routes/);
  assert.match(feature("routes/copy-rules-page.tsx"), /New Copy Route/);
  assert.match(feature("routes/copy-rules-page.tsx"), /CopyRouteMap/);
  assert.match(feature("activity/copy-activity-page.tsx"), /Copy Activity/);
  const settings = feature("settings/copy-trading-settings-page.tsx");
  assert.match(settings, /Telegram Connections/);
  assert.match(settings, /Signal Channels/);
  assert.match(settings, /Trading Accounts & Risk Limits/);
});

test("copy routes are graphical and account safety is configurable", () => {
  const routeMap = feature("routes/copy-route-map.tsx");
  const safety = feature("accounts/account-safety-form.tsx");
  const types = feature("types.ts");

  assert.match(routeMap, /Signal source/);
  assert.match(routeMap, /Trading account/);
  assert.match(routeMap, /How it copies/);
  assert.match(
    routeMap,
    /aria-label="Copy routes from Telegram to trading accounts"/,
  );
  assert.match(safety, /Maximum Size for 1 Trade/);
  assert.match(safety, /Stop After Today's Loss/);
  assert.match(safety, /Maximum Equity Drawdown/);
  assert.match(safety, /Newest Signal Age/);
  assert.match(types, /market_signal_max_age_seconds/);
});

test("failed copy events expose a controlled single retry", () => {
  const recovery = feature("activity/failed-event-recovery.tsx");
  const activity = feature("activity/copy-activity-page.tsx");

  assert.match(activity, /FailedEventRecovery/);
  assert.match(recovery, /Review & Retry/);
  assert.match(recovery, /1 automatic retry/i);
  assert.match(recovery, /ConfirmActionDialog/);
});

test("copy trading page is thin orchestration after decomposition", () => {
  const page = feature("copy-trading-page.tsx");
  assert.match(page, /deriveCopyTradingMode/);
  assert.match(page, /view === "settings"/);
  assert.ok(page.split("\n").length < 220);
});

test("runtime health and recovery APIs are exposed", () => {
  const api = feature("api.ts");
  const hooks = feature("hooks.ts");

  assert.match(api, /getHealth/);
  assert.match(api, /\/copy-trading\/health/);
  assert.match(api, /\/copy-trading\/launch-readiness/);
  assert.match(api, /listDeadLetters/);
  assert.match(api, /replayDeadLetter/);
  assert.match(hooks, /useCopySystemHealth/);
  assert.match(hooks, /refetchInterval: active \? 15_000 : false/);
  assert.match(hooks, /useCopyLaunchReadiness/);
});

test("activity uses server filters and cursor pagination", () => {
  const api = feature("api.ts");
  const hooks = feature("hooks.ts");
  const activity = feature("activity/copy-activity-page.tsx");

  assert.match(api, /CopyActivityPage/);
  assert.match(api, /params/);
  assert.match(api, /cursor/);
  assert.match(hooks, /useInfiniteQuery/);
  assert.match(hooks, /getNextPageParam/);
  assert.match(activity, /Load More Activity/);
  assert.doesNotMatch(activity, /events\.filter/);
});

test("one failed query does not blank the entire workspace", () => {
  const page = feature("copy-trading-page.tsx");

  assert.doesNotMatch(page, /queries\.some\(\(query\) => query\.isError\)/);
  assert.doesNotMatch(page, /queries\.some\(\(query\) => query\.isLoading\)/);
  assert.match(page, /SectionError/);
});

test("destructive operations require confirmation and routes have a real menu", () => {
  const settings = feature("settings/copy-trading-settings-page.tsx");
  const routes = feature("routes/copy-rules-page.tsx");
  const routeMap = feature("routes/copy-route-map.tsx");
  const dialog = feature("shared/confirm-action-dialog.tsx");

  assert.match(settings, /ConfirmActionDialog/);
  assert.match(routeMap, /DropdownMenu/);
  assert.match(routes, /ConfirmActionDialog/);
  assert.match(dialog, /confirmText/);
});

test("copy trading uses one feature-level tooltip provider", () => {
  assert.match(feature("copy-trading-shell.tsx"), /Tooltip\.Provider/);
  assert.doesNotMatch(feature("shared/field-help.tsx"), /Tooltip\.Provider/);
});

test("signal channels are never gated by historical analysis", () => {
  const settings = feature("settings/copy-trading-settings-page.tsx");
  const workspace = feature("setup/setup-workspace.tsx");
  const picker = feature("setup/channel-picker.tsx");

  for (const ui of [settings, workspace, picker]) {
    assert.doesNotMatch(
      ui,
      /Analyze again|analysis started|unsupported|confidence/i,
    );
  }
});

test("copy trading uses independent MetaApi connections", () => {
  const settings = feature("settings/copy-trading-settings-page.tsx");
  const api = feature("api.ts");
  const types = feature("types.ts");

  assert.match(settings, /Connect copy account/);
  assert.match(api, /createCopyConnection/);
  assert.match(api, /retryCopyConnection/);
  assert.match(api, /deleteCopyConnection/);
  assert.match(types, /target_connection_id/);
  assert.doesNotMatch(api, /enableTraderAccess/);
  assert.doesNotMatch(api, /listTargetAccounts/);
});
