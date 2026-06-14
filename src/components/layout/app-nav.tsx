"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings, HelpCircle } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import {
  buildNavRegistry,
  findActiveApp,
  type NavApp,
} from "./nav-registry";
import { ContextualNav } from "./nav-shared";
import { AiNavSidebar } from "./ai-nav-sidebar";

/** A single rail icon (tier 1) with hover tooltip + active violet treatment. */
function RailIcon({
  app,
  active,
}: {
  app: NavApp;
  active: boolean;
}) {
  return (
    <div className="relative flex justify-center">
      <Link
        href={app.route}
        aria-label={app.name}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/rail relative flex size-11 items-center justify-center rounded-xl transition-colors",
          active
            ? // Neutral highlight — app selection, no violet (reserved for the
              // sidebar active page + Partna identity).
              "bg-white/[0.06] text-[#F4F4F5]"
            : "text-[#71717A] hover:bg-white/[0.04] hover:text-[#F4F4F5]",
        )}
      >
        <HugeiconsIcon
          icon={app.icon}
          size={22}
          // Active reads via a heavier stroke, not color.
          strokeWidth={active ? 2 : 1.5}
          className="text-current"
        />
        {app.isAI ? (
          <Sparkles
            aria-hidden
            className="absolute right-1.5 top-1.5 h-2.5 w-2.5 text-ai-accent"
          />
        ) : null}
      </Link>

      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-overlay ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-divider bg-card-bg px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-100 group-hover/rail:opacity-100"
      >
        {app.name}
      </span>
    </div>
  );
}

/**
 * Two-tier navigation (desktop / lg+):
 *  - Tier 1: persistent ~64px icon rail, one icon per registry app.
 *  - Tier 2: contextual sidebar rendering the active app's groups.
 * Collapse hides tier 2 (rail stays); hovering a rail icon while collapsed pops
 * out that app's grouped nav as a flyout. Collapse choice is persisted.
 */
export function AppNav() {
  const pathname = usePathname();

  const apps = useMemo(
    () =>
      buildNavRegistry({
        onNewBacktest: () => {
          // Placeholder until Backtesting ships its create flow.
        },
      }).filter((app) => !app.flag || FEATURE_FLAGS[app.flag]),
    [],
  );

  const activeApp = useMemo(
    () => findActiveApp(apps, pathname),
    [apps, pathname],
  );

  // Settings is a real app but pins to the bottom of the rail, like Help.
  const topApps = apps.filter((app) => app.id !== "settings");
  const settingsApp = apps.find((app) => app.id === "settings");

  return (
    <div className="relative hidden h-screen w-[264px] shrink-0 flex-col bg-nav-rail-bg lg:flex">
      {/* Brand bar — full logo, flush to the left edge, spanning rail + sidebar.
          No hard rule: the tonal step below + generous spacing do the work. */}
      <div className="flex h-header shrink-0 items-center px-4">
        <Link href="/journal" aria-label="TradePartna home" className="flex">
          <Image
            src="/brand/tradepartna-logo-full.svg"
            alt="TradePartna"
            width={156}
            height={20}
            priority
            className="h-5 w-auto"
          />
        </Link>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* TIER 1 — icon rail (slightly darkest tone) */}
        <div className="flex h-full w-16 shrink-0 flex-col items-center bg-nav-rail-bg">
          <div className="scrollbar-thin flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto py-5">
            {topApps.map((app) => (
              <RailIcon
                key={app.id}
                app={app}
                active={app.id === activeApp.id}
              />
            ))}
          </div>

          {/* Pinned: Settings (real app) + Help */}
          <div className="flex shrink-0 flex-col items-center gap-1.5 pb-4 pt-2">
            {settingsApp ? (
              <RailIcon
                app={settingsApp}
                active={settingsApp.id === activeApp.id}
              />
            ) : null}
            <RailPinned icon={HelpCircle} label="Help" href="/help" />
          </div>
        </div>

        {/* TIER 2 — contextual sidebar (clear tonal step lighter than the rail).
            A near-subliminal seam sharpens the boundary without reading as a line.
            Partna AI hosts its session/history nav here instead of generic groups. */}
        <aside className="relative flex h-full w-[200px] shrink-0 flex-col border-l border-nav-seam bg-nav-sidebar-bg font-sans">
          {activeApp.isAI ? (
            <AiNavSidebar app={activeApp} apps={topApps} />
          ) : (
            <ContextualNav
              app={activeApp}
              apps={topApps}
              pathname={pathname}
              footer={renderAppFooter(activeApp)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

/** Per-app pinned footer. Journal gets its balance card + Add Trade controls. */
function renderAppFooter(app: NavApp) {
  if (app.id === "journal") return <JournalNavFooter />;
  return null;
}

const balanceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Journal sidebar footer: the active account's balance, then an "Add New Trade"
 * button with a split "import trades" action — mirrors the legacy sidebar.
 */
function JournalNavFooter() {
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const openAddTradeModal = useJournalUiStore((s) => s.openAddTradeModal);
  const { data: accounts = [] } = useJournalAccounts();

  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) ?? accounts[0];
  // Backend serializes the Decimal as a string ("583.61"); coerce to number.
  const rawBalance = activeAccount?.latest_balance;
  const balance =
    rawBalance == null ? null : Number(rawBalance);
  const hasBalance = balance != null && Number.isFinite(balance);

  return (
    <div className="flex flex-col gap-3 p-3">
      {hasBalance ? (
        <div className="rounded-xl bg-white/[0.05] px-4 py-3">
          <p className="text-lg font-bold leading-tight text-text-primary tabular-nums">
            {balanceFormatter.format(balance as number)}
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">Account Balance</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => openAddTradeModal(null)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#0a0a0b] transition-colors hover:bg-white/90 cursor-pointer"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
        Add New Trade
      </button>
    </div>
  );
}

function RailPinned({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Settings;
  label: string;
  href: string;
}) {
  return (
    <div className="group/rail relative flex justify-center">
      <Link
        href={href}
        aria-label={label}
        className="flex size-11 items-center justify-center rounded-xl text-sidebar-nav-inactive-text transition-colors hover:bg-white/[0.04] hover:text-sidebar-nav-active-text"
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </Link>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-overlay ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-divider bg-card-bg px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-100 group-hover/rail:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
