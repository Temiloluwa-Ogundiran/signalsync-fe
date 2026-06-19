"use client";

import { Menu, Sparkles } from "lucide-react";
import { useAiDockStore } from "@/features/ai/store/ai-dock-store";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import Image from "next/image";
import { format } from "date-fns";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import {
  HeaderDateRangePicker,
  HeaderAccountSelector,
} from "./header-controls";
import type { DateRange } from "react-day-picker";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const openAi = useAiDockStore((s) => s.open);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: accounts = [] } = useJournalAccounts();
  const isJournalRoute =
    pathname.includes("/dashboard") || pathname.includes("/journal");
  const storeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const openConnectModal = useJournalUiStore((s) => s.openConnectModal);
  const isJournalArea =
    pathname.includes("/dashboard") ||
    pathname.includes("/journal") ||
    pathname.includes("/trade-history") ||
    pathname.includes("/accounts");
  const paramAccountId = searchParams.get("accountId") || "";
  const activeAccountId = isJournalArea
    ? paramAccountId || storeAccountId || accounts[0]?.id || ""
    : paramAccountId;
  const activeAccount = accounts.find(
    (account) => account.id === activeAccountId,
  );

  const parsedDateRange = useMemo<DateRange | undefined>(() => {
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    if (!fromDate) return undefined;
    const parsedFrom = new Date(fromDate);
    if (Number.isNaN(parsedFrom.getTime())) return undefined;
    if (!toDate) return { from: parsedFrom };
    const parsedTo = new Date(toDate);
    if (Number.isNaN(parsedTo.getTime())) return { from: parsedFrom };
    return { from: parsedFrom, to: parsedTo };
  }, [searchParams]);

  const rangeLabel = useMemo(() => {
    if (!parsedDateRange?.from || !parsedDateRange.to) return "Date range";
    return `${format(parsedDateRange.from, "LLL dd, y")} - ${format(parsedDateRange.to, "LLL dd, y")}`;
  }, [parsedDateRange]);

  const applyDateRange = (nextRange: DateRange | undefined) => {
    if (!isJournalRoute) return;
    const params = new URLSearchParams(searchParams.toString());
    if (!nextRange?.from) {
      params.delete("fromDate");
      params.delete("toDate");
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
      );
      return;
    }

    const formatParam = (value: Date) => format(value, "yyyy-MM-dd");
    params.set("fromDate", formatParam(nextRange.from));
    if (nextRange.to) {
      params.set("toDate", formatParam(nextRange.to));
    } else {
      params.delete("toDate");
    }

    router.replace(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
    );
  };

  const selectAccount = (accountId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isJournalArea) {
      setActiveAccountId(accountId);
      params.set("accountId", accountId);
    } else {
      params.set("accountId", accountId);
    }
    router.replace(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
    );
  };

  const openAddAccount = () => {
    openConnectModal();
  };

  return (
    <>
      <header className="relative z-header flex h-header shrink-0 items-center bg-chrome-bar-bg px-chrome font-sans border-b border-nav-hairline">
        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
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
              <span className="truncate font-heading text-xl font-bold leading-tight tracking-tight text-text-primary">
                TradePartna
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1" />

          {/* ROW 1 right group — global chrome: Ask Partna AI → avatar.
              Account selector + date range now live in the page header (ROW 2). */}
          <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2">
            {FEATURE_FLAGS.AI && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => openAi({ source: "Header" })}
                className="ai-trigger hidden sm:flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] text-xs px-3 py-2 h-9"
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

      {/* Mobile Sub-Header controls bar (only visible on mobile lg:hidden) */}
      <div className="flex lg:hidden items-center justify-between gap-2 border-b border-border-secondary/40 bg-chrome-bar-bg/95 px-chrome py-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <HeaderDateRangePicker
            variant="mobile"
            range={parsedDateRange}
            rangeLabel={rangeLabel}
            onApply={applyDateRange}
          />
          <HeaderAccountSelector
            variant="mobile"
            accounts={accounts}
            activeAccountId={activeAccountId}
            activeLabel={
              activeAccount?.display_name ||
              activeAccount?.broker_login ||
              (accounts.length === 0 ? "Connect" : "Select")
            }
            onSelect={selectAccount}
            onAddAccount={openAddAccount}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </>
  );
}
