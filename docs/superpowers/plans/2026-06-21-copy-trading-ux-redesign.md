# Copy Trading UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Copy Trading control center with an adaptive guided setup and live operations workspace that uses trader-friendly wording, progressive disclosure, actionable failures, and TradePartna's existing design system.

**Architecture:** Keep the existing backend API and React Query hooks, but replace the 1,500-line page with a thin shell and focused setup, activity, route, settings, safety, and shared components. Compute setup progress and health through pure view-model helpers so behavior is testable without a browser, then verify the assembled experience through production builds and desktop/mobile browser screenshots.

**Tech Stack:** Next.js 16, React 19, TypeScript, TanStack Query, Tailwind CSS 4, Radix-based local UI primitives, Lucide and Hugeicons, Node test runner through `tsx`.

---

## File Structure

Create or change the following files. Each file has one primary responsibility.

### App routes and navigation

- Modify: `src/components/layout/nav-registry.ts`
  - Change Copy Trading navigation to Overview, Routes, Activity, Settings.
- Modify: `src/app/(dashboard)/copy-trading/accounts/page.tsx`
  - Redirect legacy account-control links to Copy Trading Settings.
- Create: `src/app/(dashboard)/copy-trading/settings/page.tsx`
  - Render the Settings view.

### Feature composition

- Replace: `src/features/copy-trading/copy-trading-page.tsx`
  - Retain only query orchestration, page metadata, and view selection.
- Create: `src/features/copy-trading/copy-trading-shell.tsx`
  - Own the page header, persistent safety bar, Telegram sign-in dialog, and page content frame.
- Create: `src/features/copy-trading/copy-safety-bar.tsx`
  - Derive and render overall automation health, pause/resume, and emergency entry.
- Create: `src/features/copy-trading/copy-trading-view-model.ts`
  - Pure setup, health, wording, route-summary, and activity-grouping helpers.
- Create: `src/features/copy-trading/copy-trading-view-model.test.ts`
  - Test adaptive mode, health, terminology, summaries, and grouped activity.

### Shared feature UI

- Create: `src/features/copy-trading/shared/status-label.tsx`
- Create: `src/features/copy-trading/shared/field-help.tsx`
- Create: `src/features/copy-trading/shared/empty-state.tsx`
- Create: `src/features/copy-trading/shared/form-controls.tsx`
  - Feature-local Field, Select, Toggle, and section primitives.

### Setup journey

- Create: `src/features/copy-trading/setup/setup-workspace.tsx`
- Create: `src/features/copy-trading/setup/setup-step.tsx`
- Create: `src/features/copy-trading/setup/telegram-step.tsx`
- Create: `src/features/copy-trading/setup/channel-step.tsx`
- Create: `src/features/copy-trading/setup/channel-picker.tsx`
- Create: `src/features/copy-trading/setup/channel-analysis-step.tsx`
- Create: `src/features/copy-trading/setup/account-step.tsx`
- Create: `src/features/copy-trading/setup/preferences-step.tsx`
- Create: `src/features/copy-trading/setup/review-step.tsx`
- Create: `src/features/copy-trading/setup/telegram-sign-in-dialog.tsx`

### Monitoring and activity

- Create: `src/features/copy-trading/overview/monitoring-overview.tsx`
- Create: `src/features/copy-trading/overview/health-strip.tsx`
- Create: `src/features/copy-trading/overview/attention-list.tsx`
- Create: `src/features/copy-trading/activity/activity-feed.tsx`
- Create: `src/features/copy-trading/activity/activity-item.tsx`
- Create: `src/features/copy-trading/activity/activity-filters.tsx`
- Create: `src/features/copy-trading/activity/copy-activity-page.tsx`

### Rules and settings

- Create: `src/features/copy-trading/routes/copy-rules-page.tsx`
- Create: `src/features/copy-trading/routes/copy-rule-row.tsx`
- Create: `src/features/copy-trading/routes/copy-rule-form.tsx`
- Create: `src/features/copy-trading/settings/copy-trading-settings-page.tsx`
- Create: `src/features/copy-trading/settings/telegram-account-list.tsx`
- Create: `src/features/copy-trading/settings/signal-channel-list.tsx`
- Create: `src/features/copy-trading/settings/trading-account-list.tsx`
- Create: `src/features/copy-trading/emergency-actions-dialog.tsx`

### Existing contracts

- Modify: `src/features/copy-trading/types.ts`
  - Add feature-local derived types without changing API payload types.
- Modify: `src/features/copy-trading/hooks.ts`
  - Keep query contracts; expose focused invalidation helpers if composition needs them.
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`
  - Lock navigation, component boundaries, user wording, and live Telegram search behavior.

No backend changes are required for this redesign. Do not add inactive notification-default controls because no user-level defaults API currently exists.

---

### Task 1: Add Pure Adaptive-Journey And Health View Models

**Files:**
- Create: `src/features/copy-trading/copy-trading-view-model.ts`
- Create: `src/features/copy-trading/copy-trading-view-model.test.ts`
- Modify: `src/features/copy-trading/types.ts`

- [ ] **Step 1: Write failing tests for setup mode, monitoring mode, and degraded health**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveAutomationHealth,
  deriveCopyTradingMode,
  humanizeActivity,
  summarizeCopyRule,
} from "./copy-trading-view-model";

test("uses setup mode until a copy rule is active", () => {
  assert.equal(deriveCopyTradingMode([]), "setup");
  assert.equal(
    deriveCopyTradingMode([{ state: "ready" }]),
    "setup",
  );
  assert.equal(
    deriveCopyTradingMode([{ state: "active" }]),
    "monitoring",
  );
});

test("reports degraded health without claiming all copying stopped", () => {
  const health = deriveAutomationHealth({
    globallyPaused: false,
    routes: [
      { state: "active", source_id: "source-1", target_account_id: "account-1" },
      { state: "target_unavailable", source_id: "source-2", target_account_id: "account-2" },
    ],
    connections: [{ state: "ready", is_paused: false }],
    sources: [
      { id: "source-1", state: "active", is_paused: false },
      { id: "source-2", state: "ready", is_paused: false },
    ],
  });

  assert.equal(health.tone, "warning");
  assert.equal(health.label, "Some copy rules need attention");
  assert.match(health.description, /Healthy rules will continue/);
});

test("translates internal activity into trader-friendly status", () => {
  assert.deepEqual(
    humanizeActivity({
      action: "broker.uncertain",
      title: "Confirming broker status",
      parsed_details: { action: "open_market", direction: "buy", symbol: "XAUUSD" },
    }),
    {
      actionLabel: "Buy XAUUSD",
      statusLabel: "Confirming broker result",
    },
  );
});

test("summarizes a copy rule in plain language", () => {
  assert.equal(
    summarizeCopyRule({
      fixed_lot: "0.10",
      take_profit_mode: "all",
      lot_distribution: "split_total",
      pending_orders_enabled: true,
    }),
    "0.10 lots · Every take profit · Total size split · Pending orders allowed",
  );
});
```

- [ ] **Step 2: Run the tests and verify they fail because the module is missing**

Run:

```powershell
npx tsx --test src/features/copy-trading/copy-trading-view-model.test.ts
```

Expected: FAIL with `Cannot find module './copy-trading-view-model'`.

- [ ] **Step 3: Add derived types and the minimal pure implementation**

Add to `types.ts`:

```ts
export type CopyTradingMode = "setup" | "monitoring";

export type AutomationHealthTone = "success" | "warning" | "neutral" | "danger";

export interface AutomationHealth {
  tone: AutomationHealthTone;
  label: string;
  description: string;
}

export interface ActivityPresentation {
  actionLabel: string;
  statusLabel: string;
}
```

Implement `copy-trading-view-model.ts` with:

```ts
import type {
  ActivityPresentation,
  AutomationHealth,
  CopyRoute,
  CopyTradingMode,
  TelegramConnection,
  TelegramSource,
} from "./types";

type RouteStateOnly = Pick<CopyRoute, "state">;

export function deriveCopyTradingMode(
  routes: RouteStateOnly[],
): CopyTradingMode {
  return routes.some((route) => route.state === "active")
    ? "monitoring"
    : "setup";
}

export function deriveAutomationHealth(input: {
  globallyPaused: boolean;
  routes: Pick<CopyRoute, "state" | "source_id" | "target_account_id">[];
  connections: Pick<TelegramConnection, "state" | "is_paused">[];
  sources: Pick<TelegramSource, "id" | "state" | "is_paused">[];
}): AutomationHealth {
  if (input.globallyPaused) {
    return {
      tone: "neutral",
      label: "Copying is paused",
      description: "New signals will not be sent to trading accounts.",
    };
  }

  const activeCount = input.routes.filter((route) => route.state === "active").length;
  const blockedRoutes = input.routes.filter((route) =>
    ["reauthentication_required", "unsupported", "target_unavailable"].includes(route.state),
  );
  const hasConnectionIssue = input.connections.some(
    (connection) => connection.state !== "ready" || connection.is_paused,
  );

  if (activeCount === 0 && (blockedRoutes.length > 0 || hasConnectionIssue)) {
    return {
      tone: "danger",
      label: "Copying has stopped",
      description: "Fix the affected Telegram or trading account connection.",
    };
  }
  if (blockedRoutes.length > 0 || hasConnectionIssue) {
    return {
      tone: "warning",
      label: "Some copy rules need attention",
      description: "Healthy rules will continue copying.",
    };
  }
  return {
    tone: "success",
    label: "Copying is active",
    description: "Signals can be read and sent to connected accounts.",
  };
}

export function humanizeActivity(event: {
  action: string;
  title: string;
  parsed_details: Record<string, unknown>;
}): ActivityPresentation {
  const direction = String(event.parsed_details.direction ?? "");
  const symbol = String(event.parsed_details.symbol ?? "");
  const actionLabel = direction && symbol
    ? `${direction === "buy" ? "Buy" : "Sell"} ${symbol}`
    : event.title;
  const statusMap: Record<string, string> = {
    "signal.validated": "Signal understood",
    "signal.waiting": "Waiting for details",
    "broker.uncertain": "Confirming broker result",
    "broker.succeeded": "Trade completed",
    "broker.failed": "Trade failed",
    "signal.skipped": "Signal skipped",
  };
  return {
    actionLabel,
    statusLabel: statusMap[event.action] ?? event.title,
  };
}

export function summarizeCopyRule(
  route: Pick<
    CopyRoute,
    "fixed_lot" | "take_profit_mode" | "lot_distribution" | "pending_orders_enabled"
  >,
): string {
  const takeProfit = route.take_profit_mode === "all"
    ? "Every take profit"
    : route.take_profit_mode === "lowest"
      ? "Nearest take profit"
      : "Furthest take profit";
  const sizing = route.take_profit_mode === "all"
    ? route.lot_distribution === "split_total"
      ? "Total size split"
      : "Full size per position"
    : null;
  return [
    `${Number(route.fixed_lot).toFixed(2)} lots`,
    takeProfit,
    sizing,
    route.pending_orders_enabled ? "Pending orders allowed" : "Market orders only",
  ].filter(Boolean).join(" · ");
}
```

- [ ] **Step 4: Run the pure tests**

Run:

```powershell
npx tsx --test src/features/copy-trading/copy-trading-view-model.test.ts
```

Expected: all four tests PASS.

- [ ] **Step 5: Commit the view-model foundation**

```powershell
git add src/features/copy-trading/types.ts src/features/copy-trading/copy-trading-view-model.ts src/features/copy-trading/copy-trading-view-model.test.ts
git commit -m "refactor(copy-trading): add adaptive workspace view models"
```

---

### Task 2: Update Navigation And Preserve Legacy Links

**Files:**
- Modify: `src/components/layout/nav-registry.ts`
- Create: `src/app/(dashboard)/copy-trading/settings/page.tsx`
- Modify: `src/app/(dashboard)/copy-trading/accounts/page.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Extend the contract test with the approved navigation**

Add:

```ts
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
  assert.doesNotMatch(nav, /label: "Accounts".*copy-trading/s);
  assert.match(settingsPage, /view="settings"/);
  assert.match(legacyPage, /redirect\("\/copy-trading\/settings"\)/);
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run:

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
```

Expected: FAIL because Settings does not exist and Accounts remains in navigation.

- [ ] **Step 3: Change the navigation and route files**

Use the existing Hugeicons imports:

```ts
{
  id: "copy-trading",
  name: "Copy Trading",
  icon: Exchange01Icon,
  route: "/copy-trading",
  groups: [
    {
      items: [
        { icon: Home04Icon, label: "Overview", route: "/copy-trading" },
        { icon: StrategyIcon, label: "Routes", route: "/copy-trading/routes" },
        { icon: Clock01Icon, label: "Activity", route: "/copy-trading/activity" },
        { icon: Settings01Icon, label: "Settings", route: "/copy-trading/settings" },
      ],
    },
  ],
}
```

Create the Settings page:

```tsx
import { CopyTradingPage } from "@/features/copy-trading/copy-trading-page";

export default function Page() {
  return <CopyTradingPage view="settings" />;
}
```

Replace the Accounts page:

```tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/copy-trading/settings");
}
```

- [ ] **Step 4: Run the contract test**

Run:

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit navigation**

```powershell
git add src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading/settings/page.tsx' 'src/app/(dashboard)/copy-trading/accounts/page.tsx' src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): simplify workspace navigation"
```

---

### Task 3: Create Shared Primitives And The Persistent Safety Bar

**Files:**
- Create: `src/features/copy-trading/shared/status-label.tsx`
- Create: `src/features/copy-trading/shared/field-help.tsx`
- Create: `src/features/copy-trading/shared/empty-state.tsx`
- Create: `src/features/copy-trading/shared/form-controls.tsx`
- Create: `src/features/copy-trading/emergency-actions-dialog.tsx`
- Create: `src/features/copy-trading/copy-safety-bar.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add contract assertions for user wording and accessibility**

```ts
test("safety and help components use impact-focused wording", () => {
  const safety = readFileSync(
    join(ROOT, "src/features/copy-trading/copy-safety-bar.tsx"),
    "utf8",
  );
  const help = readFileSync(
    join(ROOT, "src/features/copy-trading/shared/field-help.tsx"),
    "utf8",
  );
  const emergency = readFileSync(
    join(ROOT, "src/features/copy-trading/emergency-actions-dialog.tsx"),
    "utf8",
  );

  assert.match(safety, /Pause copying/);
  assert.match(safety, /Emergency actions/);
  assert.match(help, /role="tooltip"/);
  assert.match(help, /aria-describedby/);
  assert.match(emergency, /manual trades are never affected/i);
  assert.match(emergency, /Type EMERGENCY/);
});
```

- [ ] **Step 2: Verify the contract test fails**

Run:

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
```

Expected: FAIL because the component files do not exist.

- [ ] **Step 3: Implement shared feature primitives**

`field-help.tsx` must use a focusable button and CSS tooltip:

```tsx
"use client";

import { HelpCircle } from "lucide-react";
import { useId } from "react";

export function FieldHelp({ children }: { children: string }) {
  const tooltipId = useId();
  return (
    <span className="group/help relative inline-flex">
      <button
        type="button"
        aria-describedby={tooltipId}
        className="rounded text-text-tertiary outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-3.5" />
        <span className="sr-only">More information</span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-tooltip mb-2 w-64 -translate-x-1/2 rounded-md border border-border-primary bg-card-bg px-3 py-2 text-left text-xs leading-5 text-text-primary shadow-md group-hover/help:visible group-focus-within/help:visible"
      >
        {children}
      </span>
    </span>
  );
}
```

Implement `status-label.tsx` with existing Badge variants and explicit text.
Implement `empty-state.tsx` as a single bordered surface with one action.
Move Field, Select, Toggle, and FormSection from the old page into
`form-controls.tsx`, preserving existing token classes.

- [ ] **Step 4: Implement the emergency dialog**

Move the existing emergency mutation and scope logic into
`emergency-actions-dialog.tsx`. Required visible copy:

```tsx
<DialogTitle>Emergency actions</DialogTitle>
<DialogDescription>
  These actions affect copied positions and pending orders only. Manual trades are never affected.
</DialogDescription>
```

Keep all existing scopes and actions. Keep the `EMERGENCY` confirmation. Add a
plain consequence block that changes with the chosen action.

- [ ] **Step 5: Implement `CopySafetyBar`**

Props:

```ts
interface CopySafetyBarProps {
  health: AutomationHealth;
  isPaused: boolean;
  isUpdating: boolean;
  accounts: CopyTargetAccount[];
  routes: CopyRoute[];
  sources: TelegramSource[];
  onPauseChange: (enabled: boolean) => Promise<void>;
}
```

Render:

- status icon and health label;
- health description;
- `Pause copying` / `Resume copying`;
- `Emergency actions` button that opens the dialog.

Use responsive classes:

```tsx
className="flex flex-col gap-3 border-b border-border-primary py-3 sm:flex-row sm:items-center sm:justify-between"
```

- [ ] **Step 6: Run contract and targeted lint**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/shared src/features/copy-trading/copy-safety-bar.tsx src/features/copy-trading/emergency-actions-dialog.tsx
```

Expected: PASS with no lint findings.

- [ ] **Step 7: Commit shared UI and safety**

```powershell
git add src/features/copy-trading/shared src/features/copy-trading/copy-safety-bar.tsx src/features/copy-trading/emergency-actions-dialog.tsx src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): add persistent safety controls"
```

---

### Task 4: Build The Adaptive Shell

**Files:**
- Create: `src/features/copy-trading/copy-trading-shell.tsx`
- Replace: `src/features/copy-trading/copy-trading-page.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add contract assertions for thin orchestration**

```ts
test("copy trading page delegates to focused workspace components", () => {
  const page = readFileSync(
    join(ROOT, "src/features/copy-trading/copy-trading-page.tsx"),
    "utf8",
  );
  const shell = readFileSync(
    join(ROOT, "src/features/copy-trading/copy-trading-shell.tsx"),
    "utf8",
  );

  assert.match(page, /CopyTradingShell/);
  assert.match(shell, /CopySafetyBar/);
});
```

- [ ] **Step 2: Verify the test fails**

Run the contract test and expect failure because the shell does not exist and the
page is still monolithic.

- [ ] **Step 3: Create the shell**

`copy-trading-shell.tsx` accepts:

```ts
interface CopyTradingShellProps {
  title: string;
  description: string;
  health: AutomationHealth;
  settings: CopyTradingSettings;
  routes: CopyRoute[];
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  updatePending: boolean;
  onPauseChange: (enabled: boolean) => Promise<void>;
  children: ReactNode;
}
```

It renders the compact header, `CopySafetyBar`, and children. Do not render a
separate Connect Telegram button globally; setup and Settings own connection
actions.

- [ ] **Step 4: Replace the page with query orchestration**

Use:

```ts
export type CopyTradingView = "overview" | "routes" | "activity" | "settings";
```

Fetch existing settings, routes, policies, activity, connections, sources, and
accounts. Derive:

```ts
const mode = deriveCopyTradingMode(routes.data ?? []);
const health = deriveAutomationHealth({
  globallyPaused: settings.data?.is_paused ?? false,
  routes: routes.data ?? [],
  connections: connections.data ?? [],
  sources: sources.data ?? [],
});
```

Delegate to:

- `SetupWorkspace` when Overview and mode is setup;
- `MonitoringOverview` when Overview and mode is monitoring;
- `CopyRulesPage`;
- `CopyActivityPage`;
- `CopyTradingSettingsPage`.

Use an exhaustive switch helper rather than nested conditional markup.

- [ ] **Step 5: Run the contract test and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npm run build
```

Expected: PASS. At this stage the existing Overview, Routes, Accounts, and
Activity implementations remain inside `copy-trading-page.tsx`, but the page
header and safety controls render through `CopyTradingShell`. Final view
delegation and monolith removal happen after the focused page components exist.

- [ ] **Step 6: Commit shell decomposition**

```powershell
git add src/features/copy-trading/copy-trading-page.tsx src/features/copy-trading/copy-trading-shell.tsx src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "refactor(copy-trading): introduce adaptive workspace shell"
```

---

### Task 5: Build Setup Steps 1-3

**Files:**
- Create: `src/features/copy-trading/setup/setup-step.tsx`
- Create: `src/features/copy-trading/setup/setup-workspace.tsx`
- Create: `src/features/copy-trading/setup/telegram-step.tsx`
- Create: `src/features/copy-trading/setup/telegram-sign-in-dialog.tsx`
- Create: `src/features/copy-trading/setup/channel-step.tsx`
- Create: `src/features/copy-trading/setup/channel-picker.tsx`
- Create: `src/features/copy-trading/setup/channel-analysis-step.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add setup journey contract assertions**

```ts
test("guided setup exposes the approved first three steps", () => {
  const workspace = readFileSync(
    join(ROOT, "src/features/copy-trading/setup/setup-workspace.tsx"),
    "utf8",
  );
  const telegram = readFileSync(
    join(ROOT, "src/features/copy-trading/setup/telegram-step.tsx"),
    "utf8",
  );
  const analysis = readFileSync(
    join(ROOT, "src/features/copy-trading/setup/channel-analysis-step.tsx"),
    "utf8",
  );

  assert.match(workspace, /Connect Telegram/);
  assert.match(workspace, /Choose a signal channel/);
  assert.match(workspace, /Review how this channel sends signals/);
  assert.match(telegram, /read-only session/i);
  assert.match(analysis, /Copying is available, but review activity closely/);
});
```

- [ ] **Step 2: Verify failure**

Run the contract test. Expected: FAIL because setup files do not exist.

- [ ] **Step 3: Implement the accessible setup-step shell**

`SetupStep` props:

```ts
interface SetupStepProps {
  number: number;
  title: string;
  description: string;
  state: "complete" | "current" | "upcoming" | "blocked";
  summary?: string;
  children: ReactNode;
}
```

Use a semantic button with `aria-expanded`. Completed steps default collapsed,
the current step defaults open, and upcoming steps are disabled.

- [ ] **Step 4: Move Telegram sign-in into its own dialog**

Move existing phone, QR, code, and 2FA behavior without changing API calls.
Change visible copy to:

- `Connect with QR code`
- `Use phone number`
- trust text from the design.

Keep polling cleanup and success invalidation behavior.

- [ ] **Step 5: Implement Telegram and channel setup steps**

`TelegramStep` shows either connection summary or sign-in actions.

`ChannelPicker` moves the current live dialog picker unchanged at the data layer,
but uses:

- `Choose this channel`
- background refresh without blanking results;
- manual refresh tooltip;
- actionable error state.

`ChannelStep` shows the selected or first existing source summary.

- [ ] **Step 6: Implement analysis guidance**

Map confidence:

```ts
const confidenceGuidance = {
  high: "The pattern is consistent and easy to follow.",
  medium: "The pattern is usable, but occasional messages may need more context.",
  low: "The pattern changes often. Copying is available, but review activity closely.",
} as const;
```

Show signal style, message waiting time, sampled messages, image usage, supported
actions, and `Analyze again`.

- [ ] **Step 7: Compose setup prerequisites**

`SetupWorkspace` determines:

- ready Telegram connection;
- first non-unsupported source;
- source profile status.

Render Steps 4-6 as real locked setup steps using their final headings. Their
body copy is `Complete the previous step to continue.` and their buttons are
disabled through `state="upcoming"`. Task 6 replaces those locked bodies with
the final account, preferences, and review controls.

- [ ] **Step 8: Verify contract, lint, and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/setup
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit setup foundation**

```powershell
git add src/features/copy-trading/setup src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): add guided Telegram and channel setup"
```

---

### Task 6: Complete Setup Steps 4-6 And Persist Progress

**Files:**
- Create: `src/features/copy-trading/setup/account-step.tsx`
- Create: `src/features/copy-trading/setup/preferences-step.tsx`
- Create: `src/features/copy-trading/setup/review-step.tsx`
- Modify: `src/features/copy-trading/setup/setup-workspace.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add contract coverage for progressive disclosure**

```ts
test("copy preferences prioritize common choices and disclose advanced controls", () => {
  const preferences = readFileSync(
    join(ROOT, "src/features/copy-trading/setup/preferences-step.tsx"),
    "utf8",
  );

  assert.match(preferences, /Trade size/);
  assert.match(preferences, /Take-profit handling/);
  assert.match(preferences, /Advanced settings/);
  assert.match(preferences, /form\.take_profit_mode === "all"/);
  assert.match(preferences, /Message waiting time/);
  assert.match(preferences, /Required signal details/);
});
```

- [ ] **Step 2: Run and verify failure**

Expected: FAIL because the preference component does not exist.

- [ ] **Step 3: Implement account selection**

Render all `CopyTargetAccount` rows supplied by the hook. Ready rows are
selectable. Unavailable rows show their connection state and a link to
`/accounts`.

Selected summary:

```tsx
`${account.display_name || account.broker_name} · ${account.broker_login}`
```

- [ ] **Step 4: Implement common preferences**

Use the existing `CopyRouteInput` defaults. Labels:

- Trade size
- Take-profit handling
- Multiple take-profit sizing
- Pending orders

Only show lot distribution when `take_profit_mode === "all"`.

- [ ] **Step 5: Implement advanced disclosure**

Use a native button and controlled expanded state. Include every existing route
permission. Use `FieldHelp` with the exact impact copy from the design spec.

Enforce:

```ts
const minimumWindow =
  selectedSource.profile?.recommended_assembly_window_seconds ?? 1;
const effectiveWindow = Math.max(
  form.assembly_window_seconds ?? minimumWindow,
  minimumWindow,
);
```

Show the unsafe minimum-details confirmation before saving.

- [ ] **Step 6: Persist setup by creating a ready copy rule**

When the user continues from Preferences:

- if there is no existing non-active rule for the selected source/account,
  call `createRoute`;
- if a ready or draft rule exists, call `updateRoute`;
- store the returned rule in React Query through existing invalidation;
- advance to Review.

This makes setup resumable without adding a setup-progress table.

- [ ] **Step 7: Implement final review and activation**

Render source → account, trade size, take-profit behavior, pending-order
behavior, author behavior, and message waiting time.

On `Start copying`, call:

```ts
await actions.routeAction.mutateAsync({
  id: route.id,
  action: "activate",
});
toast.success("Copying started");
```

The query invalidation causes Overview to switch to monitoring mode.

- [ ] **Step 8: Run tests, lint, and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/setup
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit completed setup**

```powershell
git add src/features/copy-trading/setup src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): complete resumable copy setup journey"
```

---

### Task 7: Build Grouped Activity Presentation

**Files:**
- Modify: `src/features/copy-trading/copy-trading-view-model.ts`
- Modify: `src/features/copy-trading/copy-trading-view-model.test.ts`
- Create: `src/features/copy-trading/activity/activity-item.tsx`
- Create: `src/features/copy-trading/activity/activity-feed.tsx`
- Create: `src/features/copy-trading/activity/activity-filters.tsx`
- Create: `src/features/copy-trading/activity/copy-activity-page.tsx`

- [ ] **Step 1: Add failing grouping and failure-message tests**

```ts
test("groups activity events by correlation id newest first", () => {
  const groups = groupActivity([
    { id: "1", correlation_id: "signal-a", created_at: "2026-06-21T10:00:00Z", level: "info" },
    { id: "2", correlation_id: "signal-a", created_at: "2026-06-21T10:00:02Z", level: "success" },
    { id: "3", correlation_id: "signal-b", created_at: "2026-06-21T11:00:00Z", level: "error" },
  ]);

  assert.deepEqual(groups.map((group) => group.correlationId), ["signal-b", "signal-a"]);
  assert.equal(groups[1].events.length, 2);
});

test("failure guidance explains continuation and next action", () => {
  const message = failureGuidance({
    title: "No tradable broker symbol matches XAUUSD",
    parsed_details: { symbol: "XAUUSD" },
  });
  assert.match(message, /Other copy rules will continue/);
  assert.match(message, /check that XAUUSD is available/i);
});
```

- [ ] **Step 2: Verify failure**

Run the view-model tests. Expected: FAIL because `groupActivity` and
`failureGuidance` are missing.

- [ ] **Step 3: Implement grouping and guidance helpers**

Add:

```ts
export interface ActivityGroup {
  correlationId: string;
  events: CopyActivity[];
  latest: CopyActivity;
}
```

Group by correlation ID with a `Map`, sort each group by timestamp, and sort
groups by latest timestamp descending.

Implement symbol-specific guidance for symbol failures and a general fallback:

```ts
return `${event.title}. Other copy rules will continue. Review the copy rule and trading account, then try again.`;
```

- [ ] **Step 4: Implement `ActivityItem`**

Collapsed:

- humanized action;
- status;
- source;
- account;
- relative time.

Expanded:

- readable trade details;
- broker details;
- source message action;
- `Technical details` disclosure containing correlation ID and raw JSON.

Do not display “queue”, “intent”, or “reconciliation”.

- [ ] **Step 5: Implement activity filters**

Desktop: inline search, status, channel, account, date inputs, and Clear filters.
Mobile: use `Sheet` for filter controls.

Filter the currently fetched 50-event audit window in the client. Label the date
inputs `From` and `To`.

- [ ] **Step 6: Implement `ActivityFeed` and page**

Use grouped events. Empty states:

- monitoring Overview: `Waiting for the next signal`
- Activity page with no records: `No copy activity yet`
- filtered empty: `No activity matches these filters`

- [ ] **Step 7: Run tests and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-view-model.test.ts src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/activity src/features/copy-trading/copy-trading-view-model.ts
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit activity redesign**

```powershell
git add src/features/copy-trading/activity src/features/copy-trading/copy-trading-view-model.ts src/features/copy-trading/copy-trading-view-model.test.ts
git commit -m "feat(copy-trading): group signals into actionable activity"
```

---

### Task 8: Build The Monitoring Overview

**Files:**
- Create: `src/features/copy-trading/overview/health-strip.tsx`
- Create: `src/features/copy-trading/overview/attention-list.tsx`
- Create: `src/features/copy-trading/overview/monitoring-overview.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add monitoring contract coverage**

```ts
test("monitoring overview prioritizes health and live activity", () => {
  const overview = readFileSync(
    join(ROOT, "src/features/copy-trading/overview/monitoring-overview.tsx"),
    "utf8",
  );

  assert.match(overview, /Live activity/);
  assert.match(overview, /HealthStrip/);
  assert.match(overview, /AttentionList/);
  assert.doesNotMatch(overview, /Metric/);
});
```

- [ ] **Step 2: Verify failure**

Expected: FAIL because monitoring components do not exist.

- [ ] **Step 3: Implement the health strip**

Show four compact facts:

- active copy rules;
- ready Telegram accounts;
- ready MT5 accounts;
- latest successful action time.

Use a simple flex/grid strip with dividers, not cards.

- [ ] **Step 4: Implement attention derivation and list**

Create attention items from:

- reauthentication-required Telegram connections;
- unsupported or failed sources;
- target-unavailable or reauthentication-required routes;
- recent error activity.

Each item has one action link:

- Settings for connections/sources/accounts;
- Routes for route failures;
- Activity for broker failures.

Render nothing when there are no attention items.

- [ ] **Step 5: Compose monitoring overview**

Order:

1. Health strip
2. Attention list when needed
3. Live activity heading and ActivityFeed
4. `View all activity` link

- [ ] **Step 6: Run contract, lint, and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/overview
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit monitoring overview**

```powershell
git add src/features/copy-trading/overview src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): add live monitoring overview"
```

---

### Task 9: Redesign Copy Rules And Progressive Editing

**Files:**
- Create: `src/features/copy-trading/routes/copy-rule-row.tsx`
- Create: `src/features/copy-trading/routes/copy-rule-form.tsx`
- Create: `src/features/copy-trading/routes/copy-rules-page.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add contract coverage for plain-language copy rules**

```ts
test("copy rules use trader wording and progressive editing", () => {
  const rules = readFileSync(
    join(ROOT, "src/features/copy-trading/routes/copy-rules-page.tsx"),
    "utf8",
  );
  const form = readFileSync(
    join(ROOT, "src/features/copy-trading/routes/copy-rule-form.tsx"),
    "utf8",
  );

  assert.match(rules, /Copy Rules/);
  assert.match(rules, /New copy rule/);
  assert.match(form, /Trade size/);
  assert.match(form, /Take-profit handling/);
  assert.match(form, /Advanced signal handling/);
  assert.doesNotMatch(form, /Fixed lot/);
});
```

- [ ] **Step 2: Verify failure**

Expected: FAIL because route components do not exist.

- [ ] **Step 3: Implement dense copy-rule rows**

Row primary:

```tsx
`${source.title} → ${accountLabel(account, route.target_account_id)}`
```

Secondary uses `summarizeCopyRule(route)`.

Show status, latest matching activity time, pause/resume, Edit, and an overflow
menu. If there is no dropdown primitive, use a small Popover. Delete remains
inside overflow and disabled while active.

- [ ] **Step 4: Implement the side-sheet form**

Use `SheetContent className="max-w-xl"`.

Sections:

1. Signal channel and trading account
2. Trade size and take-profit handling
3. Advanced signal handling
4. Trade-management permissions
5. Notifications

Reuse the same field labels, tooltips, validation, and conditional lot
distribution as setup Preferences. Extract a shared route-fields component if
duplication exceeds one screen.

- [ ] **Step 5: Preserve all existing mutations**

Keep:

- create;
- update;
- activate;
- pause;
- resume;
- delete.

Use toasts:

- `Copy rule created`
- `Copy rule updated`
- `Copying paused for this rule`
- `Copying resumed for this rule`
- `Copy rule deleted`

- [ ] **Step 6: Run contract, lint, and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/routes
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit copy-rule redesign**

```powershell
git add src/features/copy-trading/routes src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): redesign copy rule management"
```

---

### Task 10: Consolidate Settings

**Files:**
- Create: `src/features/copy-trading/settings/telegram-account-list.tsx`
- Create: `src/features/copy-trading/settings/signal-channel-list.tsx`
- Create: `src/features/copy-trading/settings/trading-account-list.tsx`
- Create: `src/features/copy-trading/settings/copy-trading-settings-page.tsx`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add settings contract coverage**

```ts
test("settings consolidates Telegram, channels, and trading accounts", () => {
  const settings = readFileSync(
    join(ROOT, "src/features/copy-trading/settings/copy-trading-settings-page.tsx"),
    "utf8",
  );

  assert.match(settings, /Telegram accounts/);
  assert.match(settings, /Signal channels/);
  assert.match(settings, /Trading accounts/);
  assert.doesNotMatch(settings, /Notification defaults/);
});
```

- [ ] **Step 2: Verify failure**

Expected: FAIL because settings components do not exist.

- [ ] **Step 3: Move Telegram account management**

Move connection rows and Telegram sign-in action into
`telegram-account-list.tsx`.

Labels:

- Connected
- Paused
- Reconnect required
- Pause reading
- Resume reading
- Disconnect

Use `last_heartbeat_at` as `Last checked ...`.

- [ ] **Step 4: Move signal-channel management**

Move channel analysis summaries and actions. Keep live picker access through
`Add signal channel`. Keep low-confidence advisory. Keep image-primary
unsupported state.

- [ ] **Step 5: Move trading-account safeguards**

Move account policy rows. Rename:

- `Maximum lot` → `Maximum trade size`
- `Route count` → `Copy rules`
- account pause description → `Pause all copying to this account`

Keep the existing API and validation.

- [ ] **Step 6: Compose Settings with open sections**

Use full-width sections separated by borders and headings. Do not nest each row
inside an extra card. Do not render notification defaults because there is no
backend contract.

- [ ] **Step 7: Run contract, lint, and build**

```powershell
npx tsx --test src/features/copy-trading/copy-trading-contract.test.ts
npx eslint src/features/copy-trading/settings
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit settings**

```powershell
git add src/features/copy-trading/settings src/features/copy-trading/copy-trading-contract.test.ts
git commit -m "feat(copy-trading): consolidate automation settings"
```

---

### Task 11: Remove The Monolith And Audit Wording

**Files:**
- Modify: `src/features/copy-trading/copy-trading-page.tsx`
- Modify: all new files under `src/features/copy-trading/`
- Modify: `src/features/copy-trading/copy-trading-contract.test.ts`

- [ ] **Step 1: Add forbidden-word checks**

```ts
test("primary Copy Trading UI avoids internal implementation language", () => {
  const files = [
    "copy-trading-page.tsx",
    "copy-trading-shell.tsx",
    "setup/setup-workspace.tsx",
    "overview/monitoring-overview.tsx",
    "routes/copy-rules-page.tsx",
    "activity/activity-feed.tsx",
    "settings/copy-trading-settings-page.tsx",
  ].map((file) =>
    readFileSync(join(ROOT, "src/features/copy-trading", file), "utf8"),
  ).join("\n");

  for (const word of ["Sync queued", "intent queued", "assembly window", "Fixed lot"]) {
    assert.equal(files.includes(word), false, `${word} leaked into primary UI`);
  }
});
```

- [ ] **Step 2: Verify and fix wording failures**

Run the contract test. Replace remaining user-visible route/source/assembly/fixed
lot terminology. Do not rename API fields or TypeScript payload properties.

- [ ] **Step 3: Delete obsolete inline components**

Ensure `copy-trading-page.tsx` is orchestration only. Remove old inline
Connections, Sources, RoutesPanel, RouteWizard, AccountControls,
EmergencyControls, ActivityTimeline, and duplicated primitive functions.

Add the final thin-page assertions to the contract test:

```ts
test("copy trading page is thin orchestration after decomposition", () => {
  const page = readFileSync(
    join(ROOT, "src/features/copy-trading/copy-trading-page.tsx"),
    "utf8",
  );
  assert.match(page, /deriveCopyTradingMode/);
  assert.match(page, /view === "settings"/);
  assert.ok(page.split("\n").length < 220);
});
```

- [ ] **Step 4: Run all feature tests and targeted lint**

```powershell
npx tsx --test src/features/copy-trading/*.test.ts
npx eslint src/features/copy-trading src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading'
```

Expected: PASS with no Copy Trading errors.

- [ ] **Step 5: Run the production build**

```powershell
if (Test-Path .next) {
  $target = (Resolve-Path -LiteralPath .next).Path
  $root = (Resolve-Path -LiteralPath .).Path
  if (-not $target.StartsWith($root + [IO.Path]::DirectorySeparatorChar)) {
    throw "Refusing to remove path outside workspace: $target"
  }
  Remove-Item -LiteralPath $target -Recurse -Force
}
npm run build
```

Expected: Next.js build PASS with `/copy-trading/settings` listed and no
`/copy-trading/accounts` page output except redirect handling.

- [ ] **Step 6: Commit cleanup**

```powershell
git add src/features/copy-trading src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading'
git commit -m "refactor(copy-trading): finish adaptive workspace decomposition"
```

---

### Task 12: Browser QA And Responsive Fidelity

**Files:**
- Modify: Copy Trading component files only when QA identifies a defect.
- Do not retain temporary screenshots in the repository.

- [ ] **Step 1: Start the development server**

Run:

```powershell
npm run dev -- --port 3000
```

Expected: Next.js available at `http://localhost:3000`.

- [ ] **Step 2: Verify the setup journey in the browser**

Use the Browser plugin when available. Otherwise use Playwright and record the
fallback reason.

At 1440×900 verify:

- compact page header;
- horizontal safety bar;
- one open setup step;
- completed steps collapse;
- future steps are visibly unavailable;
- Telegram trust text;
- live channel picker;
- low-confidence guidance;
- advanced settings collapsed;
- final review and activation.

- [ ] **Step 3: Verify monitoring and management**

Verify:

- Overview switches to monitoring after an active route exists;
- health strip is not rendered as KPI cards;
- attention items appear only when needed;
- activity rows expand and hide technical detail by default;
- Rules use source → account summaries;
- Settings contains the three supported sections;
- pause and emergency actions are present on every page.

- [ ] **Step 4: Verify dark and light themes**

Check:

- token-based surfaces;
- readable status colors;
- no hard-coded white/black except QR code background where required;
- no purple Copy Trading accent beyond global AI chrome;
- no nested-card visual clutter.

- [ ] **Step 5: Verify mobile at 390×844**

Check:

- safety bar stacks without clipping;
- setup steps fill width;
- sheets and dialogs fit viewport;
- activity metadata wraps;
- filters open through a sheet;
- route actions remain reachable;
- no horizontal page scroll.

- [ ] **Step 6: Capture desktop and mobile screenshots**

Capture:

- setup Overview desktop;
- monitoring Overview desktop;
- Settings desktop;
- setup or monitoring Overview mobile.

Inspect screenshots using `view_image`. Create a fidelity ledger covering:

1. hierarchy and first viewport;
2. typography and wording;
3. spacing and container model;
4. colors and semantic states;
5. icon alignment and control density;
6. responsive behavior.

Fix every material mismatch before proceeding.

- [ ] **Step 7: Re-run verification after visual fixes**

```powershell
npx tsx --test src/features/copy-trading/*.test.ts
npx eslint src/features/copy-trading src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading'
npm run build
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 8: Commit QA fixes**

```powershell
git add src/features/copy-trading src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading'
git commit -m "fix(copy-trading): polish responsive workspace UX"
```

---

### Task 13: Final Review, Push, And Deployment Verification

**Files:**
- No planned source changes; only fix issues found by review.

- [ ] **Step 1: Review the complete diff against the approved design**

Run:

```powershell
git diff origin/staging...HEAD --stat
git diff origin/staging...HEAD -- src/features/copy-trading src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading'
```

Confirm all 13 acceptance criteria in the design spec are represented.

- [ ] **Step 2: Run final verification**

```powershell
npx tsx --test src/features/copy-trading/*.test.ts
npx eslint src/features/copy-trading src/components/layout/nav-registry.ts 'src/app/(dashboard)/copy-trading'
npm run build
git diff --check
git status --short --branch
```

Expected: all feature checks and build PASS; worktree contains only intentional
commits.

- [ ] **Step 3: Push staging**

```powershell
git push origin staging
```

- [ ] **Step 4: Verify Railway deployment**

```powershell
$commit = git rev-parse HEAD
gh api "repos/SyncgramTrades/synctrades-fe/commits/$commit/status" --jq '{state: .state, statuses: [.statuses[] | {context, state, description}]}'
```

Expected: `TradePartna - tradepartna-fe` reaches `success`.

- [ ] **Step 5: Smoke-test the deployed surface**

```powershell
curl.exe -sS -o NUL -w "%{http_code}" https://tradepartna.com/copy-trading
```

Expected: `200`.

Open the deployed site and verify Overview, Routes, Activity, and Settings load
with the new wording and no console errors.
