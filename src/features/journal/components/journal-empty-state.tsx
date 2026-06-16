"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

interface JournalEmptyStateProps {
  icon: IconSvgElement;
  title: string;
  description: string;
  /** Primary action label. Omit (with onAction) for a description-only state. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Centered empty state for the journal surfaces — an icon tile, a heading, a
 * supporting line, and an optional primary action. Used when no account is
 * connected yet, so the screen reads as guidance rather than a dead end.
 */
export function JournalEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: JournalEmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ai-soft-bg text-ai-accent ring-1 ring-inset ring-ai-soft-border">
        <HugeiconsIcon icon={icon} size={26} strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ai-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ai-accent-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-accent/40 cursor-pointer"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
