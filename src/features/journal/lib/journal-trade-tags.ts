import type { JournalMessage } from "../types";

/**
 * Setup tags that read as "good" (A+, textbook, planned). Everything else that
 * looks like a rule break ("no setup", "chase", "fomo", "revenge") reads as bad.
 * Used to colour the per-trade setup chip in the expanded day view.
 */
const NEGATIVE_TAG_HINTS = [
  "no setup",
  "no-setup",
  "chase",
  "chased",
  "fomo",
  "revenge",
  "tilt",
  "overtrade",
  "broke rule",
  "rule break",
];

export interface TradeAnnotation {
  /** First setup-style tag (uppercased) to show as a chip, if any. */
  setupTag: string | null;
  /** Whether the setup tag reads as a rule break / negative. */
  setupNegative: boolean;
  /** First user note line for the trade, if any. */
  note: string | null;
}

function isNegativeTag(tag: string): boolean {
  const lower = tag.toLowerCase();
  return NEGATIVE_TAG_HINTS.some((hint) => lower.includes(hint));
}

/**
 * Reduce a trade's journal messages to a single setup chip + first note line.
 * `messages` are the trade-scoped journal messages (text + tags). System and
 * AI messages are ignored — we only surface what the trader wrote.
 */
export function annotateTrade(messages: JournalMessage[]): TradeAnnotation {
  let setupTag: string | null = null;
  let setupNegative = false;
  let note: string | null = null;

  for (const message of messages) {
    if (message.message_type === "system" || message.message_type === "ai_response") {
      continue;
    }
    if (setupTag === null && message.tags.length > 0) {
      const tag = message.tags[0];
      setupTag = tag.toUpperCase();
      setupNegative = isNegativeTag(tag);
    }
    if (note === null && message.content && message.content.trim()) {
      note = message.content.trim();
    }
    if (setupTag !== null && note !== null) break;
  }

  return { setupTag, setupNegative, note };
}
