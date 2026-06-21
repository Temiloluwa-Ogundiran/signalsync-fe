"use client";

import { cn } from "@/lib/utils";
import type { GuardAccount } from "../types";

/** A compact pill switcher across the user's Guard-enabled accounts. */
export function GuardAccountSwitcher({
  accounts,
  activeId,
  onSelect,
}: {
  accounts: GuardAccount[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (accounts.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {accounts.map((a) => {
        const label = a.display_name ?? a.broker_name ?? "Account";
        const active = a.id === activeId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
              active
                ? "border-brand/40 bg-brand/5 text-text-primary"
                : "border-border-primary text-text-secondary hover:bg-card-bg-hover",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                a.connection_health === "offline"
                  ? "bg-danger"
                  : "bg-success",
              )}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
