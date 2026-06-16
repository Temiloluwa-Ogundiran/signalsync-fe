/**
 * Strategy per trade (mock). TODO(backend): trades have no strategy field yet.
 * Derive a *stable* present/absent + name from the trade id so the row is
 * deterministic. A trade either has a strategy or it doesn't — it's not editable
 * here (unlike tags). Swap for the real field when the API exposes it.
 */
const MOCK_STRATEGIES = [
  "Breakout",
  "Reversal",
  "Trend Follow",
  "Mean Reversion",
  "Scalp",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable strategy name for a trade, or null when it has none (mock). */
export function strategyForTrade(tradeId: string): string | null {
  const hash = hashString(tradeId);
  // ~2 in 3 trades have a strategy; the rest are untagged.
  if (hash % 3 === 0) return null;
  return MOCK_STRATEGIES[hash % MOCK_STRATEGIES.length];
}
