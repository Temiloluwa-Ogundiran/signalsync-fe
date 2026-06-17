"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Home01Icon,
  Analytics01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

type MobileNavItem = {
  label: string;
  href: string;
  icon: IconSvgElement;
};

const navItems: MobileNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home01Icon },
  { label: "History", href: "/trade-history", icon: Analytics01Icon },
  { label: "Accounts", href: "/accounts", icon: Wallet01Icon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar-chrome-bg border-t border-sidebar-bottom-border pb-safe fixed bottom-0 z-drawer flex w-full items-center justify-between px-1 py-2 lg:hidden">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            <span
              className={`flex h-6 w-6 items-center justify-center ${
                isActive ? "opacity-100" : "opacity-75"
              }`}
            >
              <HugeiconsIcon
                icon={item.icon}
                size={22}
                strokeWidth={1.5}
                className="text-current"
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
