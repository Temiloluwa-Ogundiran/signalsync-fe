/**
 * Centralized React Query key factory.
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
    feed: (accountId: string) => ["journal-feed", accountId] as const,
    tags: (accountId: string) => ["journal-tags", accountId] as const,
    openPositions: (accountId: string) =>
      ["journal-open-positions", accountId] as const,
  },

  accounts: {
    list: () => ["trading-accounts"] as const,
    detail: (accountId: string) => ["trading-account", accountId] as const,
  },

  streams: {
    mine: () => ["my-streams"] as const,
    discover: () => ["discover-streams"] as const,
    detail: (streamId: string) => ["stream-detail", streamId] as const,
    members: (streamId: string) => ["stream-members", streamId] as const,
    joinRequests: (streamId: string) =>
      ["stream-join-requests", streamId] as const,
  },

  posts: {
    detail: (postId: string) => ["post", postId] as const,
    feed: (streamId: string) => ["posts-feed", streamId] as const,
  },

  users: {
    profile: (userId: string) => ["user-profile", userId] as const,
  },
} as const;
