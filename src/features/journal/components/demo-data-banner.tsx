"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useClearDemoData } from "../hooks/use-journal-accounts";

const DISMISS_KEY = "tp-demo-banner-dismissed";

/**
 * Global, dismissible notice shown on every page while the user's active account
 * is the seeded demo. Self-resolves the active account so it can be mounted once
 * in the app shell. "Clear demo data" removes the demo account (the backend
 * cascade-deletes its trades/journals); connecting a real account clears it too.
 */
export function DemoDataBanner() {
  const { data: accounts = [] } = useJournalAccounts();
  const resolvedId = useResolvedJournalAccountId();
  const activeAccount =
    accounts.find((a) => a.id === resolvedId) ?? accounts[0];
  const isDemo = Boolean(activeAccount?.is_demo);

  // Lazy init from localStorage (client-only) so we don't setState in an effect.
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISS_KEY) === "1",
  );
  const clearDemo = useClearDemoData();

  if (!isDemo || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="px-4 pt-4 md:px-8">
      <div className="flex items-center gap-3 rounded-xl border border-ai-soft-border bg-ai-soft-bg px-4 py-3">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={18}
          strokeWidth={2}
          className="shrink-0 text-ai-accent"
        />
        <p className="flex-1 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Demo data.</span>{" "}
          Connect your account to replace it with your real trades.
        </p>
        <button
          type="button"
          onClick={() => clearDemo.mutate()}
          disabled={clearDemo.isPending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ai-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ai-accent-bright disabled:opacity-60 cursor-pointer"
        >
          {clearDemo.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Clear demo data
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-secondary cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
