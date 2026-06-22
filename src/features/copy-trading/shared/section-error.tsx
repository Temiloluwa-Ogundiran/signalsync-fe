"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionError({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>
      {onRetry ? (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
