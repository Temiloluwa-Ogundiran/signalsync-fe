"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { TrendingUp, BookOpen, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Clickable reference chips emitted inline by the AI.
 *
 * The model writes ordinary markdown links pointing at REAL in-app destinations:
 *   - /trade-history?tradeId=<uuid>  -> opens the trade detail panel
 *   - /journal?focusDate=<YYYY-MM-DD> -> auto-expands that day
 *   - /strategies?setup=<name>        -> the strategies list
 *
 * We use real relative URLs (not a custom `trade:` scheme) on purpose: Streamdown
 * runs rehype-sanitize, which strips links with unknown protocols — relative
 * paths always pass. `ai-markdown.tsx` matches these paths and renders <AiChip>,
 * which does SPA navigation via the router (falling back to a normal link if JS
 * never runs).
 */

export type ChipScheme = "trade" | "setup" | "day";

export interface ParsedChip {
  scheme: ChipScheme;
  /** The destination href (relative), used for navigation + <a> fallback. */
  href: string;
}

/** Detect a chip link from its href. Returns null for ordinary links. */
export function parseChipHref(href: string | undefined): ParsedChip | null {
  if (!href) return null;
  // Only intercept our own internal destinations.
  if (/^\/trade-history\?.*\btradeId=/.test(href)) return { scheme: "trade", href };
  if (/^\/journal\?.*\bfocusDate=/.test(href)) return { scheme: "day", href };
  if (/^\/strategies(\?|$)/.test(href)) return { scheme: "setup", href };
  return null;
}

const ICONS: Record<ChipScheme, typeof TrendingUp> = {
  trade: TrendingUp,
  setup: BookOpen,
  day: CalendarDays,
};

const TITLES: Record<ChipScheme, string> = {
  trade: "View this trade",
  day: "Open this day in your journal",
  setup: "View your strategies",
};

export function AiChip({
  scheme,
  href,
  label,
}: {
  scheme: ChipScheme;
  href: string;
  /** Visible text (the markdown link text). */
  label: string;
}) {
  const router = useRouter();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      // Let modifier-clicks (open in new tab) behave normally.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      router.push(href);
    },
    [router, href],
  );

  const Icon = ICONS[scheme];

  return (
    <a
      href={href}
      onClick={onClick}
      title={TITLES[scheme]}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md align-baseline no-underline",
        "border border-ai-soft-border bg-ai-soft-bg px-1.5 py-0.5",
        "text-[0.8em] font-medium leading-tight text-ai-accent",
        "transition-colors hover:border-ai-accent hover:bg-ai-glow",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ai-accent/40",
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}
