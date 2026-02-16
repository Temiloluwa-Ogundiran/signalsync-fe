"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Copy, BookOpen, Activity } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, href: "/overview" },
  { label: "Discover", icon: Compass, href: "/discover" },
  { label: "Feed", icon: Activity, href: "/feed" },
  { label: "Copy", icon: Copy, href: "/copy-trading" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="bg-bg-secondary border-t border-border-primary pb-safe fixed bottom-0 w-full z-50 px-2 py-2 flex justify-between items-center md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full py-1 ${
              isActive ? "text-accent" : "text-text-tertiary"
            }`}
          >
            <item.icon
              className={`h-6 w-6 ${isActive ? "fill-current opacity-20" : ""}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
