# Synctrades Frontend Production Dockerfile Design

Date: 2026-06-06
Repo: `synctrades-fe`
Branch: `staging`

## Goal

Add a production-grade Docker image for the Next.js frontend that fits Dokploy deployment cleanly without introducing extra deployment scaffolding.

The result should:

- add a production `Dockerfile`
- optimize the runtime image for deployment, not local development
- use Next.js standalone output for a smaller final image
- preserve the existing frontend behavior and build flow

## Current Problems

The frontend currently has no Docker image definition, which means there is no repository-native production container contract for Dokploy or similar platforms.

Without a Dockerfile:

- deployment depends on external build assumptions
- runtime shape is implicit instead of versioned in the repo
- the app cannot be built into a production image in a repeatable way

## Decisions

### Container strategy

The frontend will use a multi-stage Docker build:

1. dependency install stage
2. build stage running `yarn build`
3. final runtime stage shipping only the standalone server output and required static assets

This keeps the runtime image smaller and cleaner than copying the entire project into the final container.

### Next.js output mode

`next.config.ts` will enable:

- `output: "standalone"`

This allows the build to emit the minimal self-contained server bundle needed for production runtime.

### Runtime contract

The final container will:

- run in production mode
- expose port `3000`
- start the generated standalone server with `node server.js`

The image will not hardcode environment-specific values. Runtime configuration will continue to come from platform-provided environment variables.

### Relevant runtime environment

The frontend’s meaningful runtime environment remains:

- `NEXT_PUBLIC_API_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `AUTH_TRUST_HOST`

These are not being redesigned here. The Dockerfile only needs to support them being injected at runtime.

## Deliverables

The implementation will:

- create `C:/Users/USER/Documents/SyncTrade/synctrades-fe/Dockerfile`
- modify `C:/Users/USER/Documents/SyncTrade/synctrades-fe/next.config.ts`
- verify the build with `yarn build`

## Non-Goals

This change does not:

- add a frontend `docker-compose.yml`
- redesign frontend environment handling
- change application routes or auth behavior
- add reverse proxy or ingress configuration
- modify backend deployment artifacts
