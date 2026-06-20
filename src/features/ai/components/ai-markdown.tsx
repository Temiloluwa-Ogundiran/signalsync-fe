"use client";

import { Streamdown } from "streamdown";
import type { Components } from "streamdown";
import { AiChip, parseChipHref } from "./ai-chips";

/**
 * Renders an assistant message as markdown via Streamdown, with two extensions:
 *
 * 1. Clickable chips — links pointing at our in-app destinations
 *    (/trade-history?tradeId=, /journal?focusDate=, /strategies?setup=) render as
 *    <AiChip> instead of plain anchors. We use real relative URLs rather than a
 *    custom `trade:` scheme because Streamdown runs rehype-sanitize, which strips
 *    links with unknown protocols (they'd render as "[blocked]"). Relative paths
 *    always survive.
 *
 * 2. Follow-up actions — the model ends some answers with a single line:
 *      ::actions:: First | Second | Third
 *    We strip that line here (so it never renders as text) and surface the
 *    parsed labels separately for the message list to render as buttons.
 */

const ACTIONS_RE = /^[ \t]*::actions::[ \t]*(.+?)[ \t]*$/im;
// The model adds ::expand:: when a wide table reads better on the full /ai page.
// Optional custom label after the marker, e.g. "::expand:: See full table".
const EXPAND_RE = /^[ \t]*::expand::[ \t]*(.*?)[ \t]*$/im;

export function parseActions(content: string): string[] {
  const m = ACTIONS_RE.exec(content);
  if (!m) return [];
  return m[1]
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

/** The expand-to-full-view hint, if the model emitted one. */
export function parseExpand(content: string): string | null {
  const m = EXPAND_RE.exec(content);
  if (!m) return null;
  return m[1]?.trim() || "Open full view";
}

/** Remove our control lines so they aren't shown in the rendered markdown. */
export function stripActions(content: string): string {
  return content
    .replace(ACTIONS_RE, "")
    .replace(EXPAND_RE, "")
    .replace(/\n{3,}$/, "\n")
    .trimEnd();
}

function linkLabel(children: React.ReactNode, fallback: string): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(String).join("");
  return String(children ?? fallback);
}

const components: Components = {
  a({ href, children, ...props }) {
    const chip = parseChipHref(href);
    if (chip) {
      return (
        <AiChip
          scheme={chip.scheme}
          href={chip.href}
          label={linkLabel(children, chip.href)}
        />
      );
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
      // Our chips own their click handling; skip Streamdown's link-safety
      // interstitial which would otherwise wrap every link.
      linkSafety={{ enabled: false }}
      isAnimating={isStreaming}
    >
      {content}
    </Streamdown>
  );
}
