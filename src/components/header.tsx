"use client";

import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({
  onMenuClick,
  onToggleSidebar,
  isSidebarCollapsed = false,
}: HeaderProps) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName = user?.displayName || user?.name || user?.username || "";
  const avatarUrl = user?.avatarUrl;

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-border-primary flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-all">
      <div className="flex items-center flex-1">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuClick}
          className="mr-4 md:hidden text-text-secondary hover:text-text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>

        <button
          onClick={onToggleSidebar}
          className="hidden md:inline-flex items-center gap-2 rounded-xl border border-border-primary bg-bg-input px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        </button>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <ThemeToggle />
        <button className="relative p-2 text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-danger ring-2 ring-bg-secondary transform translate-x-1/2 -translate-y-1/2" />
        </button>

        <div className="flex items-center space-x-3 pl-2 border-l border-border-primary">
          {status === "authenticated" && displayName ? (
            <>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-text-primary leading-none">
                  {displayName}
                </p>
                {user?.username && (
                  <p className="text-xs text-text-tertiary mt-1">
                    @{user.username}
                  </p>
                )}
              </div>
              <button className="h-9 w-9 rounded-full bg-linear-to-tr from-accent to-blue-400 p-0.5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-full w-full rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-accent">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>
            </>
          ) : (
            <div className="h-9 w-9 rounded-full bg-bg-tertiary" />
          )}
        </div>
      </div>
    </header>
  );
}
