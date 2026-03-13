"use client";

import { Search, Bell, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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

        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-tertiary group-focus-within:text-accent transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border-primary rounded-xl leading-5 bg-bg-input text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent sm:text-sm transition-all"
            placeholder="Search streams, traders, or strategies..."
          />
        </div>

        {/* Mobile Search Icon */}
        <button className="md:hidden text-text-secondary mr-auto">
          <Search className="h-5 w-5" />
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
