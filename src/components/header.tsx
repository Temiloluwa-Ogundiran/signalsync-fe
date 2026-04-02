"use client";

import { Menu } from "lucide-react";
import {
  IconChevronDown,
} from "@/components/icons/syncgram-nav-icons";
import { useAiInsightModal } from "@/features/dashboard/components/ai-insight-modal-provider";
import Image from "next/image";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { open: openAi } = useAiInsightModal();

  return (
    <header className="relative z-30 flex h-[60px] shrink-0 items-center bg-chrome-bar-bg pl-4 pr-[26px]">
      <div className="flex w-full min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center justify-center gap-2 px-0 pb-2 pt-2">
          <Image
            src="/syncgram/logo-mark.svg"
            alt=""
            width={32}
            height={40}
            className="shrink-0"
            priority
          />
          <span className="hidden md:inline-block font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary">
            SyncTrade
          </span>
        </div>
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 text-sidebar-nav-inactive-text hover:text-sidebar-nav-active-text md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0 flex-1 text-center md:absolute md:left-1/2 md:top-1/2 md:max-w-[min(90vw,560px)] md:-translate-x-1/2 md:-translate-y-1/2 md:px-4" />

        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2 md:gap-3">
          <button
            type="button"
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chrome-bar-bg text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg md:flex"
            aria-label="Currency"
          >
            <Image src="/icons/navbar/currency.svg" alt="" width={24} height={24} />
          </button>
          <button
            type="button"
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chrome-bar-bg text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg md:flex"
            aria-label="Filters"
          >
            <Image src="/icons/navbar/filter.svg" alt="" width={24} height={24} />
          </button>
          <div className="hidden items-stretch lg:flex">
            <button
              type="button"
              className="flex items-center gap-2 rounded-l-full border border-chrome-control-border px-4 py-2 text-sm font-semibold text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg"
            >
              <Image src="/icons/navbar/calendar.svg" alt="" width={24} height={24} />
              <span>Date range</span>
              <IconChevronDown />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-r-full border border-l-0 border-chrome-control-border px-4 py-2 text-sm font-semibold text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg"
            >
              <Image src="/icons/navbar/accounts.svg" alt="" width={24} height={24} />
              <span>All accounts</span>
              <IconChevronDown />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openAi(null)}
            className="flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition-opacity hover:opacity-95"
            style={{
              background: "var(--ask-sync-gradient)",
            }}
          >
            <Image src="/icons/navbar/ai.svg" alt="" width={24} height={24} />
            <span className="hidden sm:inline">Ask Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
