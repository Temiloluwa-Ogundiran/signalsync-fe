"use client";

import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout";
import { AppNav } from "@/components/layout/app-nav";
import { useNavUiStore } from "@/components/layout/nav-ui-store";
import { ConnectAccountModal } from "@/features/journal/components/connect-account-modal";
import { AiDockProvider } from "@/features/ai/components/ai-dock-provider";
import { DemoDataBanner } from "@/features/journal/components/demo-data-banner";
import { useOnMountSync } from "@/features/journal/hooks/use-on-mount-sync";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync the active account once on page load (the only auto-sync).
  useOnMountSync();
  // While the off-canvas drawer is open, freeze the page scroller so the
  // content behind the backdrop can't scroll on touch.
  const mobileNavOpen = useNavUiStore((s) => s.mobileNavOpen);

  return (
    <AiDockProvider>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[9999] -translate-y-20 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      {/* Column layout: a full-width header on top (logo + global actions), then
          a row of nav + content below. The header owns the logo so its size is
          independent of the nav column width. */}
      <div className="flex h-screen flex-col overflow-hidden bg-bg-primary">
        <Suspense
          fallback={
            <div
              className="relative z-header flex h-header shrink-0 items-center bg-chrome-bar-bg px-chrome"
              aria-hidden
            />
          }
        >
          <Header />
        </Suspense>

        <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
          {/* Two-tier icon rail + contextual sidebar (registry-driven). */}
          <AppNav />

          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "scrollbar-thin min-w-0 flex-1 overflow-x-hidden bg-bg-canvas dark:bg-bg-primary",
              mobileNavOpen ? "overflow-y-hidden" : "overflow-y-auto",
            )}
          >
            <DemoDataBanner />
            {children}
          </main>
        </div>

        <ConnectAccountModal />
      </div>
    </AiDockProvider>
  );
}
