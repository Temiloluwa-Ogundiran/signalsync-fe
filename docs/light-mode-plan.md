# Light Mode — Implementation Plan

## TL;DR
The token system and theme plumbing **already exist** and are solid. Light mode is
broken by ~150 **hardcoded colors** in components that bypass tokens, a **missing
toggle UI**, and a few **token gaps**. This plan adds the missing tokens + reusable
primitives, swaps hardcoded colors to tokens, ships a toggle, and does a contrast pass.

---

## What already works (don't rebuild)
- **Tokens**: `globals.css` has complete `:root` (light) + `.dark` (dark) blocks,
  registered in `@theme inline` for Tailwind v4. `body` reads tokens with a transition.
- **Theme store**: `src/features/theme/store.ts` (Zustand + localStorage `syncgram-theme`),
  `toggleTheme()` / `setTheme()`, applies `.dark` on `<html>`.
- **No-flash**: blocking script in `layout.tsx` applies theme pre-hydration.
- **Gap**: default is `dark`, and there is **no UI to switch** — so light mode is never seen.

---

## Root causes that break light mode
1. **White/black opacity utilities** (~35): `bg-white/[0.06]`, `ring-white/[0.05]`,
   `border-white/[0.06]`, `divide-white/[…]`, `bg-black/40`, `text-white`. In light mode
   white-on-white = invisible; black overlays look wrong.
2. **Arbitrary hex** (~60): `text-[#A78BFA]`, `text-[#0a0a0b]`, `bg-[#0F1012]`,
   `text-[#71717A]`, `#F4F4F5`, chart `#22C55E`/`#EF4444`.
3. **Raw palette** (~25): `text-amber-500`, `bg-orange-500/15`, `cyan-*`, `emerald-*`,
   `red-*` used directly instead of semantic tokens.
4. **Token gaps**: no light values for `chip-grey`/`neutral-grey`; AI violet glow/border
   are fixed rgba; no "subtle surface"/"hairline" token to replace `white/[0.06]`.

---

## Strategy: tokens + primitives, then map-and-replace

### Phase 1 — Fill token gaps (`globals.css`)
Add semantic tokens to **both** `:root` and `.dark` so components stop hardcoding:

| New token | Replaces | Light | Dark |
|---|---|---|---|
| `--surface-subtle` (`--color-surface-subtle`) | `bg-white/[0.06]`, `chip-grey` | `#f1f5f9` (slate-100) | `rgba(255,255,255,0.06)` |
| `--surface-subtle-hover` | hover of above | `#e8edf3` | `rgba(255,255,255,0.10)` |
| `--hairline` (`--color-hairline`) | `border-white/[0.06]`, `divide-white/[…]`, `ring-white/[0.05]` | `#e2e8f0` | `rgba(255,255,255,0.06)` |
| `--overlay` (`--color-overlay`) | `bg-black/40`, dialog backdrops | `rgba(15,23,42,0.35)` | `rgba(0,0,0,0.6)` |
| `--ai-accent` / `--ai-accent-bright` / `--ai-soft-bg` / `--ai-border` | `#A78BFA`, `rgba(139,92,246,0.12/0.14)` | violet tuned for light (e.g. `#7c3aed` text on `rgba(124,58,237,0.10)`) | current violet on `rgba(139,92,246,0.14)` |
| `--star` (rating) | `amber-400` | `#d97706` | `#f59e0b` |
| `--badge-warn-bg/fg`, `--badge-info-bg/fg` | `orange-*`, `cyan-*`, demo/live/pending chips | light pairs | dark pairs |

Notes:
- Move `--color-ai-*` out of the shared `@theme inline` block into per-theme `:root`/`.dark`
  so violet can be darker/more saturated in light mode (light violet on white is weak).
- `--success`/`--danger`/`--warning` already exist in both — reuse, don't re-add.

### Phase 2 — Reusable primitives (kill repetition)
Small shared components/utilities so we never hardcode these patterns again:
- **`<Badge variant="win|loss|be|warn|info|neutral|ai">`** — one component for the
  WIN/LOSS/BE, demo/live, pending, AI tag chips (today each is bespoke hex/palette).
- **`<StatusDot variant>`** + **`<OutcomePill>`** — extract from journal-trade-line.
- **CSS utility classes** in `globals.css` for the recurring surfaces:
  `.surface-subtle`, `.hairline-b` (border-bottom), `.ai-soft` (violet soft bg+text),
  so className stays terse and token-backed.
- **Chart color hook/const** `getChartColors()` reading CSS vars at runtime (recharts
  needs real color strings, not classes) — replaces the `WIN/LOSS/VIOLET/GRID_STROKE`
  consts duplicated across `equity-curve`, `journal-pnl-charts`,
  `journal-performance-charts`, `journal-kpi-*`. Reads `--success`, `--danger`,
  `--text-tertiary`, `--hairline` via `getComputedStyle` (re-derived on theme change).

### Phase 3 — Map-and-replace (the bulk, by area)
Mechanical swaps using the table above. Grouped so it's reviewable:

**3a. Layout chrome** (`app-nav`, `nav-shared`, `user-menu`, `syncgram-nav-icons`,
`dashboard-shell`): `#F4F4F5→text-text-primary`, `#71717A→text-text-secondary`,
`#52525B→text-text-tertiary`, `#A78BFA→text-ai-accent`, `bg-white/[0.05]→surface-subtle`,
`#0a0a0b` button text → `text-accent-foreground` with `bg-accent`, nav SVG stroke →
`currentColor`.

**3b. Journal feed (my new files)** — `journal-day-card`, `journal-trade-line`,
`journal-coachs-read`, `journal-session-note`, `journal-day-stat-strip`,
`journal-month-calendar`, `journal-period-summary`: white-opacity → `hairline`/
`surface-subtle`; `#A78BFA`/violet rgba → `ai-*` tokens; `bg-white text-[#0a0a0b]` →
`bg-accent text-accent-foreground`; `text-amber-500` → `text-warning`/`--star`.

**3c. Journal tables & pages** — `journal-trade-table`, `journal-day-modal-trades-table`,
`journal-trade-history-table`, `journal-accounts-page`, `journal-page-header`,
`journal-calendar-*`, `journal-trades-panel`, `journal-evaluation-panel`,
`journal-week-summary-column`: pending(`orange`)/demo/live(`amber`/`cyan`) chips →
`<Badge>`; `#0F1012` popovers → `bg-popover`/`bg-card-bg`; HAIRLINE const → token.

**3d. Charts** — `equity-curve`, `journal-pnl-charts`, `journal-performance-charts`,
`journal-kpi-net-pnl`, `journal-kpi-trade-win`: consts → `getChartColors()`; SVG
gradient stops + grid/axis strokes from tokens.

**3e. Tag system** — `journal-tag-manager`, `journal-tag-selector`: preset palette is
fine (user-chosen tag colors are data, not theme), but `border-white` picker rings →
`hairline`, default `#64748b` fallback kept (neutral, reads on both).

**3f. Shared UI & other features** — `dialog` (backdrop→`overlay`), `switch`/copy-stream
thumb (`bg-white`→keep, but ensure track tokens), `auth/login-form` (emerald→`success`),
`ai-chat-core` (red→`danger`), `ai-dock` (`bg-black/20`→`overlay`, violet→`ai-*`),
copy-trading modals (`bg-black/60`→`overlay`), backtesting glow (light-mode-safe alpha).

**3g. AI-trigger CSS** (`globals.css` `.ai-trigger`): currently hardcoded dark shadows +
`!important`. Add light-mode shadow/border so the gradient button reads on white; keep
violet identity (violet is the AI brand in both themes).

### Phase 4 — Toggle UI
- Add a **theme toggle** to `UserMenu` (top-right) — sun/moon hugeicons, calls
  `useThemeStore().toggleTheme()`. (Optionally a quick icon-button in the header next to
  "Ask Partna AI".)
- Decide **default**: keep `dark` default (current) but allow OS preference on first load?
  → Recommend: keep explicit dark default, user opt-in to light. (Open question below.)

### Phase 5 — Contrast & QA pass
- **WCAG AA**: verify text tokens hit ≥4.5:1 on their surfaces in light (the slate scale
  already targets this; verify `text-tertiary #94a3b8` on white = ~2.8:1 → only for
  non-essential meta, OK, but flag if used for body text).
- **Manual sweep** in light mode: feed, expanded day, day modal, trade table, calendar,
  accounts, auth, AI dock. Screenshot-compare against dark.
- **Charts**: confirm green/red/grid read on white (recharts re-reads vars on theme flip).
- **Focus rings / selected states**: violet ring on white (currently `#A78BFA/70` is faint
  on light) → use `--ai-accent` (darker in light).

---

## Reusability principle (so we don't redo this)
- **No raw hex / white-opacity / palette colors in components.** Always a token or a
  primitive (`<Badge>`, `.surface-subtle`, `getChartColors()`).
- Add an **eslint guard** (optional, Phase 5): a `no-restricted-syntax`/regex lint
  warning on `bg-white/[`, `text-[#`, `bg-black/` in `src/**/*.tsx` to prevent regressions.

---

## Effort / sequencing
1. Phase 1 tokens + Phase 2 primitives (foundation) — do first, enables everything.
2. Phase 3a + 3b (chrome + journal feed) — highest-visibility surfaces.
3. Phase 3c–3g (tables, charts, shared, other features).
4. Phase 4 toggle (can land anytime after Phase 1).
5. Phase 5 contrast/QA last.

Suggested PR slicing: **(A)** tokens+primitives+toggle, **(B)** chrome+journal feed,
**(C)** tables+charts, **(D)** shared+other features+lint guard+QA.

---

## Open questions
1. **Default theme**: keep dark-default (opt-in light), or follow OS `prefers-color-scheme`
   on first visit? (Recommend: dark-default, manual toggle.)
2. **AI violet in light**: keep the same violet identity (darker for contrast), agreed?
3. **Scope now**: do all of `src/` (incl. auth, copy-trading, backtesting, AI dock), or
   **journal + chrome + toggle first** and the rest in a follow-up?
4. **Star rating / status chips**: fold into a shared `<Badge>` now, or token-swap in place
   and refactor to `<Badge>` later?
