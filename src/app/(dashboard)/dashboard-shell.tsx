"use client";

import { Suspense, useState } from "react";
import { Header, MobileNav, Sidebar } from "@/components/layout";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Sync the active account once on page load (the only auto-sync).
  useOnMountSync();

  return (
    <AiDockProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-bg-primary lg:flex-row">
        {/* Desktop: two-tier icon rail + contextual sidebar (registry-driven). */}
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
            <Header onMenuClick={() => setMobileMenuOpen((prev) => !prev)} />
          </Suspense>

          <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
            <DemoDataBanner />
            {children}
          </main>
        </div>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 top-header z-overlay bg-overlay lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-header z-drawer h-[calc(100vh-var(--spacing-header))] w-sidebar lg:hidden">
              <Sidebar
                collapsed={false}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </>
        )}

        <ConnectAccountModal />

        <MobileNav />
      </div>
    </AiDockProvider>
  );
}
