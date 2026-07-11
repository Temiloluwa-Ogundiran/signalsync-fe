FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

FROM base AS deps

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# NEXT_PUBLIC_* are inlined at build time, so they must be present here (not just
# at runtime). Railway passes service variables as build args.
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

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

COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
