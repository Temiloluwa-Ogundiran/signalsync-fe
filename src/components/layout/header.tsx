"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, X } from "lucide-react";
import { useAiDockStore } from "@/features/ai/store/ai-dock-store";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { useNavUiStore } from "./nav-ui-store";
import { cn } from "@/lib/utils";

export function Header() {
  const openAi = useAiDockStore((s) => s.open);
  const mobileNavOpen = useNavUiStore((s) => s.mobileNavOpen);
  const toggleMobileNav = useNavUiStore((s) => s.toggleMobileNav);
  const pathname = usePathname();
  // The AI page keeps its icon rail visible on mobile (no drawer), so it doesn't
  // need the hamburger. Other apps use the off-canvas drawer → show it.
  const isAiPage = pathname?.startsWith("/ai");

  return (
    <header className="relative z-header flex h-header shrink-0 items-center bg-chrome-bar-bg px-chrome font-sans border-b border-nav-hairline">
      <div className="flex w-full min-w-0 items-center gap-3">
        {!isAiPage && (
          <button
            type="button"
            onClick={toggleMobileNav}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            // z-tooltip keeps the toggle above the open drawer's backdrop so it
            // stays tappable to close the drawer.
            className="relative z-tooltip -ml-1 shrink-0 rounded-lg p-2 text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary lg:hidden"
          >
            {mobileNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        )}

        {/* Brand — always on desktop. On mobile it's hidden where the hamburger
            takes the left slot, but shown on the AI page (no hamburger there, so
            the space is free). */}
        <Link
          href="/dashboard"
          aria-label="TradePartna home"
          className={cn(
            "shrink-0 items-center lg:flex",
            isAiPage ? "flex" : "hidden",
          )}
        >
          {/* Light vs dark wordmark — toggled by `.dark` on <html>, no flash. */}
          <Image
            src="/brand/tradpartnalight.svg"
            alt="TradePartna"
            width={156}
            height={20}
            priority
            className="h-5 w-auto dark:hidden"
          />
          <Image
            src="/brand/tradepartna-logo-full.svg"
            alt="TradePartna"
            width={156}
            height={20}
            priority
            className="hidden h-5 w-auto dark:block"
          />
        </Link>

        <div className="min-w-0 flex-1" />

        {/* Right group — global chrome: Ask Partna AI → avatar.
            Account selector + date range live in the page header (ROW 2). */}
        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2">
          {/* Hidden on the AI page itself — you're already there. */}
          {FEATURE_FLAGS.AI && !isAiPage && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => openAi({ source: "Header" })}
              className="ai-trigger flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] text-xs px-3 py-2 h-9"
            >
              <Sparkles className="ai-trigger__spark h-3.5 w-3.5" />
              Ask Partna AI
            </Button>
          )}

          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
