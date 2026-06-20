"use client";

import { Suspense } from "react";
import { Header } from "@/components/layout";
import { AppNav } from "@/components/layout/app-nav";
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

  return (
    <AiDockProvider>
      <div className="flex h-screen flex-row overflow-hidden bg-bg-primary">
        {/* Two-tier icon rail + contextual sidebar (registry-driven). */}
        <AppNav />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-canvas dark:bg-bg-primary">
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

          <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <DemoDataBanner />
            {children}
          </main>
        </div>

        <ConnectAccountModal />
      </div>
    </AiDockProvider>
  );
}
