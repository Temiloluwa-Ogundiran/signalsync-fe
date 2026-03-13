"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Feather } from "lucide-react";
import { CreatePostModal } from "@/features/post/components/CreatePostModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Floating Action Button — Create Post */}
      <button
        onClick={() => setPostModalOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-30 h-14 w-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Create post"
      >
        <Feather className="h-6 w-6" />
      </button>

      <CreatePostModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
      />

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
