"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Copy,
  BookOpen,
  Radio,
  Wrench,
  User,
  LogOut,
  Activity,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, href: "/overview" },
  { label: "Discover", icon: Compass, href: "/discover" },
  { label: "Feed", icon: Activity, href: "/feed" },
  { label: "Copy Trading", icon: Copy, href: "/copy-trading" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Spaces", icon: Radio, href: "/spaces" },
  { label: "Tools", icon: Wrench, href: "/tools" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-bg-secondary border-r border-border-primary flex flex-col h-full z-20">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border-primary">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight text-text-primary">
          Syncgram
        </span>
        <span className="ml-1 text-text-tertiary font-medium">Trades</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-text-tertiary group-hover:text-text-secondary"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-border-primary">
        <Link
          href="/settings"
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
        >
          <User className="mr-3 h-5 w-5 text-text-tertiary" />
          Profile
        </Link>
        <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors mt-1">
          <LogOut className="mr-3 h-5 w-5 text-text-tertiary" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
