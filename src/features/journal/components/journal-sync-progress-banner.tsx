"use client";

import { Loader2 } from "lucide-react";
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
      className={cn(
        "mb-4 flex items-center justify-center rounded-lg px-3 py-2.5",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        aria-hidden
        className="h-5 w-5 text-accent motion-safe:animate-spin"
      />
      <span className="sr-only">{message}</span>
    </div>
  );
}
