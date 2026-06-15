"use client";

import { Suspense, useState } from "react";
import { Header, MobileNav, Sidebar } from "@/components/layout";
import { AppNav } from "@/components/layout/app-nav";
import { ConnectAccountModal } from "@/features/journal/components/connect-account-modal";
import { AddTradeModal } from "@/features/journal/components/add-trade-modal";
import { EditTradeModal } from "@/features/journal/components/edit-trade-modal";
import { DayNoteModal } from "@/features/journal/components/day-note-modal";
import { AiDockProvider } from "@/features/ai/components/ai-dock-provider";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AiDockProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-bg-primary lg:flex-row">
        {/* Desktop: two-tier icon rail + contextual sidebar (registry-driven). */}
        <AppNav />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
            {children}
          </main>
        </div>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 top-header z-overlay bg-black/50 lg:hidden"
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
        <AddTradeModal />
        <EditTradeModal />
        <DayNoteModal />

        <MobileNav />
      </div>
    </AiDockProvider>
  );
}
