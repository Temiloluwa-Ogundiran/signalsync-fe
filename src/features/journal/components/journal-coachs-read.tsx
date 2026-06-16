"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  Alert02Icon,
  ArrowUpRight01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface JournalCoachsReadProps {
  /** Narrative paragraph from the coach. */
  read: string;
  /** Optional highlighted insight shown in the amber banner. */
  insight?: string;
  onContinue?: () => void;
}

/**
 * TODO(ai): day-level AI ("Coach's Read") has no backend yet — `/ai/sessions`
 * 404s and the day-review trigger is a stub. This renders a styled shell with
 * caller-provided copy; wire `read`/`insight`/`onContinue` to the AI endpoint
 * once it lands. "Continue with coach" is intentionally disabled for now.
 */
export function JournalCoachsRead({
  read,
  insight,
  onContinue,
}: JournalCoachsReadProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl bg-card-bg p-4 ring-1 ring-hairline">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={AiMagicIcon}
            size={15}
            strokeWidth={2}
            className="text-ai-accent"
          />
          <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-secondary">
            Coach&apos;s Read
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Collapse coach's read" : "Expand coach's read"}
          className={cn(
            "rounded-md p-0.5 text-text-tertiary transition-transform duration-200 hover:text-text-primary cursor-pointer",
            !open && "-rotate-90",
          )}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} />
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-text-primary">{read}</p>

          {insight ? (
            <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-light px-3 py-2.5">
              <HugeiconsIcon
                icon={Alert02Icon}
                size={15}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-warning"
              />
              <p className="text-sm leading-relaxed text-warning">{insight}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onContinue}
            disabled={!onContinue}
            title={onContinue ? undefined : "Coming soon"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              "bg-ai-soft-bg text-ai-accent",
              onContinue
                ? "hover:bg-ai-soft-border cursor-pointer"
                : "cursor-not-allowed opacity-60",
            )}
          >
            <HugeiconsIcon icon={AiMagicIcon} size={13} strokeWidth={2} />
            Continue with coach
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2} />
          </button>
        </div>
      )}
    </section>
  );
}
