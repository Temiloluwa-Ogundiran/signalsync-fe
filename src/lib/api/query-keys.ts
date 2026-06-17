/**
 * Centralized React Query key factory.
 *
 * IMPORTANT: these functions return the EXACT array shapes already in use across
 * the app. Do not change a shape without migrating every matching
 * invalidate/setQueryData/removeQueries call — changing a key's array shape
 * silently drops its cache (audit P2-12 / Rule S3).
 *
 * Many keys accept an optional trailing segment (e.g. an access token for
 * streams, or a streamId/postId). When omitted, the function returns the bare
 * prefix used by partial-match invalidations.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.journal.day(accountId, date) })
 */

export const queryKeys = {
  auth: {
    session: () => ["session"] as const,
  },

  journal: {
    accounts: () => ["journal-accounts"] as const,
    day: (accountId: string, date: string) =>
      ["journal-day", accountId, date] as const,
    tradeHistory: (accountId: string) =>
      ["journal-trade-history", accountId] as const,
    tradeHistoryRange: (
      accountId: string | undefined,
      fromDate: string | undefined,
      toDate: string | undefined,
      includeManual: boolean,
    ) =>
      ["journal-trade-history", accountId, fromDate, toDate, includeManual] as const,
    feed: (accountId: string) => ["journal-feed", accountId] as const,
    tags: (accountId: string) => ["journal-tags", accountId] as const,
    openPositions: (accountId: string | undefined, limit?: number) =>
      limit === undefined
        ? (["journal-open-positions", accountId] as const)
        : (["journal-open-positions", accountId, limit] as const),
  },

  ai: {
    suggestions: () => ["ai-suggestions"] as const,
  },

  accounts: {
    list: () => ["trading-accounts"] as const,
    detail: (accountId: string) => ["trading-account", accountId] as const,
  },

  streams: {
    // ["my-streams"] or ["my-streams", token]
    mine: (token?: string) =>
      token === undefined
        ? (["my-streams"] as const)
        : (["my-streams", token] as const),
    // ["discover-streams"] or ["discover-streams", token]
    discover: (token?: string) =>
      token === undefined
        ? (["discover-streams"] as const)
        : (["discover-streams", token] as const),
    // Bare prefix: ["stream-detail"]
    detailRoot: () => ["stream-detail"] as const,
    // ["stream-detail", streamId] (invalidation)
    detail: (streamId: string) => ["stream-detail", streamId] as const,
    // ["stream-detail", streamId, token] (query key)
    detailWithToken: (streamId: string | undefined, token?: string) =>
      ["stream-detail", streamId, token] as const,
    // ["stream-members", streamId, token] — mutable to satisfy useInfiniteQuery's
    // unknown[] TQueryKey generic.
    members: (streamId: string | undefined, token?: string) =>
      ["stream-members", streamId, token],
    // ["stream-join-requests", streamId, token]
    joinRequests: (streamId: string | undefined, token?: string) =>
      ["stream-join-requests", streamId, token],
  },

  posts: {
    // Bare prefix: ["post"]
    detailRoot: () => ["post"] as const,
    // ["post", postId]
    detail: (postId: string | undefined) => ["post", postId] as const,
    // Bare prefix: ["stream-posts"]
    streamPostsRoot: () => ["stream-posts"] as const,
    // ["stream-posts", streamId]
    streamPosts: (streamId: string | undefined) =>
      ["stream-posts", streamId] as const,
    // ["my-posts"]
    mine: () => ["my-posts"] as const,
    // Bare prefix: ["post-replies"]
    repliesRoot: () => ["post-replies"] as const,
    // ["post-replies", postId]
    replies: (postId: string | undefined) =>
      ["post-replies", postId] as const,
  },

  users: {
    profile: (userId: string) => ["user-profile", userId] as const,
  },

  settings: {
    // The authenticated user's own account (GET /users/me).
    me: () => ["settings-me"] as const,
    // Active refresh-token sessions (GET /users/me/sessions).
    sessions: () => ["settings-sessions"] as const,
  },
} as const;
