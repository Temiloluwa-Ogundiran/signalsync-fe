"use client";

import { cn } from "@/lib/utils";

interface JournalSyncProgressBannerProps {
  open: boolean;
  message: string;
  className?: string;
}

export function JournalSyncProgressBanner({
  open,
  message,
  className,
}: JournalSyncProgressBannerProps) {
  if (!open) return null;

  return (
    <div
      className={cn("mb-4 rounded-lg px-3 py-2.5", className)}
      role="status"
      aria-live="polite"
    >
      <p className="mb-2 text-xs font-medium text-text-secondary">{message}</p>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary"
        aria-hidden
      >
        <div className="absolute top-0 h-full w-1/3 max-w-[42%] rounded-full bg-accent animate-journal-sync-indeterminate" />
      </div>
    </div>
  );
}
