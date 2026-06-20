/**
 * Centralized React Query key factory.
 *
 * IMPORTANT: these functions return the EXACT array shapes already in use across
 * the app. Do not change a shape without migrating every matching
 * invalidate/setQueryData/removeQueries call — changing a key's array shape
 * silently drops its cache (audit P2-12 / Rule S3).
 *
 * Many keys accept an optional trailing segment (e.g. an account id or date).
 * When omitted, the function returns the bare prefix used by partial-match
 * invalidations.
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
    ) =>
      ["journal-trade-history", accountId, fromDate, toDate] as const,
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

  copyTrading: {
    settings: () => ["copy-trading", "settings"] as const,
    routes: () => ["copy-trading", "routes"] as const,
    policies: () => ["copy-trading", "account-policies"] as const,
    activity: () => ["copy-trading", "activity"] as const,
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
