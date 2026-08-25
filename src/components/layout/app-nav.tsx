"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
          "group/rail relative flex size-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-rail-icon-active focus-visible:ring-offset-2 focus-visible:ring-offset-nav-rail-bg",
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
        className="pointer-events-none absolute left-full top-1/2 z-tooltip ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-divider bg-card-bg px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-100 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100"
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
  const { data: session } = useSession();
  const mobileNavOpen = useNavUiStore((s) => s.mobileNavOpen);
  const closeMobileNav = useNavUiStore((s) => s.closeMobileNav);

  // Close the off-canvas drawer whenever the route changes (e.g. tapping a nav
  // link) so it never lingers open over the new page on small screens.
  // (Background scroll is frozen by the shell, which owns the page scroller.)
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  const apps = useMemo(
    () =>
      buildNavRegistry({
        onNewBacktest: () => {
          // Placeholder until Backtesting ships its create flow.
        },
        platformRole: session?.user.platformRole,
      }).filter((app) => !app.flag || FEATURE_FLAGS[app.flag]),
    [session?.user.platformRole],
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
  // Desktop (lg+) uses fixed widths; below lg the drawer is viewport-relative
  // and the contextual sidebar flexes to fill it (so labels never clip).
  // Full literal class strings only — Tailwind cannot see interpolated names.
  const isSettings = activeApp.id === "settings";
  const sidebarWidth = isSettings
    ? "flex-1 lg:flex-none lg:w-[248px]"
    : "flex-1 lg:flex-none lg:w-[200px]";
  // SignalSync AI has no tier-2 panel, so its column is just the icon rail (64px).
  // On mobile we still let the drawer take the standard width for tappability.
  const drawerWidth = activeApp.isAI
    ? "lg:w-16"
    : isSettings
      ? "lg:w-[312px]"
      : "lg:w-[264px]";

  return (
    <>
      {/* Backdrop — only below lg, only while the drawer is open. The AI app has
          no tier-2, so it stays an inline rail on mobile (no drawer/backdrop). */}
      {mobileNavOpen && !activeApp.isAI ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileNav}
          className="fixed inset-x-0 bottom-0 top-header z-nav-backdrop touch-none bg-overlay lg:hidden"
        />
      ) : null}

      <div
        id="mobile-navigation"
        aria-label="Main navigation"
        className={cn(
          activeApp.isAI
            ? // SignalSync AI: rail-only, always an in-flow static column (even on
              // mobile) — there's nothing to put in a drawer, so the rail just
              // stays pinned and the hamburger is hidden (see Header).
              "static flex h-full w-16 shrink-0 flex-col bg-nav-sidebar-bg"
            : cn(
                // Other apps — below lg: fixed off-canvas drawer below the header
                // (dvh keeps the pinned icons clear of Safari's bottom toolbar).
                // At lg+: a static in-flow full-height column at the desktop width.
                "fixed bottom-0 left-0 top-header z-drawer flex h-[calc(100dvh-var(--spacing-header))] shrink-0 flex-col overscroll-contain bg-nav-sidebar-bg shadow-2xl transition-transform duration-200 ease-out",
                "w-[80%] max-w-[300px]",
                "lg:static lg:z-auto lg:h-full lg:shadow-none lg:transition-none lg:max-w-none",
                mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                drawerWidth,
              ),
        )}
      >
      {/* No brand bar here — the full-width Header owns the logo now, so the nav
          column starts directly with the rail/sidebar below the header. */}
      <div className="flex min-h-0 flex-1">
        {/* TIER 1 — icon rail (slightly darkest tone) */}
        <div className="flex h-full w-16 shrink-0 flex-col items-center bg-nav-rail-bg">
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto overscroll-contain py-5">
            {topApps.map((app) => (
              <RailIcon
                key={app.id}
                app={app}
                active={app.id === activeApp.id}
              />
            ))}
          </div>

          {/* Pinned: Settings (real app) + Help. Safe-area bottom padding keeps
              these clear of the iPhone home indicator inside the drawer. */}
          <div className="flex shrink-0 flex-col items-center gap-1.5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {settingsApp ? (
              <RailIcon
                app={settingsApp}
                active={settingsApp.id === activeApp.id}
              />
            ) : null}
            <RailPinned
              icon={HelpCircle}
              label="Support"
              href="mailto:support@signalsync.com"
            />
          </div>
        </div>

        {/* TIER 2 — contextual sidebar (clear tonal step lighter than the rail).
            A near-subliminal seam sharpens the boundary without reading as a line.
            SignalSync AI is the exception: it has NO tier-2 here — its history lives
            in the full-screen /ai page — so the AI app shows the rail only. */}
        {!activeApp.isAI ? (
          <aside
            className={cn(
              "relative flex h-full shrink-0 flex-col border-l border-nav-seam bg-nav-sidebar-bg font-sans",
              sidebarWidth,
            )}
          >
            <ContextualNav
              app={activeApp}
              apps={topApps}
              pathname={pathname}
              footer={renderAppFooter(activeApp)}
            />
          </aside>
        ) : null}
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
        Manage accounts
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
        className="flex size-11 items-center justify-center rounded-xl text-nav-rail-icon transition-colors hover:bg-nav-rail-icon-hover-bg hover:text-nav-rail-icon-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-rail-icon-active focus-visible:ring-offset-2 focus-visible:ring-offset-nav-rail-bg"
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </a>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-tooltip ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-divider bg-card-bg px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity duration-100 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
