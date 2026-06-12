# sync-trades-fe — Engineering Rules

**Read this before writing or changing ANY code in this repo.** These rules are mandatory.
They exist because every one of them was violated once and caused a real bug or a mess we had
to audit our way out of (see `../CODE_AUDIT_REPORT.md`). If a rule blocks you, stop and ask —
do not improvise around it.

**If you are an LLM:** treat every rule here as a hard constraint, like a failing type-check.
When your change would violate a rule, the change is wrong — not the rule. Never "temporarily"
break a rule with a TODO.

---

## 1. File Structure — where every file goes

This is the canonical tree. **A new file that doesn't fit one of these slots is in the wrong
place.** Do not invent new top-level directories.

```
src/
├── app/                      # ROUTES ONLY. page.tsx / layout.tsx / loading.tsx / route.ts
├── features/<feature>/       # vertical slices: auth, journal, post, stream, feed, dashboard, theme
│   ├── api/                  # fetch functions only — no React, no token params
│   ├── components/           # feature UI (+ co-located *.skeleton.tsx)
│   ├── hooks/                # use-*-queries.ts, use-*-mutations.ts, use-*-controller.ts
│   ├── lib/                  # pure functions only — no React imports
│   ├── store/                # zustand — UI prefs + ids ONLY (see §4)
│   ├── types.ts
│   └── index.ts              # the feature's PUBLIC API — the only import path from outside
├── components/
│   ├── ui/                   # design-system primitives (button, card, dialog, skeleton…)
│   └── layout/               # header, sidebar, mobile-nav, stream-switcher, status-widget…
├── lib/
│   ├── api/                  # client.ts, types.ts, error-handler.ts, query-keys.ts
│   ├── auth/                 # auth.ts, auth.config.ts, auth-session.ts, auth-backend-url.ts
│   └── utils.ts
├── config/                   # feature-flags.ts, env helpers — configuration, not logic
├── hooks/                    # genuinely app-global hooks only (e.g. use-debounce)
├── types/                    # ambient/global types (next-auth.d.ts)
└── proxy.ts                  # Next middleware — stays at src root (framework requirement)
```

### Placement decision table

| You are writing…                          | It goes in…                                  |
|-------------------------------------------|----------------------------------------------|
| A route                                    | `app/.../page.tsx` (thin shell, see §2)      |
| A component used by ONE feature            | `features/<feature>/components/`             |
| A component used by 2+ features            | `components/ui/` (if generic) — otherwise reconsider the design |
| A data-fetching function                   | `features/<feature>/api/`                    |
| A React Query hook                         | `features/<feature>/hooks/`                  |
| A pure helper (dates, math, mapping)       | `features/<feature>/lib/` or `lib/utils.ts`  |
| Client-side persistent preference          | `features/<feature>/store/` (zustand)        |
| A query key                                | `lib/api/query-keys.ts` — NOWHERE else       |
| Auth/session plumbing                      | `lib/auth/`                                  |

### Import boundaries (enforced by eslint-plugin-boundaries — do not disable)

- `app/` may import from `features/` and shared (`components/`, `lib/`, `hooks/`, `config/`).
- `features/X` may import from shared and from **itself**. **NEVER from `features/Y`.**
  If two features need the same thing, it moves to `components/ui` or `lib/` — it does not
  get imported across the feature boundary.
- Shared (`components/`, `lib/`, `hooks/`) may import only from shared. Never from `features/` or `app/`.
- Outside a feature, import only from its barrel: `@/features/journal` — never deep paths
  like `@/features/journal/components/journal-calendar`.

### Naming

- **kebab-case for every file**: `create-post-modal.tsx`, not `CreatePostModal.tsx`.
- Hooks files start with `use-`. One component per file. `lib/` files never import React.
- Skeletons are co-located: `journal-calendar.tsx` + `journal-calendar.skeleton.tsx`.

---

## 2. Pages are thin shells

`page.tsx` files contain **composition only** — target ≤ 50 lines, hard ceiling ~100.

- ❌ No `useState` beyond trivial UI toggles. No business logic. No fetch calls. No 200-line handlers.
- ❌ No helper functions defined inside `page.tsx` — they go to `features/<feature>/lib/`.
- ✅ A page imports a `<FeaturePage />` component from the feature and renders it inside `<Suspense>`.
- ✅ **Every route group has a `loading.tsx`** with a skeleton. A new route without one is incomplete.
- Components > ~200 lines or files > ~400 lines require a written justification in the PR.
  "It grew" is not a justification — extract a hook or a child component.

The historical anti-example is the old 880-line `journal/page.tsx` that owned a sync state
machine, five polling effects, and date math. Never recreate it.

---

## 3. Server state: React Query owns it — completely

**S1. Server entities live in the React Query cache and nowhere else.**
- ❌ Never copy query data into `useState` or a zustand store.
- ❌ Never store a server entity (a Trade, a Stream, a Post) in zustand. Store the **id**;
  resolve the entity from a query.

**S2. Every query key comes from `lib/api/query-keys.ts`.**
- ❌ No string-literal keys at call sites — not in `useQuery`, not in `invalidateQueries`,
  not in `setQueryData`. A literal key in a diff is an automatic review rejection.
- Why this is non-negotiable: we shipped a broken optimistic rollback because one call site
  used `["stream-posts"]` and another `["stream-posts", streamId]`. The factory makes that
  drift impossible.
- Never change an existing key's shape casually — it silently drops cache and breaks every
  matching invalidation. Migrating a key = update the factory + grep and update ALL matching
  `invalidateQueries`/`setQueryData`/`getQueryData` in the same PR.

**S3. Tokens never appear in query keys.** Keys identify *data*, not *credentials*.
Auth state changes are handled centrally (see §6), not by key-thrashing the whole cache.

**S4. Mutations follow exactly one of two shapes:**
1. *Invalidate-only* (default): `onSuccess`/`onSettled` invalidates the affected keys —
   **all** of them (list views, detail view, replies/children). A delete that leaves the
   entity visible in another cached view is a bug.
2. *Full optimistic*: `onMutate` snapshots with `getQueriesData` (prefix match — returns
   `[key, data]` pairs), applies the optimistic update, returns the snapshots; `onError`
   restores **per exact key** from the snapshot pairs; `onSettled` invalidates.
   - ❌ Never snapshot with `getQueryData(prefix)` — it requires an exact key match and
     silently returns `undefined` for parameterized keys. This exact mistake broke upvote
     rollback once.

**S5. Loading UX is part of the feature, not an afterthought.**
- Parameterized queries that re-fire on navigation (months, date ranges, pagination) use
  `placeholderData: keepPreviousData` so the UI never blanks.
- Below-the-fold widgets defer with `enabled` until visible/needed.
- Never fetch the same data twice on one page — if a composite endpoint (e.g. dashboard)
  already contains a sub-resource, use it; only fire the standalone query for the variant
  the composite doesn't cover.

---

## 4. Client state: three tiers, picked deliberately

| Tier | Use for | Rules |
|------|---------|-------|
| **URL** (`searchParams` / nuqs) | Anything shareable or refresh-survivable: active date, filters, selected ids | Prefer this for navigation state |
| **Zustand (persisted)** | Cross-session *preferences* only (theme, `includeManualTrades`, active account id) | See below |
| **Component `useState`** | Ephemeral UI: drafts, local toggles, in-flight flags | Default choice |

Zustand store rules:
- Stores hold **primitives and ids**, never server entities (see S1).
- Every `persist` config MUST have `version` + `migrate` + explicit `partialize`.
  Persisting an un-versioned object shape is how we got stale-schema rehydration bugs.
- State setters are pure: ❌ no side effects (`abort()`, `URL.revokeObjectURL`, fetches)
  inside a `set()` updater or React `setState` updater — React may invoke updaters more
  than once. Compute first / queue the side effect after.
- No dead conditionals like `open ? null : null`. If you can't express the intent, ask.

---

## 5. Effects, rendering, memoization

- **Never put a React Query result object in a dependency array** — `useQuery` returns a new
  object identity every render and your effect/interval will be torn down and recreated every
  render. Depend on the stable pieces: `query.refetch`, `query.data`, setters.
- Every `setInterval`/`setTimeout`/listener in an effect returns a cleanup function.
- Async work in effects/handlers is cancellable: `AbortController` created in the effect,
  aborted in cleanup, and the signal threaded into the axios call. ❌ The `isMounted`-flag
  pattern is banned (it doesn't cancel the request).
- Derived values computed in a render body (mapped rows, aggregates, registries) are wrapped
  in `useMemo`; pure constants are hoisted to module scope.
- Heavy presentational children on polling pages get `React.memo`. Acceptance test: a poll
  tick re-renders only components that read polled data (verify with the React profiler).
- Browser APIs (`MediaRecorder`, `getUserMedia`, clipboard…) are used only behind feature
  detection + `window.isSecureContext` + try/catch with a user-facing toast on failure.

---

## 6. Auth & API layer

- **Auth is plumbing, not data flow.** The `/api/proxy` route validates the NextAuth session
  server-side and injects the `Authorization` header itself.
  - ❌ api functions do NOT take `token` parameters.
  - ❌ hooks do NOT read `session.accessToken` to pass it along. `useSession()` is for
    identity display and `enabled` gating only.
- All browser requests go through the singleton `apiClient` (`lib/api/client.ts`).
  ❌ No raw `fetch`/`axios.create` in features.
- Backend URL resolution exists in exactly one place: `lib/auth/auth-backend-url.ts`.
  ❌ Never re-read `process.env.BACKEND_URL` elsewhere.
- **File uploads use `FormData` — that is the correct and required way.** The rule is only
  about the header: ❌ never set `Content-Type` manually on a `FormData` request. Axios
  auto-generates `multipart/form-data; boundary=...`, and a manual header overwrites it
  WITHOUT the boundary, which breaks the upload server-side. (We had four copies of this bug.)

  ```ts
  // ❌ broken — manual header strips the boundary parameter
  await apiClient.post("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // ✅ correct — pass FormData and let axios set the header itself
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post("/uploads/image", formData, { timeout: 120_000 }); // slow-call override OK
  ```
- Default request timeout is 30s. Genuinely slow calls (file uploads) override per-request,
  with a comment saying why.
- Parsing backend `Set-Cookie` headers happens only via the shared helper in `lib/auth/`
  (`getSetCookie()`-based) — never an inline regex.
- Errors surface through `ApiException` + the central error handler. ❌ No swallowing errors
  into `console.log`.

---

## 7. Forms

- Any form with more than ~3 fields uses `react-hook-form` + `zod` (`zodResolver`).
  ❌ Never a constellation of `useState` per field — that's how we got two 39KB modal files.
- One schema per form, in `features/<feature>/lib/*-validation.ts`, shared by create/edit
  variants. Create and edit are ONE component with `mode: "create" | "edit"` — never two
  copy-pasted files.

---

## 8. Copy-paste & duplication

- Before writing a hook/api function, check whether a sibling already does 90% of it.
  Three near-identical functions = mandatory factory/abstraction (we collapsed seven
  copy-pasted analytics hooks once; do not regrow them).
- Before adding a helper, grep for it — `formatDateParam` existed in 3+ places at one point.
- Dead code is deleted, not commented out. Unused files are deleted in the same PR that
  obsoletes them.

---

## 9. PR checklist (LLMs: self-verify before declaring done)

- [ ] Every new file matches the placement table in §1; imports respect boundaries.
- [ ] No string-literal query keys; no token params; no entities in stores.
- [ ] No query objects in dependency arrays; all timers/requests cleaned up/abortable.
- [ ] New routes have `loading.tsx`; parameterized queries use `keepPreviousData`.
- [ ] No `as any` (typed escape hatches require a comment explaining the constraint).
- [ ] kebab-case filenames; pages ≤ ~50 lines; no component > ~200 lines without justification.
- [ ] `yarn lint` passes with zero new warnings; boundaries plugin not disabled anywhere.
- [ ] Behavior unchanged unless the task explicitly says otherwise.
