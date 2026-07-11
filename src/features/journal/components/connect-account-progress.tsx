"use client";

import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Shown while the single connect-account request is in flight. Verification,
 * saving and the initial sync all happen inside one blocking call with no
 * per-step feedback from the backend, so this is an honest indeterminate
 * state — not a faked step checklist.
 */
export function ConnectAccountProgress() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-primary bg-bg-tertiary">
        <ShieldCheck className="h-7 w-7 text-text-secondary" />
        <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 animate-spin rounded-full border border-border-primary bg-bg-secondary p-1 text-text-primary" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-text-primary">
          Verifying your MT5 account
        </h3>
        <p className="mx-auto max-w-xs text-sm text-text-secondary">
          This takes a few seconds. Keep this window open while we check your
          credentials and pull in your trades.
        </p>
      </div>
    </div>
  );
}
