"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { User03Icon } from "@hugeicons/core-free-icons";
import { signOut, useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ThemeSegmentedControl } from "./theme-segmented-control";

export function UserMenu() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName = user?.displayName || user?.name || "Trader";
  const email = user?.email ?? "";
  const avatarUrl = user?.avatarUrl;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "relative flex size-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden",
            avatarUrl
              ? // Photo: keep a filled circle the image fills.
                "rounded-full bg-bg-tertiary ring-1 ring-border-secondary/60 transition-opacity hover:opacity-90"
              : // Icon fallback: match the notification bell — bordered, no fill.
                "rounded-[10px] border border-border-secondary bg-chrome-bar-bg text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary",
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <HugeiconsIcon
              icon={User03Icon}
              size={20}
              strokeWidth={1.8}
              className="text-current"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-60 border-chrome-control-border bg-card-bg p-1.5"
        align="end"
      >
        <div className="flex items-center gap-3 px-2.5 py-2">
          <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-tertiary ring-1 ring-border-secondary/60">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-accent-foreground">
                {initial}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {status === "authenticated" ? displayName : "—"}
            </p>
            {email ? (
              <p className="truncate text-xs text-text-secondary">{email}</p>
            ) : (
              <p className="text-xs text-footnote-online">Online</p>
            )}
          </div>
        </div>

        <div className="my-1 h-px bg-border-secondary/50" aria-hidden />

        <Link
          href="/settings/profile"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary transition-colors hover:bg-sidebar-nav-active-bg cursor-pointer"
        >
          <User className="size-4 shrink-0" />
          Profile
        </Link>
        <button
          type="button"
          onClick={() => {
            // Clear persisted journal UI state (e.g. selected account) so the
            // next user on this browser doesn't inherit it. Cleared by storage
            // key to avoid a shared→feature import boundary violation.
            try {
              localStorage.removeItem("journal-ui");
            } catch {
              // ignore (SSR / storage disabled)
            }
            signOut({ callbackUrl: "/login", redirect: true });
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary transition-colors hover:bg-sidebar-nav-active-bg cursor-pointer"
        >
          <LogOut className="size-4 shrink-0" />
          Log out
        </button>
        <div className="mt-1 border-t border-border-secondary pt-2">
          <ThemeSegmentedControl />
        </div>
      </PopoverContent>
    </Popover>
  );
}
