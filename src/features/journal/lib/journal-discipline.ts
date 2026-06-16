/**
 * Discipline score (0–10) per trading day.
 *
 * TODO(backend): there is no per-day discipline aggregate yet — `JournalTrade`
 * carries a per-trade `discipline_score`, but the day/summary endpoints don't
 * roll it up. Until that lands we derive a *stable* mock from the date string so
 * the UI is deterministic (no flicker across renders) and demos look real.
 * Swap `disciplineForDate` for the real field when the API exposes it.
 */

const MAX_DISCIPLINE = 10;

/** Stable 0–10 score derived from a YYYY-MM-DD string (mock). */
export function disciplineForDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  // Bias toward the 4–9 range so it reads like a plausible discipline score.
  return 4 + (hash % (MAX_DISCIPLINE - 3));
}

/** Tone for a discipline score, used to colour the badge. */
export function disciplineTone(score: number): "high" | "mid" | "low" {
  if (score >= 7) return "high";
  if (score >= 5) return "mid";
  return "low";
}

export const DISCIPLINE_MAX = MAX_DISCIPLINE;

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
