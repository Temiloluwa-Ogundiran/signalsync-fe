"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";

/**
 * Global notice shown on every page while the user's active account is the
 * seeded demo. Self-resolves the active account so it can be mounted once in
 * the app shell. The CTA opens the connect-account flow so the user can add
 * their real trades; the demo account can be removed from the accounts page
 * (and is cleared automatically once a real account is connected).
 */
export function DemoDataBanner() {
  const { data: accounts = [] } = useJournalAccounts();
  const resolvedId = useResolvedJournalAccountId();
  const activeAccount =
    accounts.find((a) => a.id === resolvedId) ?? accounts[0];
  const isDemo = Boolean(activeAccount?.is_demo);
  const router = useRouter();

  if (!isDemo) return null;

  return (
    <div className="px-4 pt-4 md:px-8">
      <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-subtle px-4 py-3">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={18}
          strokeWidth={2}
          className="shrink-0 text-text-tertiary"
        />
        <p className="flex-1 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Demo data.</span>{" "}
          Connect your account to replace it with your real trades.
        </p>
        <button
          type="button"
          onClick={() => router.push("/accounts")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-secondary px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle-hover cursor-pointer"
        >
          Add Trades
        </button>
      </div>
    </div>
  );
}
