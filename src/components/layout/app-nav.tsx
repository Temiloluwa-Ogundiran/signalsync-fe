"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings, HelpCircle, Plus } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { useNavUiStore } from "./nav-ui-store";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { formatMoney } from "@/lib/format/money";
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
            ? // Bright active icon on the deep-indigo rail.
              "bg-nav-rail-icon-hover-bg text-nav-rail-icon-active"
            : "text-nav-rail-icon hover:bg-nav-rail-icon-hover-bg hover:text-nav-rail-icon-active",
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
  const mobileNavOpen = useNavUiStore((s) => s.mobileNavOpen);
  const closeMobileNav = useNavUiStore((s) => s.closeMobileNav);

  // Close the off-canvas drawer whenever the route changes (e.g. tapping a nav
  // link) so it never lingers open over the new page on small screens.
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

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

  // Settings has longer labels (e.g. "Custom Tags") — give its context a
  // slightly wider sidebar than the standard apps so labels don't truncate.
  const isSettings = activeApp.id === "settings";
  const sidebarWidth = isSettings ? "w-[248px]" : "w-[200px]";
  const railPlusSidebarWidth = isSettings ? "w-[312px]" : "w-[264px]";

  return (
    <>
      {/* Backdrop — only below lg, only while the drawer is open. */}
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileNav}
          className="fixed inset-0 z-overlay bg-overlay lg:hidden"
        />
      ) : null}

      <div
        className={cn(
          // Below lg: fixed off-canvas drawer that slides in from the left.
          // At lg+: a static in-flow column (rail + contextual sidebar).
          "fixed inset-y-0 left-0 z-drawer flex h-screen shrink-0 flex-col bg-nav-sidebar-bg shadow-2xl transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:shadow-none lg:transition-none",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          railPlusSidebarWidth,
        )}
      >
      {/* Brand bar — full logo, flush to the left edge, spanning rail + sidebar.
          Bottom hairline matches the header's border so the horizontal line runs
          unbroken from the left edge across into the header. */}
      <div className="flex h-header shrink-0 items-center border-b border-nav-hairline px-4">
        <Link href="/dashboard" aria-label="TradePartna home" className="flex">
          {/* Light vs dark logo — toggled by the `.dark` class on <html> so it
              swaps with no JS/hydration flash. Light logo has dark text. */}
          <Image
            src="/brand/tradpartnalight.svg"
            alt="TradePartna"
            width={156}
            height={20}
            priority
            className="h-5 w-auto dark:hidden"
          />
          <Image
            src="/brand/tradepartna-logo-full.svg"
            alt="TradePartna"
            width={156}
            height={20}
            priority
            className="hidden h-5 w-auto dark:block"
          />
        </Link>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* TIER 1 — icon rail (slightly darkest tone) */}
        <div className="flex h-full w-16 shrink-0 flex-col items-center bg-nav-rail-bg">
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto py-5">
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
            <RailPinned
              icon={HelpCircle}
              label="Support"
              href="mailto:hello@tradepartna.com"
            />
          </div>
        </div>

        {/* TIER 2 — contextual sidebar (clear tonal step lighter than the rail).
            A near-subliminal seam sharpens the boundary without reading as a line.
            Partna AI hosts its session/history nav here instead of generic groups. */}
        <aside
          className={cn(
            "relative flex h-full shrink-0 flex-col border-l border-nav-seam bg-nav-sidebar-bg font-sans",
            sidebarWidth,
          )}
        >
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
    </>
  );
}

/** Per-app pinned footer. Performance gets its balance card + Add Trade controls. */
function renderAppFooter(app: NavApp) {
  if (app.id === "performance") return <JournalNavFooter />;
  return null;
}

/**
 * Journal sidebar footer: the active account's balance, then an "Add New Trade"
 * button with a split "import trades" action — mirrors the legacy sidebar.
 */
function JournalNavFooter() {
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);
  const { data: accounts = [] } = useJournalAccounts();

  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) ?? accounts[0];
  // Backend serializes the Decimal as a string ("583.61"); coerce to number.
  // Missing/zero balance still shows the card — defaults to 0.00.
  const rawBalance = activeAccount?.latest_balance;
  const numericBalance = rawBalance == null ? 0 : Number(rawBalance);
  const balance = Number.isFinite(numericBalance) ? numericBalance : 0;

  return (
    <div className="flex flex-col gap-3 p-3">
      {activeAccount ? (
        <div className="rounded-xl bg-surface-subtle px-4 py-3">
          <p className="text-lg font-bold leading-tight text-text-primary tabular-nums">
            {formatMoney(balance, { currency: activeAccount.currency })}
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">Account Balance</p>
        </div>
      ) : null}

      <Link
        href="/accounts"
        className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-nav-rail-bg px-3.5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:hover:opacity-100"
      >
        <Plus className="h-4 w-4" />
        Add New Trade
      </Link>
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
      <a
        href={href}
        aria-label={label}
        className="flex size-11 items-center justify-center rounded-xl text-nav-rail-icon transition-colors hover:bg-nav-rail-icon-hover-bg hover:text-nav-rail-icon-active"
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </a>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-overlay ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-divider bg-card-bg px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-100 group-hover/rail:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
