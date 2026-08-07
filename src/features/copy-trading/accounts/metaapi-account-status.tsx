import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import type { CopyTradingConnection } from "../types";
import { copyAccountPresentation } from "./copy-account-presentation";

export function MetaApiAccountStatus({ account }: { account: CopyTradingConnection }) {
  const status = copyAccountPresentation(account.state);
  const description = (account.last_error_message || status.description)
    .replace(/trader password/gi, "master password");

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="flex items-start gap-2">
        {status.tone === "working" ? (
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-accent motion-reduce:animate-none" />
        ) : status.tone === "success" ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
        ) : (
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{status.label}</p>
          <p className="mt-0.5 text-xs leading-5 text-text-secondary">{description}</p>
        </div>
      </div>
      {status.progress !== null && status.tone === "working" ? (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary"
          role="progressbar"
          aria-label="Account connection progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={status.progress}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
