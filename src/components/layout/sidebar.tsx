"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Home01Icon,
  Analytics01Icon,
  Wallet01Icon,
  AiMagicIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { FEATURE_FLAGS, type FeatureFlag } from "@/config/feature-flags";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";

type NavEntry = {
  label: string;
  href: string;
  icon: IconSvgElement;
  /** When set, this item is hidden if the corresponding feature flag is false */
  flag?: FeatureFlag;
};

const navItems: NavEntry[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home01Icon,
  },
  {
    label: "Trade History",
    href: "/trade-history",
    icon: Analytics01Icon,
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: Wallet01Icon,
  },
  {
    label: "Partna AI",
    href: "/ai",
    icon: AiMagicIcon,
    flag: "AI" as FeatureFlag,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
  /** Desktop: narrow sidebar to icons-only; hides TradePartna next to the logo */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const openConnectModal = useJournalUiStore((s) => s.openConnectModal);

  const visibleItems = navItems.filter(
    (item) => !item.flag || FEATURE_FLAGS[item.flag],
  );

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-sidebar-chrome-bg font-sans transition-[width] duration-200 ease-out",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <div
        className={cn(
          "relative flex h-header shrink-0 items-center border-b border-sidebar-divider",
          collapsed ? "justify-center px-2" : "pl-4 pr-2",
        )}
      >
        <Link
          href="/dashboard"
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
              TradePartna
            </span>
          ) : null}
        </Link>

        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute right-0 top-1/2 z-overlay flex size-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-sidebar-chrome-bg p-2 text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg cursor-pointer"
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
          "scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-4",
          collapsed ? "items-center px-2" : "px-3",
        )}
      >
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "group flex min-h-[48px] items-center rounded-lg text-[15px] font-medium leading-snug transition-colors",
                collapsed ? "w-11 justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
                  : "text-sidebar-nav-inactive-text hover:bg-sidebar-nav-active-bg/50 hover:text-sidebar-nav-active-text",
              )}
              title={collapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center transition-opacity",
                  isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                )}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={22}
                  strokeWidth={1.5}
                  className="text-current"
                />
              </span>
              {!collapsed ? (
                <span className="flex flex-1 items-center gap-1.5 truncate">
                  {item.label}
                  {item.label === "Partna AI" && (
                    <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand leading-none">
                      Beta
                    </span>
                  )}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "shrink-0 bg-sidebar-chrome-bg pb-4 pt-3",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => openConnectModal()}
            aria-label="Import trades"
            title="Import trades"
            className="mx-auto flex size-11 items-center justify-center rounded-xl bg-bg-tertiary text-text-primary transition-colors hover:bg-bg-hover cursor-pointer"
          >
            <HugeiconsIcon icon={Upload04Icon} size={20} strokeWidth={1.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openConnectModal()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-hover cursor-pointer"
          >
            <HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />
            Import Trades
          </button>
        )}
      </div>
    </aside>
  );
}
