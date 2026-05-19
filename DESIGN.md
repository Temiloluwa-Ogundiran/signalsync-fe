---
theme: dark
framework: nextjs
styling: tailwind-v4
ui-library: shadcn-ui
fonts: onest, cabinet-grotesk
---

# Design System Specification

## 1. Visual Theme and Atmosphere
<!-- Sets the emotional context for the AI agent -->
The codebase embodies a **"premium trading terminal"** aesthetic — dark, data-dense layouts with generous padding inside cards, crisp single-pixel borders, and subtle interactive transitions. Surfaces use a near-black greyscale ramp (`#0d0d0d` → `#161616` → `#2a2a2a`) with indigo as the brand accent. Avoid frantic animations; favour clean alignment, tabular numerics, and smooth 200–300ms transitions. The light theme mirrors the structure using a slate-based palette with blue as the accent.

---

## 2. Color Palette and Roles
<!-- Table formats work best for AI parser token retrieval. All tokens defined in globals.css -->

### 2.1 Backgrounds

| Role | Token | Light | Dark | Usage Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Canvas | `--bg-primary` | `#f8fafc` | `#0d0d0d` | Main application background |
| Surface | `--bg-secondary` | `#ffffff` | `#161616` | Cards, panels, elevated elements |
| Tertiary fill | `--bg-tertiary` | `#f1f5f9` | `#2a2a2a` | Subtle fills, icon containers, skeletons |
| Hover | `--bg-hover` | `#e2e8f0` | `#2a2a2a` | Interactive hover states |
| Input | `--bg-input` | `#ffffff` | `#1f1f1f` | Form input backgrounds |
| Card | `--card-bg` | `#ffffff` | `#161616` | Card component default |
| Card hover | `--card-bg-hover` | `#f8fafc` | `#2a2a2a` | Card hover state |
| Modal | `--modal-bg` | `#ffffff` | `#161616` | Dialog/modal backgrounds |
| Modal overlay | `--modal-overlay` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.65)` | Backdrop behind modals |
| Sidebar | `--sidebar-bg` | `#ffffff` | `#161616` | Sidebar background |
| Chrome bar | `--chrome-bar-bg` | — | `#181818` | Header bar, sidebar chrome surface |
| KPI card | `--kpi-card-bg` | `var(--card-bg)` | `#181818` | Journal KPI stat cards |

### 2.2 Text

| Role | Token | Light | Dark | Usage Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Primary | `--text-primary` | `#0f172a` | `#ffffff` | Headings, primary content |
| Secondary | `--text-secondary` | `#475569` | `#9ca3af` | Descriptions, form labels |
| Tertiary | `--text-tertiary` | `#94a3b8` | `#737373` | Placeholders, disabled text |
| Muted | `--text-muted` | `#cbd5e1` | `#525252` | Input placeholders, lowest priority |
| Footnote | `--footnote-online` | `#64748b` | `#d4d4d4` | KPI labels, online status, footnotes |

### 2.3 Borders

| Role | Token | Light | Dark | Usage Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Primary | `--border-primary` | `#e2e8f0` | `#333333` | Cards, inputs, section dividers |
| Secondary | `--border-secondary` | `#cbd5e1` | `#525252` | Stronger outlines, button borders |
| Chrome control | `--chrome-control-border` | — | `#737373` | Header pill-button outlines |
| Sidebar divider | `--sidebar-divider` | — | `rgba(115,115,115,0.2)` | Nav group separators |
| Sidebar bottom | `--sidebar-bottom-border` | — | `#737373` | Sidebar footer border |

### 2.4 Accent (Brand)

| Role | Token | Light | Dark | Usage Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Accent | `--accent` | `#2563eb` (blue-600) | `#6366f1` (indigo-500) | Primary CTAs, active states, links |
| Accent hover | `--accent-hover` | `#1d4ed8` (blue-700) | `#4f46e5` (indigo-600) | Hovered accent elements |
| Accent light | `--accent-light` | `rgba(37,99,235,0.08)` | `rgba(99,102,241,0.15)` | Low-opacity accent backgrounds |

### 2.5 Semantic

| Role | Token | Light | Dark | Usage Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Success | `--success` | `#10b981` | `#4ade80` | Profit, positive trends, win |
| Success light | `--success-light` | `rgba(16,185,129,0.08)` | `rgba(74,222,128,0.12)` | Success badge backgrounds |
| Danger | `--danger` | `#ef4444` | `#f87171` | Loss, errors, destructive actions |
| Danger light | `--danger-light` | `rgba(239,68,68,0.08)` | `rgba(248,113,113,0.12)` | Danger badge backgrounds |
| Warning | `--warning` | `#f59e0b` | `#f59e0b` | Caution states |
| Warning light | `--warning-light` | `rgba(245,158,11,0.08)` | `rgba(245,158,11,0.12)` | Warning badge backgrounds |
| Info | `--info` | `#3b82f6` | `#3b82f6` | Informational accents |
| Info light | `--info-light` | `rgba(59,130,246,0.08)` | `rgba(59,130,246,0.12)` | Info badge backgrounds |

### 2.6 Gradients

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--gradient-accent` | `linear-gradient(135deg, accent, accent-hover)` | Primary CTA backgrounds |
| `--gradient-card` | `linear-gradient(135deg, accent/0.06, info/0.03)` | Subtle card fills |
| `--ask-sync-gradient` | `linear-gradient(262.75deg, #818cf8 1.94%, #393b8b 97.07%)` | AI feature button |

### 2.7 Shadows

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 2px 4px rgba(22,26,32,0.04), 0 16px 32px -4px rgba(22,26,32,0.1)` | Cards, badges |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | `0 4px 12px rgba(0,0,0,0.35)` | Hover elevation step-up |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | `0 12px 24px rgba(0,0,0,0.45)` | Modals, popovers, prominent cards |

### 2.8 Domain-Specific Tokens
<!-- KPI, calendar, and journal tokens are also in globals.css. Reference them by name; never hardcode. -->
- **KPI cards:** `--kpi-metric-positive`, `--kpi-trend-bg/fg`, `--kpi-legend-win-bg/fg`, etc.
- **Calendar heatmap:** `--calendar-cell-win-bg`, `--calendar-cell-loss-bg`, `--calendar-selected-ring`, etc.
- **Journal voice:** `--journal-voice-outer`, `--journal-voice-play-bg/fg`, etc.
- **Sidebar chrome:** `--sidebar-nav-active-bg`, `--sidebar-nav-active-text`, `--sidebar-nav-inactive-text`, etc.

> **Rule:** Never hardcode hex values in components. Always reference a token from `globals.css`.

---

## 3. Typography Rules
<!-- Font families loaded in root layout.tsx -->
**Font Family:** `Onest` (UI — body, labels, navigation), `Cabinet Grotesk` (Display — titles, hero metrics, brand)

| Level | Tailwind Classes | Size | Weight | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Page title | `font-heading text-4xl font-bold` | ~36px | `700` | Header `<h1>`, e.g. "Journal" |
| Section heading | `font-heading text-2xl md:text-3xl font-bold` | 24–30px | `700` | Sub-page headers |
| Card title | `text-2xl font-semibold leading-none tracking-tight` | ~24px | `600` | shadcn CardTitle |
| KPI hero number | `font-heading text-[2rem] font-bold tracking-[-0.03em]` | 32px | `700` | Net P&L, big stats |
| Body / label | `text-sm font-medium` | 14px | `500` | Form labels, nav items |
| Body description | `text-sm text-text-secondary` | 14px | `400` | Card descriptions, helper text |
| Caption | `text-xs font-medium` | 12px | `500` | Timestamps, metadata, badges |
| Footnote | `text-[10px] leading-normal` | 10px | `400` | "Online" status, micro labels |
| Micro | `text-[0.62rem]` – `text-[0.65rem]` | ~10px | `400` | Calendar day numbers, counts |

### Typography Rules
- `font-heading` (Cabinet Grotesk) → **only** for page titles, KPI hero numbers, and the brand wordmark "TradePartna".
- `font-sans` (Onest) → everything else: body, labels, buttons, navigation.
- Use `tabular-nums tracking-wide` on numeric counters and badges for visual alignment.
- Never fall back to browser-default fonts.

---

## 4. Component Styles
<!-- Describes how each component category should be styled for consistency -->

### 4.1 Button (Primary)
- **Component:** `<Button>` from `@/components/ui/button` (shadcn, CVA-based)
- **Background:** `bg-primary` (maps to accent)
- **Text:** `text-primary-foreground`
- **Border-Radius:** `rounded-md` (~8px)
- **Hover:** `hover:bg-primary/80`
- **Focus:** `focus-visible:ring-3 focus-visible:ring-ring/50`
- **Disabled:** `disabled:pointer-events-none disabled:opacity-50`

| Variant | Usage |
| :--- | :--- |
| `default` | Primary filled actions |
| `outline` | Secondary bordered actions |
| `ghost` | Toolbar, nav, inline actions |
| `destructive` | Danger actions (red tint) |
| `link` | Inline text links |

| Size | Height | Usage |
| :--- | :--- | :--- |
| `xs` | 24px | Compact inline |
| `sm` | 32px | Secondary actions |
| `default` | 36px | Standard |
| `lg` | 40px | Prominent actions |
| `icon` | 36×36 | Icon-only buttons |

#### Custom CTA pattern (toolbar)
```
rounded-full bg-accent px-5 h-11 text-sm font-semibold text-white hover:bg-accent-hover
```

### 4.2 Card
- **Component:** `<Card>` from `@/components/ui/card`
- **Background:** `bg-card-bg`
- **Border:** `border border-border-primary`
- **Border-Radius:** `rounded-2xl`
- **Shadow:** `shadow-lg`
- **Hover (interactive cards):** `hover:shadow-lg hover:border-accent/30`
- **Padding:** `p-6` (CardHeader, CardContent)

#### KPI Card variant (lightweight)
```
rounded-xl border border-kpi-badge-border/80 bg-kpi-card-bg p-4 shadow-sm min-h-[7.625rem]
```

### 4.3 Input
- **Component:** `<Input>` from `@/components/ui/input`
- **Height:** `h-10`
- **Background:** `bg-bg-input`
- **Border:** `border border-border-primary`
- **Border-Radius:** `rounded-md`
- **Focus:** `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`
- **Placeholder:** `placeholder:text-text-muted`

### 4.4 Dialog / Modal
- **Component:** `<Dialog>` from `@/components/ui/dialog`
- **Overlay:** `bg-black/10` with `backdrop-blur-xs`
- **Content:** `rounded-xl bg-background p-6 ring-1 ring-foreground/10`
- **Enter:** `animate-in fade-in-0 zoom-in-95`
- **Exit:** `animate-out fade-out-0 zoom-out-95`
- **Close button:** Built-in via shadcn — `ghost` variant, top-right. Never duplicate.

### 4.5 Sidebar Navigation Item
- **Shape:** `rounded-full min-h-[44px]`
- **Active:** `border border-sidebar-nav-active-border bg-sidebar-nav-active-bg text-sidebar-nav-active-text`
- **Inactive:** `border-transparent text-sidebar-nav-inactive-text hover:bg-sidebar-nav-active-bg/40 hover:text-sidebar-nav-active-text`
- **Font:** `text-base font-semibold leading-snug`
- **Icon size:** `h-6 w-6`

### 4.6 Badge / Pill
```
<!-- Semantic status badge -->
rounded-full border border-success/20 bg-success-light px-2 py-0.5 text-[10px] font-bold uppercase text-success

<!-- Neutral counter badge -->
rounded-full border border-kpi-badge-border bg-kpi-card-bg px-1.5 text-xs font-bold tabular-nums text-footnote-online
```

### 4.7 Form Pattern
<!-- Always use React Hook Form + Zod + shadcn Form components -->
- **Field spacing:** `space-y-4`
- **Form section spacing:** `space-y-6`
- **Error display:** `<p className="text-sm font-medium text-destructive">`
- **Loading state:** `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` inline with label text
- **Submit button:** `<Button className="w-full" type="submit" disabled={isPending}>`

### 4.8 Loading States
- **Skeleton:** `animate-pulse rounded-xl border bg-kpi-card-bg` matching the loaded component's shape
- **Spinner:** Lucide `<Loader2>` with `animate-spin`
- **Progress bar:** Custom `animate-journal-sync-indeterminate` keyframe (1.25s ease-in-out infinite)

### 4.9 Toasts
- **Library:** Sonner
- **Config:** `richColors position="top-right"`
- **Usage:** `toast.success()`, `toast.error()`, `toast("message", { description })` 

---

## 5. Layout and Spacing
<!-- Structural decisions that affect every page -->

### 5.1 Dashboard Shell

| Element | Value | Notes |
| :--- | :--- | :--- |
| Shell | `flex h-screen flex-col md:flex-row` | Sidebar left, main column right |
| Sidebar expanded | `w-[240px]` | — |
| Sidebar collapsed | `w-[72px]` | Icons only, tooltip on hover |
| Sidebar transition | `transition-[width] duration-200 ease-out` | — |
| Header height | `h-[60px]` | Fixed, non-scrollable |
| Header padding | `pl-[26px] pr-[26px]` | — |
| Main content | `flex-1 overflow-y-auto pb-20 md:pb-0` | `pb-20` accounts for mobile nav |
| Mobile bottom nav | `fixed bottom-0 z-50 w-full` | Hidden on `md:` and above |

### 5.2 Auth Layout
- Centered: `min-h-screen items-center justify-center`
- Content width: `max-w-md`
- Background effects: blurred gradient blobs (`rounded-full bg-accent/10 blur-[120px]`) + subtle grid overlay

### 5.3 Content Grids

| Context | Grid Pattern |
| :--- | :--- |
| KPI strip | `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3` |
| Calendar | `grid grid-cols-7 gap-1.5` |
| Toolbar | `flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4` |

### 5.4 Spacing Conventions

| Context | Spacing |
| :--- | :--- |
| Card internal padding | `p-4` (compact) to `p-6` (standard) |
| Section vertical gaps | `space-y-4` or `space-y-6` |
| Nav item gaps | `gap-1` between items |
| Nav group dividers | `my-3 h-px bg-sidebar-divider` |

### 5.5 Responsive Strategy
- **Mobile-first:** Base styles are mobile, enhance via `sm:`, `md:`, `lg:`, `xl:`.
- **Avoid hardcoded pixel widths** for content. Use flex/grid fractions so containers fill available space.
- Sidebar hidden on mobile (`hidden md:flex`), mobile bottom nav visible (`md:hidden`).

---

## 6. Border Radius Scale
<!-- Base radius: --radius: 0.625rem (10px) -->

| Token | Computed Value | Common Usage |
| :--- | :--- | :--- |
| `rounded-sm` | `calc(radius × 0.6)` ≈ 6px | — |
| `rounded-md` | `calc(radius × 0.8)` ≈ 8px | Buttons, inputs |
| `rounded-lg` | `radius` = 10px | Small cards, dropdowns |
| `rounded-xl` | `calc(radius × 1.4)` ≈ 14px | KPI cards, inline cards |
| `rounded-2xl` | `calc(radius × 1.8)` ≈ 18px | Large cards (shadcn Card) |
| `rounded-full` | `9999px` | Nav items, pills, avatars, primary CTAs |

---

## 7. Animation and Transitions
<!-- Keep transitions subtle and purposeful -->

| Pattern | Implementation | Duration |
| :--- | :--- | :--- |
| Color/background | `transition-colors` | 150ms (default) |
| All properties | `transition-all` | 300ms |
| Hover scale | `group-hover:scale-105 transition-transform` | 300ms |
| Slide-in reveal | `opacity-0 -translate-x-2 → opacity-100 translate-x-0` | 300ms |
| Theme switch | `background-color 0.2s ease, color 0.2s ease` | 200ms |
| Sidebar collapse | `transition-[width] ease-out` | 200ms |
| Dialog enter | `animate-in fade-in-0 zoom-in-95` | 100ms |
| Dialog exit | `animate-out fade-out-0 zoom-out-95` | 100ms |
| Loading spin | `animate-spin` | continuous |
| Skeleton pulse | `animate-pulse` | continuous |
| Sync progress | `journal-sync-indeterminate` keyframe | 1.25s ease-in-out infinite |

---

## 8. Icon System
<!-- Centralised icon management avoids clutter in feature components -->

### Rules
1. **Never inline SVG in feature components.** Extract icons to `src/components/icons/` and export.
2. Use **Lucide React** for standard UI icons (arrows, menus, loaders, chevrons).
3. Use **custom SVG components** in `syncgram-nav-icons.tsx` for brand/navigation icons.
4. Use **static SVG files** in `/public/icons/` for sidebar nav items (rendered via `<Image>`).

### Custom Icon Convention
```tsx
type IconProps = SVGProps<SVGSVGElement> & { active?: boolean };

export function IconExample({ active = false, ...p }: IconProps) {
  const c = active ? "#F5F5F5" : "#737373";
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path d="..." stroke={c} strokeWidth="1.75" />
    </svg>
  );
}
```

### Icon Sizing

| Context | Size |
| :--- | :--- |
| Nav items, mobile nav | `h-6 w-6` (24px) |
| Inline button icons | `h-4 w-4` (16px) |
| KPI trend indicator | `size-5` (20px) |

---

## 9. Scrollbar Utilities

| Class | Effect |
| :--- | :--- |
| `scrollbar-hide` | Hides scrollbar entirely (all browsers) |
| `scrollbar-thin` | 4px-wide scrollbar with `bg-tertiary` thumb |

---

## 10. Project Structure and Conventions
<!-- Codifies how new features should be organised -->

### 10.1 Directory Structure
```
src/
├── app/                        # Routing layer ONLY — minimal logic
│   ├── (auth)/                 # Login, Register, Verify Email
│   ├── (dashboard)/            # Sidebar + Header shell
│   ├── globals.css             # ALL design tokens
│   ├── layout.tsx              # Root layout (fonts, providers)
│   └── providers.tsx           # Session, QueryClient, Nuqs, Toaster
├── features/                   # THE CORE — isolated business logic per domain
│   └── {domain}/
│       ├── api/                # Axios API functions ({domain}.api.ts)
│       ├── components/         # Domain-scoped UI components
│       ├── hooks/              # TanStack Query hooks (use-{domain}.ts)
│       ├── lib/                # Pure helpers, mappers, aggregates
│       ├── store/              # Zustand stores ({domain}-ui-store.ts)
│       └── types.ts            # Domain types
├── components/                 # Shared "dumb" UI
│   ├── ui/                     # shadcn primitives (Button, Input, Card, etc.)
│   └── icons/                  # Custom SVG icon components
├── lib/                        # Singletons & utilities
│   ├── api/                    # Axios client, error handling, withAuth()
│   └── utils.ts                # cn() helper (clsx + twMerge)
└── hooks/                      # Shared custom hooks
```

### 10.2 Naming Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| Feature component | PascalCase, domain-prefixed | `JournalKpiNetPnl` |
| Component file | kebab-case | `journal-kpi-net-pnl.tsx` |
| Hook file | `use-` prefix | `use-journal-accounts.ts` |
| API file | `{domain}.api.ts` | `journal-account.api.ts` |
| Store file | `{domain}-ui-store.ts` | `journal-ui-store.ts` |
| Types file | `types.ts` at feature root | `features/journal/types.ts` |

### 10.3 Data Fetching Pattern
<!-- Never use useEffect for data fetching -->
- **Server state:** TanStack Query (`useQuery`, `useMutation`)
- **Query keys:** Defined as a `KEYS` object at the top of each hook file
- **Auth token:** Read from `useSession()`, passed via `withAuth(token)` helper
- **Invalidation:** `queryClient.invalidateQueries()` in `onSuccess` callbacks

### 10.4 State Management
- **Server state:** TanStack Query (caching, deduplication, optimistic updates)
- **Client state:** Zustand with `persist` middleware (e.g. active account ID)
- **URL state:** nuqs for filters/tabs (shareable URLs)
- **Form state:** React Hook Form + Zod validation

### 10.5 Component Conventions
- Use `function` declarations for exported components (not arrow functions or `React.FC`)
- Accept `className?: string` on reusable components; merge with `cn()`
- Use `"use client"` only when the component needs hooks or event handlers
- Feature components → `features/{domain}/components/`, never in `app/`
- Route `page.tsx` files should be thin wrappers that import feature components

---

## 11. Do's and Don'ts

### ✅ Do
- Reference color tokens from `globals.css` — e.g., `bg-card-bg`, `text-text-secondary`
- Use `cn()` from `@/lib/utils` for conditional classnames
- Use shadcn primitives (`Button`, `Input`, `Card`, `Dialog`) from `@/components/ui/`
- Use `font-heading` for page titles and hero metrics only
- Use `rounded-full` for nav items, pills, avatars, primary CTAs
- Use `rounded-xl` or `rounded-2xl` for cards
- Group SVG icons in `src/components/icons/` and export them
- Use TanStack Query for all server data
- Use `withAuth(session?.accessToken)` with the API client
- Add `transition-colors` or `transition-all` to interactive elements
- Keep route `page.tsx` files thin

### ❌ Don't
- Hardcode hex colors in components — always use tokens
- Put SVG inline in feature components — extract to icon files
- Use `useEffect` for data fetching — use TanStack Query
- Use raw `axios` — use the singleton `apiClient` from `@/lib/api/client`
- Use hardcoded pixel widths for layout — prefer flex/grid
- Create components directly in `app/` route directories
- Use `React.FC` — use `function` declarations with typed props
- Duplicate the close icon across modals — use shadcn Dialog's built-in
- Use Tailwind color classes like `text-blue-500` — use semantic tokens like `text-accent`

---

*Last updated: 2026-05-19*
