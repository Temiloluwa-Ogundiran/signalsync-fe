"use client";

import { Streamdown } from "streamdown";
import type { Components } from "streamdown";
import { AiChip, parseChipHref } from "./ai-chips";

/**
 * Renders an assistant message as markdown via Streamdown, with two extensions:
 *
 * 1. Clickable chips — links using the custom `trade:` / `setup:` / `day:`
 *    schemes render as <AiChip> instead of anchors (see ai-chips.tsx). Ordinary
 *    links fall through to Streamdown's default safe-link handling.
 *
 * 2. Follow-up actions — the model ends some answers with a single line:
 *      ::actions:: First | Second | Third
 *    We strip that line here (so it never renders as text) and surface the
 *    parsed labels separately for the message list to render as buttons.
 */

const ACTIONS_RE = /^[ \t]*::actions::[ \t]*(.+?)[ \t]*$/im;

export function parseActions(content: string): string[] {
  const m = ACTIONS_RE.exec(content);
  if (!m) return [];
  return m[1]
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

/** Remove the ::actions:: line so it isn't shown in the rendered markdown. */
export function stripActions(content: string): string {
  return content.replace(ACTIONS_RE, "").replace(/\n{3,}$/, "\n").trimEnd();
}

// Preserve our custom schemes through react-markdown's URL sanitizer (its
// default transform would blank out non-http(s) hrefs like `trade:...`).
function urlTransform(url: string): string {
  if (/^(trade|setup|day):/i.test(url)) return url;
  // Fall back to a conservative allow-list for everything else.
  if (/^(https?:|mailto:|#|\/)/i.test(url)) return url;
  return "";
}

const components: Components = {
  a({ href, children, ...props }) {
    const chip = parseChipHref(href);
    if (chip) {
      const label =
        typeof children === "string"
          ? children
          : Array.isArray(children)
            ? children.join("")
            : String(children ?? chip.value);
      return <AiChip scheme={chip.scheme} value={chip.value} label={label} />;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ai-accent underline underline-offset-2 hover:text-ai-accent-bright"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export function AiMarkdown({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  return (
    <Streamdown
      className="ai-markdown space-y-2"
      parseIncompleteMarkdown
      components={components}
      urlTransform={urlTransform}
      // Our chips handle navigation themselves; skip Streamdown's link-safety
      // interstitial which would otherwise wrap every link.
      linkSafety={{ enabled: false }}
      isAnimating={isStreaming}
    >
      {content}
    </Streamdown>
  );
}
