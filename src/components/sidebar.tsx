"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconFeed } from "@/components/icons/syncgram-nav-icons";

// import { StreamSwitcher } from "./stream-switcher";

type NavEntry = {
  label: string;
  href: string;
  iconSrc: string;
};

const navGroups: NavEntry[][] = [
  [
    { label: "Home", href: "/overview", iconSrc: "/icons/sidebar/home.svg" },
    {
      label: "Journal",
      href: "/journal",
      iconSrc: "/icons/sidebar/journal.svg",
    },
    {
      label: "Trade History",
      href: "/trade-history",
      iconSrc: "/icons/sidebar/trade-history.svg",
    },
    { label: "Report", href: "/stream", iconSrc: "/icons/sidebar/report.svg" },
    {
      label: "Accounts",
      href: "/accounts",
      iconSrc: "/icons/sidebar/accounts.svg",
    },
    {
      label: "Copy Trading",
      href: "/copy-trading",
      iconSrc: "/icons/sidebar/copy-trading.svg",
    },
  ],
  [
    {
      label: "Discover",
      href: "/discover",
      iconSrc: "/icons/sidebar/discover.svg",
    },
    {
      label: "Feed",
      href: "/feed",
      iconSrc: "/icons/sidebar/trade-history.svg",
    },
    { label: "Space", href: "/spaces", iconSrc: "/icons/sidebar/spaces.svg" },
  ],
  [
    {
      label: "Profile",
      href: "/profile",
      iconSrc: "/icons/sidebar/profile.svg",
    },
    { label: "Tools", href: "/tools", iconSrc: "/icons/sidebar/tools.svg" },
    {
      label: "Notifications",
      href: "/notifications",
      iconSrc: "/icons/sidebar/notification.svg",
    },
    // {
    //   label: "Settings",
    //   href: "/settings",
    //   iconSrc: "/icons/sidebar/report.svg",
    // },
  ],
];

function NavDivider() {
  return <div className="my-3 h-px w-full bg-sidebar-divider" aria-hidden />;
}

interface SidebarProps {
  onNavigate?: () => void;
  /** Desktop: narrow sidebar to icons-only; hides “SyncTrade” next to the logo */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName =
    user?.displayName || user?.name || user?.username || "Trader";
  const avatarUrl = user?.avatarUrl;

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-sidebar-chrome-bg font-sans transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div
        className={cn(
          "relative flex h-[60px] shrink-0 items-center",
          collapsed ? "justify-center px-2" : "pl-4 pr-2",
        )}
      >
        <Link
          href="/overview"
          onClick={() => onNavigate?.()}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2",
            collapsed ? "justify-center" : "pr-5",
          )}
        >
          <Image
            src="/syncgram/logo-mark.svg"
            alt=""
            width={32}
            height={40}
            className="shrink-0"
            priority
          />
          {!collapsed ? (
            <span className="truncate font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary">
              SyncTrade
            </span>
          ) : null}
        </Link>

        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute right-0 top-1/2 z-40 flex size-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-sidebar-chrome-bg p-2 text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg"
          >
            {collapsed ? (
              <ChevronRight className="size-5 shrink-0" strokeWidth={2} />
            ) : (
              <ChevronLeft className="size-5 shrink-0" strokeWidth={2} />
            )}
          </button>
        ) : null}
      </div>

      <nav
        className={cn(
          "scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pt-4",
          collapsed ? "items-center px-2" : "px-3",
        )}
      >
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
                      "flex min-h-[44px] items-center rounded-full py-2.5 text-base font-semibold leading-snug transition-colors",
                      collapsed
                        ? "w-11 justify-center px-0"
                        : "gap-3 px-4",
                      isActive
                        ? "border border-sidebar-nav-active-border bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
                        : "border border-transparent bg-transparent text-sidebar-nav-inactive-text hover:bg-sidebar-nav-active-bg/40 hover:text-sidebar-nav-active-text",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                      {item.label === "Feed" ? (
                        <IconFeed active={isActive} />
                      ) : (
                        <Image
                          src={item.iconSrc}
                          alt=""
                          width={24}
                          height={24}
                          className={cn(
                            "h-6 w-6 transition-opacity",
                            isActive ? "opacity-100" : "opacity-75",
                          )}
                        />
                      )}
                    </span>
                    {!collapsed ? (
                      <span className="truncate">{item.label}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-sidebar-bottom-border bg-sidebar-chrome-bg pb-4 pt-5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <div
          className={cn(
            "flex items-center px-1",
            collapsed ? "flex-col gap-2" : "gap-3",
          )}
        >
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
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-base font-normal text-sidebar-nav-active-text">
                {status === "authenticated" ? displayName : "—"}
              </p>
              <p className="text-[10px] leading-normal text-footnote-online">
                Online
              </p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "rounded-full text-sm font-medium text-sidebar-nav-inactive-text transition-colors hover:bg-sidebar-nav-active-bg hover:text-sidebar-nav-active-text",
            collapsed
              ? "mx-auto mt-3 flex size-10 items-center justify-center p-0"
              : "mt-4 w-full px-4 py-2.5 text-center",
          )}
        >
          {collapsed ? (
            <LogOut className="size-4 shrink-0" aria-hidden />
          ) : (
            "Log out"
          )}
        </button>
      </div>
    </aside>
  );
}
