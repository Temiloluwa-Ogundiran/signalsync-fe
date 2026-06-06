# Frontend Production Dockerfile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-ready Dockerfile for the Next.js frontend using standalone output.

**Architecture:** Update Next.js to emit a standalone server bundle, then build a multi-stage Node image that installs dependencies, runs `yarn build`, and ships only the compiled runtime and static assets. Keep the runtime contract simple: production mode on port `3000`.

**Tech Stack:** Next.js 16, React 19, Yarn Classic, Docker multi-stage builds, Node.js

---

## File Map

- Create: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/Dockerfile`
- Modify: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/next.config.ts`
- Verify with: `yarn build`

### Task 1: Enable standalone output

**Files:**
- Modify: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/next.config.ts`

- [ ] **Step 1: Update the Next config**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify the config file**

Run:

```powershell
Get-Content C:\Users\USER\Documents\SyncTrade\synctrades-fe\next.config.ts
```

Expected: the config includes `output: "standalone"` and preserves the existing turbopack root.

### Task 2: Add the production Dockerfile

**Files:**
- Create: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/Dockerfile`

- [ ] **Step 1: Add the multi-stage Dockerfile**

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

- [ ] **Step 2: Verify the Dockerfile content**

Run:

```powershell
Get-Content C:\Users\USER\Documents\SyncTrade\synctrades-fe\Dockerfile
```

Expected: a multi-stage build with `deps`, `builder`, and `runner` stages, and a final `node server.js` command.

### Task 3: Verify the standalone build output

**Files:**
- Verify: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/next.config.ts`
- Verify: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/Dockerfile`

- [ ] **Step 1: Run the production build**

Run:

```powershell
yarn build
```

Working directory:

```text
C:\Users\USER\Documents\SyncTrade\synctrades-fe
```

Expected: successful Next.js production build and generated `.next/standalone` output.

- [ ] **Step 2: Confirm standalone artifacts exist**

Run:

```powershell
Get-ChildItem C:\Users\USER\Documents\SyncTrade\synctrades-fe\.next\standalone
```

Expected: the standalone server output exists and includes `server.js`.

### Task 4: Commit the frontend Docker support

**Files:**
- Create: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/Dockerfile`
- Modify: `C:/Users/USER/Documents/SyncTrade/synctrades-fe/next.config.ts`

- [ ] **Step 1: Review the final diff**

Run:

```powershell
git -C C:\Users\USER\Documents\SyncTrade\synctrades-fe diff -- Dockerfile next.config.ts
```

Expected: only the standalone output config and Dockerfile addition are present.

- [ ] **Step 2: Commit the change**

Run:

```powershell
git -C C:\Users\USER\Documents\SyncTrade\synctrades-fe add Dockerfile next.config.ts
git -C C:\Users\USER\Documents\SyncTrade\synctrades-fe commit -m "chore: add frontend production dockerfile"
```

Expected: one clean commit containing the production image support.
