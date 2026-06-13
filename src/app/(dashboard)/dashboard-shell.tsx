"use client";

import { Suspense, useEffect, useState } from "react";
import { Header, MobileNav, Sidebar } from "@/components/layout";
import { CreatePostModal } from "@/features/post/components/create-post-modal";
import { ConnectAccountModal } from "@/features/journal/components/connect-account-modal";
import { AddTradeModal } from "@/features/journal/components/add-trade-modal";
import { EditTradeModal } from "@/features/journal/components/edit-trade-modal";
import { AiInsightModalProvider } from "@/features/dashboard/components/ai-insight-modal-provider";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AiInsightModalProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-bg-primary md:flex-row">
        <div className="relative hidden h-screen shrink-0 md:flex">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Suspense
            fallback={
              <div
                className="relative z-30 flex h-[60px] shrink-0 items-center bg-chrome-bar-bg pl-[26px] pr-[26px]"
                aria-hidden
              />
            }
          >
            <Header onMenuClick={() => setMobileMenuOpen((prev) => !prev)} />
          </Suspense>

          <main className="scrollbar-thin flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 top-[60px] z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-[60px] z-50 h-[calc(100vh-60px)] w-[240px] md:hidden">
              <Sidebar
                collapsed={false}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </>
        )}

        <CreatePostModal
          open={postModalOpen}
          onClose={() => setPostModalOpen(false)}
        />

        <ConnectAccountModal />
        <AddTradeModal />
        <EditTradeModal />

        <MobileNav />
      </div>
    </AiInsightModalProvider>
  );
}
