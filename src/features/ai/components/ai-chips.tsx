"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { TrendingUp, BookOpen, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Clickable reference chips emitted inline by the AI.
 *
 * The model writes markdown links with a custom scheme — `trade:`, `setup:`, or
 * `day:` — and `ai-markdown.tsx` routes any link whose href starts with one of
 * those schemes to <AiChip>. Each chip deep-links into the app:
 *   - trade:<uuid>     -> /trade-history?tradeId=<uuid>  (opens the trade panel)
 *   - day:<YYYY-MM-DD> -> /journal?focusDate=<date>      (auto-expands that day)
 *   - setup:<name>     -> /strategies                    (the setups list)
 */

export type ChipScheme = "trade" | "setup" | "day";

export function parseChipHref(
  href: string | undefined,
): { scheme: ChipScheme; value: string } | null {
  if (!href) return null;
  const m = /^(trade|setup|day):(.*)$/i.exec(href);
  if (!m) return null;
  const scheme = m[1].toLowerCase() as ChipScheme;
  // The model URL-encodes spaces in setup names; decode defensively.
  let value = m[2];
  try {
    value = decodeURIComponent(value);
  } catch {
    /* leave as-is on malformed encoding */
  }
  return { scheme, value: value.trim() };
}

const ICONS: Record<ChipScheme, typeof TrendingUp> = {
  trade: TrendingUp,
  setup: BookOpen,
  day: CalendarDays,
};

export function AiChip({
  scheme,
  value,
  label,
}: {
  scheme: ChipScheme;
  value: string;
  /** Visible text (the markdown link text). */
  label: string;
}) {
  const router = useRouter();

  const onClick = useCallback(() => {
    if (scheme === "trade") {
      router.push(`/trade-history?tradeId=${encodeURIComponent(value)}`);
    } else if (scheme === "day") {
      router.push(`/journal?focusDate=${encodeURIComponent(value)}`);
    } else if (scheme === "setup") {
      router.push("/strategies");
    }
  }, [router, scheme, value]);

  const Icon = ICONS[scheme];

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        scheme === "trade"
          ? "View this trade"
          : scheme === "day"
            ? "Open this day in your journal"
            : "View your strategies"
      }
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md align-baseline",
        "border border-ai-soft-border bg-ai-soft-bg px-1.5 py-0.5",
        "text-[0.8em] font-medium leading-tight text-ai-accent",
        "transition-colors hover:border-ai-accent hover:bg-ai-glow",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ai-accent/40",
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
