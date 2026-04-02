"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconDiscover,
  IconFeed,
  IconCopyTrading,
  IconJournal,
} from "@/components/icons/syncgram-nav-icons";

const navItems = [
  { label: "Home", href: "/overview", Icon: IconHome },
  { label: "Discover", href: "/discover", Icon: IconDiscover },
  { label: "Feed", href: "/feed", Icon: IconFeed },
  { label: "Copy", href: "/copy-trading", Icon: IconCopyTrading },
  { label: "Journal", href: "/journal", Icon: IconJournal },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar-chrome-bg border-t border-sidebar-bottom-border pb-safe fixed bottom-0 z-50 flex w-full items-center justify-between px-1 py-2 md:hidden">
      {navItems.map((item) => {
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
              <item.Icon active={isActive} />
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
