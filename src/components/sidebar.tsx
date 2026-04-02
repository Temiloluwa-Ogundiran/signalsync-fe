"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconJournal,
  IconCopyTrading,
  IconDiscover,
  IconSpace,
  IconFeed,
  IconNotification,
  IconSettings,
  IconReport,
} from "@/components/icons/syncgram-nav-icons";
// import { StreamSwitcher } from "./stream-switcher";

type NavEntry = {
  label: string;
  href: string;
  Icon: ComponentType<{ active?: boolean; className?: string }>;
};

const navGroups: NavEntry[][] = [
  [
    { label: "Home", href: "/overview", Icon: IconHome },
    { label: "Journal", href: "/journal", Icon: IconJournal },
    { label: "Report", href: "/stream", Icon: IconReport },
    { label: "Copy Trading", href: "/copy-trading", Icon: IconCopyTrading },
  ],
  [
    { label: "Discover", href: "/discover", Icon: IconDiscover },
    { label: "Feed", href: "/feed", Icon: IconFeed },
    { label: "Space", href: "/spaces", Icon: IconSpace },
  ],
  [
    { label: "Profile", href: "/profile", Icon: IconNotification },
    { label: "Tools", href: "/tools", Icon: IconSettings },
  ],
];

function NavDivider() {
  return <div className="my-3 h-px w-full bg-sidebar-divider" aria-hidden />;
}

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName =
    user?.displayName || user?.name || user?.username || "Trader";
  const avatarUrl = user?.avatarUrl;

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col bg-sidebar-chrome-bg">
      {/* {!collapsed && <StreamSwitcher />} */}

      <nav className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-6">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <NavDivider />}
            <div className="flex flex-col gap-1">
              {group.map((item) => {
                const isActive =
                  item.href === "/overview"
                    ? pathname === "/overview"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label + item.href}
                    href={item.href}
                    onClick={() => onNavigate?.()}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-full px-4 py-2.5 text-base font-semibold leading-snug transition-colors",
                      isActive
                        ? "border border-sidebar-nav-active-border bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
                        : "border border-transparent bg-transparent text-sidebar-nav-inactive-text hover:bg-sidebar-nav-active-bg/40 hover:text-sidebar-nav-active-text",
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                      <item.Icon active={isActive} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-bottom-border bg-sidebar-chrome-bg px-3 pb-4 pt-5">
        <div className="flex items-center gap-3 px-1">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-indigo-600 ring-1 ring-white/10">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-base font-normal text-sidebar-nav-active-text">
              {status === "authenticated" ? displayName : "—"}
            </p>
            <p className="text-[10px] leading-normal text-footnote-online">
              Online
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 w-full rounded-full px-4 py-2.5 text-center text-sm font-medium text-sidebar-nav-inactive-text transition-colors hover:bg-sidebar-nav-active-bg hover:text-sidebar-nav-active-text"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
