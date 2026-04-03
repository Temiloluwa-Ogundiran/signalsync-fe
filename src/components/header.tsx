"use client";

import { Menu, Plus } from "lucide-react";
import { IconChevronDown } from "@/components/icons/syncgram-nav-icons";
import { useAiInsightModal } from "@/features/dashboard/components/ai-insight-modal-provider";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { open: openAi } = useAiInsightModal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAccountsMenuOpen, setIsAccountsMenuOpen] = useState(false);
  const { data: accounts = [] } = useJournalAccounts();

  const activeAccountId = searchParams.get("accountId") || "";
  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );
  const title = useMemo(() => {
    if (pathname.includes("/journal")) return "Journal";
    if (pathname.includes("/tools")) return "Tools";
    if (pathname.includes("/overview")) return "Overview";
    if (pathname.includes("/settings")) return "Settings";
    return "";
  }, [pathname]);

  const selectAccount = (accountId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("accountId", accountId);
    router.replace(`${pathname}?${params.toString()}`);
    setIsAccountsMenuOpen(false);
  };

  const openAddAccount = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("connectAccount", "1");
    router.push(`/journal?${params.toString()}`);
    setIsAccountsMenuOpen(false);
  };

  return (
    <header className="relative z-30 flex h-[60px] shrink-0 items-center bg-chrome-bar-bg pl-[26px] pr-[26px] font-sans">
      <div className="flex w-full min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onMenuClick}
            className="shrink-0 text-sidebar-nav-inactive-text hover:text-sidebar-nav-active-text"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src="/syncgram/logo-mark.svg"
              alt=""
              width={28}
              height={35}
              className="shrink-0"
              priority
            />
            <span className="truncate hidden md:inline-block font-heading text-xl font-bold leading-tight tracking-tight text-text-primary">
              SyncTrade
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-left">
          {title ? (
            <h1 className="truncate font-heading text-4xl font-bold text-text-primary">
              {title}
            </h1>
          ) : null}
        </div>

        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2 md:gap-3">
          <button
            type="button"
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chrome-bar-bg text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg md:flex"
            aria-label="Currency"
          >
            <Image
              src="/icons/navbar/currency.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
          <button
            type="button"
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chrome-bar-bg text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg md:flex"
            aria-label="Filters"
          >
            <Image
              src="/icons/navbar/filter.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
          <div className="relative hidden items-stretch lg:flex">
            <button
              type="button"
              className="flex items-center gap-2 rounded-l-full border border-chrome-control-border px-4 py-2 text-sm font-semibold text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg"
            >
              <Image
                src="/icons/navbar/calendar.svg"
                alt=""
                width={24}
                height={24}
              />
              <span>Date range</span>
              <IconChevronDown />
            </button>
            <button
              type="button"
              onClick={() => setIsAccountsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-r-full border border-l-0 border-chrome-control-border px-4 py-2 text-sm font-semibold text-sidebar-nav-active-text transition-colors hover:bg-sidebar-nav-active-bg"
            >
              <Image
                src="/icons/navbar/accounts.svg"
                alt=""
                width={24}
                height={24}
              />
              <span>
                {activeAccount?.display_name ||
                  activeAccount?.broker_login ||
                  "All accounts"}
              </span>
              <IconChevronDown />
            </button>

            {isAccountsMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 rounded-xl border border-chrome-control-border bg-card-bg p-2 shadow-lg">
                {accounts.length ? (
                  <>
                    <div className="max-h-64 overflow-y-auto">
                      {accounts.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => selectAccount(account.id)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-sidebar-nav-active-bg"
                        >
                          <span>
                            {account.display_name ||
                              `Account ${account.broker_login}`}
                          </span>
                          {account.id === activeAccountId ? (
                            <span className="text-xs text-(--calendar-selected-ring)">
                              Active
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={openAddAccount}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-chrome-control-border px-3 py-2 text-sm font-semibold text-text-primary hover:bg-sidebar-nav-active-bg"
                    >
                      <Plus className="h-4 w-4" />
                      Add account
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openAddAccount}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-chrome-control-border px-3 py-2 text-sm font-semibold text-text-primary hover:bg-sidebar-nav-active-bg"
                  >
                    <Plus className="h-4 w-4" />
                    Add account
                  </button>
                )}
              </div>
            ) : null}
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
