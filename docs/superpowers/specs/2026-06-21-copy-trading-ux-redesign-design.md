# Copy Trading UX Redesign

## Purpose

Redesign Copy Trading as an adaptive operations workspace that is easy to
understand before setup and efficient to monitor after activation.

The experience must:

- guide a new user from Telegram connection to an active copy rule;
- make live signal and broker activity the primary daily surface;
- translate internal system terminology into trader-friendly language;
- keep pause and emergency controls visible without making the interface feel
  alarming;
- preserve every existing copy-trading capability;
- match TradePartna's current light and dark design system;
- remain usable on laptop and mobile layouts.

## Product Principles

1. **Show the next useful action.** Setup screens emphasize one primary step.
2. **Adapt after activation.** The first-run workspace becomes a monitoring
   workspace once at least one copy rule is active.
3. **Explain consequences.** Tooltips and warnings describe user impact rather
   than repeating labels.
4. **Use trader language.** Internal implementation terms remain hidden unless
   shown inside expandable technical details.
5. **Keep safety persistent.** Automation state is always visible, while
   destructive actions remain deliberately separated.
6. **Progressively disclose complexity.** Common decisions appear first;
   permissions and edge-case settings appear under Advanced settings.
7. **Prefer rows and timelines over card grids.** This is an operational tool,
   so density must remain restrained and scannable.

## Information Architecture

Copy Trading navigation becomes:

1. **Overview**
2. **Routes**
3. **Activity**
4. **Settings**

The existing Accounts navigation item is removed. Account limits and pauses
move into Settings.

### Overview

Overview is adaptive:

- Before the first route is active, it is a guided setup workspace.
- After the first route is active, it is a live operations workspace.

### Routes

Routes manages channel-to-account copy rules, including activation, pause,
editing, and deletion.

### Activity

Activity is the complete searchable history of signal interpretation and broker
outcomes.

### Settings

Settings contains Telegram accounts, signal channels, trading account controls,
notification preferences, and defaults for new routes.

## Persistent Safety Bar

Every Copy Trading page has a compact safety bar below the page header.

### Contents

- overall automation status;
- short health summary;
- `Pause copying` or `Resume copying`;
- an overflow menu containing emergency actions.

### Status language

| State | Label | Supporting text |
| --- | --- | --- |
| Healthy | Copying is active | Signals can be read and sent to connected accounts. |
| Degraded | Some copy rules need attention | Healthy rules will continue copying. |
| Paused | Copying is paused | New signals will not be sent to trading accounts. |
| Blocked | Copying has stopped | Fix the affected Telegram or trading account connection. |

The bar uses semantic status color only in the icon and status text. The
container remains a normal design-system surface.

### Emergency menu

Emergency actions are not displayed beside the standard pause control.
Selecting `Emergency actions` opens a focused dialog containing:

- scope: all rules, one signal channel, one copy rule, or one trading account;
- action: close copied positions, cancel copied pending orders, or both;
- plain-language consequence;
- the existing typed confirmation requirement.

## First-Run Setup Workspace

The setup workspace uses a vertical sequence of six steps. It is not a modal
wizard: users can inspect previous choices, leave the page, and resume later.

Completed steps collapse into compact summary rows. The current step is open.
Future steps remain visible but unavailable until their prerequisites are met.

### Step 1: Connect Telegram

**Heading:** Connect Telegram  
**Description:** Connect the Telegram account that receives your trading
signals.

Trust copy:

> TradePartna uses a read-only session. It can read channels you select but
> cannot send messages or change your Telegram account.

Actions:

- `Connect with QR code`
- `Use phone number`

Completed summary:

`Telegram connected as @username`

Failure states provide `Try again` or `Reconnect Telegram`.

### Step 2: Choose a Signal Channel

**Heading:** Choose a signal channel  
**Description:** Select the channel or group whose trade instructions you want
to copy.

The picker:

- searches the live Telegram dialog list;
- refreshes when opened and while open;
- has a manual refresh control;
- shows channel/group type and administrator status;
- marks channels already added;
- explains when Telegram cannot refresh.

Completed summary:

`Gold Signals selected`

### Step 3: Review Channel Analysis

**Heading:** Review how this channel sends signals  
**Description:** TradePartna reviews recent messages so it can understand
single-message and multi-message trade instructions.

Show:

- signal style;
- recommended message waiting time;
- number of sampled messages;
- image-signal frequency;
- confidence level;
- supported actions.

Confidence is guidance, not a permission gate:

- High: `The pattern is consistent and easy to follow.`
- Medium: `The pattern is usable, but occasional messages may need more
  context.`
- Low: `The pattern changes often. Copying is available, but review activity
  closely.`

Image-primary channels remain unsupported with a direct explanation.

Actions:

- `Continue`
- `Analyze again`

### Step 4: Choose a Trading Account

**Heading:** Choose where trades should be copied  
**Description:** Select a connected MT5 account.

Each account row shows:

- display name and broker login;
- broker server;
- balance;
- connection readiness;
- account-level copy pause state.

Unavailable accounts remain visible with a reason and a relevant action.

### Step 5: Set Copying Preferences

**Heading:** Set your copying preferences

Primary settings:

- **Trade size**
- **Take-profit handling**
  - Place a trade for every take profit
  - Use the nearest take profit
  - Use the furthest take profit
- **Multiple take-profit sizing**, shown only when every TP is selected
  - Split the total trade size
  - Use the trade size for every position
- **Pending orders**
  - Allow
  - Ignore

Advanced settings are collapsed by default:

- required signal details;
- message waiting time;
- who can send group signals;
- allow stop-loss/take-profit changes;
- allow break-even updates;
- allow additional take profits;
- allow partial closes;
- allow full closes;
- allow pending-order cancellation;
- success and failure email preferences.

Unsafe minimum-signal choices retain the existing warning confirmation.

### Step 6: Start Copying

Show a readable review:

`Gold Signals → Exness MT5`

- Trade size: 0.10 lots
- Take profits: one position per TP
- Pending orders: allowed
- Group messages: administrators only
- Message waiting time: 90 seconds

Primary action: `Start copying`

Activation success transitions the page to the monitoring workspace and shows a
short success toast.

## Monitoring Overview

Once a route is active, Overview prioritizes live activity.

### Health strip

A compact, unframed strip shows:

- active copy rules;
- Telegram connection state;
- available MT5 accounts;
- time of the latest successful broker action.

These are operational facts, not KPI cards. Each item can link to its relevant
page or setting.

### Attention panel

Only render this panel when action is required. Examples:

- Telegram session requires reconnection;
- a trading account is unavailable;
- a route is paused unexpectedly;
- channel analysis failed;
- a recent broker action failed.

Each item includes:

- what happened;
- whether other rules continue;
- one relevant action.

### Live activity feed

The feed groups events by signal, not by internal queue event.

Collapsed row contents:

- outcome icon and label;
- interpreted action, for example `Buy XAUUSD`;
- signal channel;
- destination account;
- relative time;
- status: Reading signal, Waiting for details, Sending trade, Confirming broker
  result, Completed, Skipped, or Failed.

Expanded details:

- original source message when available;
- symbol and direction;
- entry, stop loss, and take profits;
- trade size;
- channel and account;
- timestamps;
- broker result;
- failure reason;
- correlation/reference identifiers under a `Technical details` disclosure.

### Activity wording

| Internal wording | User wording |
| --- | --- |
| Signal queued | Reading signal |
| Signal validated | Signal understood |
| Intent created | Preparing trade |
| Intent submitted | Sending trade |
| Reconciliation | Confirming broker result |
| Broker succeeded | Trade completed |
| Signal expired | Incomplete signal expired |
| Validation rejected | Signal skipped |

## Routes Experience

The page heading is **Copy Rules**, while the route remains `/copy-trading/routes`
for compatibility.

Each rule is presented as a dense row:

`Gold Signals → Exness MT5`

Secondary summary:

`0.10 lots · Every take profit · Pending orders allowed`

Row contents:

- status and health;
- latest action time;
- pause/resume;
- edit;
- overflow actions.

The default action is not deletion. Deletion remains in the overflow menu and
requires the route to be paused.

### Create and edit

Use one consistent side sheet or large dialog. The form is divided into:

1. Signal channel and trading account
2. Trade size and take-profit handling
3. Advanced signal handling
4. Trade-management permissions
5. Notifications

On create, source and account are editable. On edit, immutable relationships are
shown as a summary while behavior settings remain editable.

Every unfamiliar control has a tooltip with impact-focused copy. Examples:

- **Message waiting time:** `How long TradePartna waits for follow-up messages
  such as stop loss or take profit.`
- **Administrators only:** `Ignore messages from regular group members. Channel
  posts are always accepted.`
- **Additional take profits:** `Allow a later message to open another position
  using the trade's existing details.`
- **Required signal details:** `The minimum information TradePartna must have
  before it can place a trade.`

## Activity Page

Activity is the permanent audit trail.

### Controls

- search;
- status filter;
- signal channel filter;
- trading account filter;
- date range;
- clear filters.

Filters collapse into a mobile sheet on narrow screens.

### Timeline

Use the same grouped activity item as Overview, with pagination or incremental
loading. Do not expose queue terminology.

Failures have stronger hierarchy and actionable controls. Technical broker and
parser details remain expandable.

## Settings Page

Settings uses four full-width sections with list rows, not nested cards.

### Telegram Accounts

Each row shows:

- account identity;
- connected/reconnecting/reconnect-required state;
- last heartbeat;
- pause reading;
- reconnect;
- disconnect.

### Signal Channels

Each row shows:

- title and type;
- analysis state;
- confidence;
- signal style;
- pause/resume;
- analyze again;
- remove.

Low confidence shows an advisory, not a disabled state.

### Trading Accounts

Each row shows:

- account and broker;
- connection state;
- maximum allowed trade size;
- account-level copy pause;
- save state.

### Notifications And Defaults

Existing route notification choices remain editable per route. This section
introduces UI-ready defaults for new rules only if backend support exists during
implementation. If backend support is absent, show no inert controls and leave
defaults out of the first release.

## Content Standards

### Terminology

| Avoid | Use |
| --- | --- |
| Route | Copy rule |
| Source | Signal channel |
| Fixed lot | Trade size |
| Assembly window | Message waiting time |
| Minimum fields | Required signal details |
| Parsed action | Signal understood |
| Intent | Trade request |
| Queue | Processing |
| Reconciliation | Confirming broker result |

Technical terms may appear only inside tooltips or technical disclosures when
they help support and debugging.

### Error formula

Every user-facing error answers:

1. What happened?
2. Does copying continue?
3. What should the user do next?

Example:

> TradePartna could not place this EURUSD trade. Other copy rules will continue.
> Check that EURUSD is available on the Exness account, then retry.

### Toasts

Toasts confirm discrete actions and surface immediate failures. They do not
replace persistent failed states.

- `Copying started`
- `Copying paused`
- `Channel analysis started`
- `Telegram channels refreshed`
- `Trade could not be sent`

## Design System Alignment

Use existing tokens and primitives:

- `bg-bg-canvas`, `bg-card-bg`, and `bg-bg-tertiary`;
- `border-border-primary`;
- `text-text-primary`, `text-text-secondary`, and `text-text-tertiary`;
- semantic `success`, `warning`, `danger`, and `info` tokens;
- existing Button, Badge, Dialog, Input, Switch, Table, Sheet, and Popover
  primitives;
- current radius of 8px or less for operational containers;
- existing icon family where navigation requires Hugeicons and Lucide for
  in-feature controls.

Do not introduce:

- gradients or decorative glow effects;
- large hero typography;
- nested cards;
- purple as a general Copy Trading accent;
- floating stat-card grids;
- new hard-coded colors;
- instructional paragraphs for obvious controls.

### Density

- Main content max width follows the existing dashboard canvas.
- Page headers remain compact.
- Rows use 48-64px minimum height depending on detail.
- Section spacing uses the existing 4/6/8 spacing rhythm.
- Tables and timelines prioritize scanability over generous marketing-page
  whitespace.

## Responsive Behavior

### Desktop

- persistent two-tier navigation remains unchanged;
- safety bar is horizontal;
- setup steps use a main column with an optional summary rail;
- activity rows expose channel, account, and time in one line.

### Tablet

- summary rail moves below the active setup step;
- health strip wraps;
- route rows keep primary actions visible and move secondary actions to overflow.

### Mobile

- Copy Trading contextual navigation uses the existing app navigation behavior;
- safety bar stacks status and actions;
- setup steps become full-width accordion sections;
- dialogs and sheets use nearly full viewport width;
- activity metadata wraps below the primary action;
- filters open in a sheet;
- no horizontal scrolling for primary workflows.

## Component Architecture

Split the current monolithic Copy Trading page into focused modules:

- `copy-trading-shell.tsx`
- `copy-safety-bar.tsx`
- `setup/setup-workspace.tsx`
- `setup/setup-step.tsx`
- `setup/telegram-step.tsx`
- `setup/channel-step.tsx`
- `setup/channel-analysis-step.tsx`
- `setup/account-step.tsx`
- `setup/preferences-step.tsx`
- `setup/review-step.tsx`
- `overview/monitoring-overview.tsx`
- `activity/activity-feed.tsx`
- `activity/activity-item.tsx`
- `routes/copy-rules-page.tsx`
- `routes/copy-rule-form.tsx`
- `settings/copy-trading-settings-page.tsx`
- `shared/status-label.tsx`
- `shared/field-help.tsx`
- `shared/empty-state.tsx`

Data hooks remain in `hooks.ts`, but should be split if the file becomes
difficult to scan. Existing query keys and API contracts remain stable unless a
required user-visible state cannot be represented.

Derived state such as setup progress and overall health must be computed from
queries during render, not synchronized through effects.

## Data And State Mapping

### Setup mode

Setup mode is active when there are no active copy rules.

Progress derives from:

- ready Telegram connection;
- selected Telegram source;
- completed channel profile;
- ready MT5 account;
- created route;
- active route.

Do not store a separate setup-progress record.

### Monitoring mode

Monitoring mode begins as soon as any route is active.

The user can still add Telegram accounts, channels, and routes from Settings and
Routes.

### Overall health

Derive health from:

- global pause;
- active route count;
- route states;
- Telegram connection state;
- source state;
- trading account readiness;
- recent failed activity.

Health must never imply that all automation is stopped when only one rule is
affected.

## Accessibility

- Every icon-only control has an accessible name and tooltip.
- Status is communicated with text and icon, not color alone.
- Step headers use semantic buttons with `aria-expanded`.
- Dialog focus management uses existing primitives.
- Tooltips are available by keyboard.
- Destructive actions include clear names and consequences.
- Loading states retain stable dimensions.
- Reduced-motion preferences disable decorative transitions.

## Loading, Empty, And Error States

Every query-backed section must define:

- initial loading skeleton or loader;
- empty state with one relevant action;
- recoverable error with retry;
- background refresh indication that does not blank existing data;
- stale/degraded state when useful.

Examples:

- No Telegram connection: `Connect Telegram`
- No channels: `Choose a signal channel`
- Channel learning: `Reviewing recent channel messages`
- No routes: continue guided setup
- No activity after activation: `Waiting for the next signal`
- Refresh failure: retain current rows and show a compact retry message

## Testing And Verification

### Component and contract tests

- adaptive setup/monitoring mode;
- setup-step prerequisites and summaries;
- low-confidence channel remains selectable;
- image-primary channel remains blocked;
- live Telegram refresh states;
- progressive disclosure of advanced settings;
- conditional multiple-TP sizing;
- pause and resume behavior;
- emergency confirmation;
- grouped activity wording and expansion;
- actionable failure content;
- filters and empty states.

### Build and lint

- targeted ESLint for all changed Copy Trading files;
- TypeScript production build;
- existing Copy Trading contract tests;
- backend Copy Trading tests if API behavior changes.

### Browser QA

Verify:

- first-time setup on desktop and mobile;
- transition from activation to monitoring;
- live Telegram channel search;
- route create/edit/pause flow;
- activity expansion and filters;
- persistent safety bar;
- light and dark themes;
- loading, empty, failure, and degraded states;
- no clipping, overlap, or horizontal overflow.

## Acceptance Criteria

1. A new user can understand and complete setup without knowing the terms
   source, route, assembly window, intent, or reconciliation.
2. The Overview clearly changes from setup guidance to live monitoring after
   the first rule activates.
3. Live activity is the dominant monitoring surface.
4. Low-confidence channel analysis advises but does not disable copying.
5. Telegram channels are searchable from the live account state.
6. Advanced options do not overwhelm the initial setup form.
7. Pause copying remains visible on every Copy Trading page.
8. Emergency actions are accessible but visually separated from normal actions.
9. Failures state what happened, whether automation continues, and what to do.
10. Navigation is Overview, Routes, Activity, Settings.
11. The UI uses existing TradePartna tokens and primitives in both themes.
12. All existing copy-trading functionality remains reachable.
13. Desktop and mobile core workflows pass browser QA.
