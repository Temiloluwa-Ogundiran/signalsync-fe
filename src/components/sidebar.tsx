"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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

import { StreamSwitcher } from "./stream-switcher";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`bg-bg-secondary border-r border-border-primary flex flex-col h-full z-20 transition-[width] duration-300 ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Brand Logo */}
      <div className={`h-16 flex items-center border-b border-border-primary ${collapsed ? "justify-center px-2" : "px-6"}`}>
        <div
          className={`w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm ${collapsed ? "mr-0" : "mr-3"}`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
          </svg>
        </div>

        {!collapsed && (
          <>
            <span className="font-bold text-lg tracking-tight text-text-primary">
              Syncgram
            </span>
            <span className="ml-1 text-text-tertiary font-medium">Trades</span>
          </>
        )}
      </div>

      {/* Active Stream Switcher */}
      {!collapsed && <StreamSwitcher />}

      {/* Navigation Items */}
      <nav className={`flex-1 py-6 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${collapsed ? "justify-center px-2" : "px-3"} ${
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-text-tertiary group-hover:text-text-secondary"
                } ${collapsed ? "mr-0" : "mr-3"}`}
              />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className={`border-t border-border-primary ${collapsed ? "p-2" : "p-4"}`}>
        <Link
          href="/profile"
          className={`flex items-center w-full py-2.5 text-sm font-medium text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors ${collapsed ? "justify-center px-2" : "px-3"}`}
          title={collapsed ? "Profile" : undefined}
        >
          <User
            className={`h-5 w-5 text-text-tertiary ${collapsed ? "mr-0" : "mr-3"}`}
          />
          {!collapsed && "Profile"}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex items-center w-full py-2.5 text-sm font-medium text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors mt-1 ${collapsed ? "justify-center px-2" : "px-3"}`}
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut
            className={`h-5 w-5 text-text-tertiary ${collapsed ? "mr-0" : "mr-3"}`}
          />
          {!collapsed && "Log Out"}
        </button>
      </div>
    </aside>
  );
}
