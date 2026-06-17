"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { User03Icon, Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { signOut, useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useThemeStore } from "@/features/theme/store";

export function UserMenu() {
  const { data: session, status } = useSession();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
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
          className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-tertiary ring-1 ring-border-secondary/60 transition-opacity hover:opacity-90 cursor-pointer"
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
              className="text-text-secondary"
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
          onClick={toggleTheme}
          className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary transition-colors hover:bg-sidebar-nav-active-bg cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <HugeiconsIcon
              icon={theme === "dark" ? Sun03Icon : Moon02Icon}
              size={16}
              strokeWidth={1.8}
              className="shrink-0"
            />
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary transition-colors hover:bg-sidebar-nav-active-bg cursor-pointer"
        >
          <LogOut className="size-4 shrink-0" />
          Log out
        </button>
      </PopoverContent>
    </Popover>
  );
}
