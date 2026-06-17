/**
 * Convert stored HTML notes to plain text for the plain-text day-note editor.
 *
 * The day note is a plain <textarea>, but legacy/empty values were stored as
 * HTML (e.g. "<blockquote><p></p></blockquote><p></p>"). Feeding that straight
 * into a textarea shows the raw tags. This strips tags, decodes entities, and
 * collapses empty scaffolding to an empty string.
 */
export function htmlToText(input?: string | null): string {
  if (!input) return "";

  // Fast path: not HTML at all → return as-is (already plain text).
  if (!/[<&]/.test(input)) return input;

  let text = input;

  // Block-level boundaries become newlines so paragraphs/quotes don't run on.
  text = text.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  text = text.replace(/<\/\s*(p|div|blockquote|li|h[1-6])\s*>/gi, "\n");

  // Drop every remaining tag.
  text = text.replace(/<[^>]+>/g, "");

  // Decode the handful of entities we actually emit.
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Collapse 3+ newlines, trim trailing whitespace per line, then overall.
  text = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}
