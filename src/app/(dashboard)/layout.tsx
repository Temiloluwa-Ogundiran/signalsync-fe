"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Feather } from "lucide-react";
import { CreatePostModal } from "@/features/post/components/CreatePostModal";
import { AiInsightModalProvider } from "@/features/dashboard/components/ai-insight-modal-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AiInsightModalProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-bg-primary md:flex-row">
        {/* Desktop: full-height sidebar from top of viewport */}
        <div className="relative hidden h-screen shrink-0 md:flex">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
          />
        </div>

        {/* Main column: header (top bar) + scrollable content — to the right of sidebar on md+ */}
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

        {/* <button
          type="button"
          onClick={() => setPostModalOpen(true)}
          className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all hover:scale-105 hover:bg-accent-hover hover:shadow-xl md:bottom-8 md:right-8"
          aria-label="Create post"
        >
          <Feather className="h-6 w-6" />
        </button> */}

        <CreatePostModal
          open={postModalOpen}
          onClose={() => setPostModalOpen(false)}
        />

        <MobileNav />
      </div>
    </AiInsightModalProvider>
  );
}
