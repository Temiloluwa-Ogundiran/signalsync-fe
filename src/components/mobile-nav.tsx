"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURE_FLAGS, type FeatureFlag } from "@/lib/feature-flags";

type MobileNavItem = {
  label: string;
  href: string;
  iconSrc: string;
  flag?: FeatureFlag;
};

const navItems: MobileNavItem[] = [
  {
    label: "Home",
    href: "/overview",
    iconSrc: "/icons/sidebar/home.svg",
    flag: "HOME",
  },
  {
    label: "Discover",
    href: "/discover",
    iconSrc: "/icons/sidebar/discover.svg",
    flag: "DISCOVER",
  },
  {
    label: "Feed",
    href: "/feed",
    iconSrc: "/icons/sidebar/trade-history.svg",
    flag: "FEED",
  },
  { label: "Journal", href: "/journal", iconSrc: "/icons/sidebar/journal.svg" },
  {
    label: "History",
    href: "/trade-history",
    iconSrc: "/icons/sidebar/trade-history.svg",
  },
  {
    label: "Accounts",
    href: "/accounts",
    iconSrc: "/icons/sidebar/accounts.svg",
  },
  {
    label: "Copy",
    href: "/copy-trading",
    iconSrc: "/icons/sidebar/copy-trading.svg",
  },
];

/** Only show items whose feature flag is enabled (or have no flag at all) */
const visibleNavItems = navItems.filter(
  (item) => !item.flag || FEATURE_FLAGS[item.flag],
);

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar-chrome-bg border-t border-sidebar-bottom-border pb-safe fixed bottom-0 z-50 flex w-full items-center justify-between px-1 py-2 md:hidden">
      {visibleNavItems.map((item) => {
        const isActive =
          item.href === "/overview"
            ? pathname === "/overview"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1 ${
              isActive
                ? "text-sidebar-nav-active-text"
                : "text-sidebar-nav-inactive-text"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center">
              <Image
                src={item.iconSrc}
                alt=""
                width={24}
                height={24}
                className={isActive ? "opacity-100" : "opacity-75"}
              />
            </span>
            <span className="mt-1 text-[10px] font-medium leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
