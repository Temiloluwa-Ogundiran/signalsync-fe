"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Settings, HelpCircle } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import {
  buildNavRegistry,
  findActiveApp,
  type NavApp,
} from "./nav-registry";
import { useNavUiStore } from "./nav-ui-store";
import { ContextualNav } from "./nav-shared";

/** A single rail icon (tier 1) with hover tooltip + active violet treatment. */
function RailIcon({
  app,
  active,
  onHoverApp,
}: {
  app: NavApp;
  active: boolean;
  onHoverApp: (app: NavApp | null) => void;
}) {
  return (
    <div
      className="relative flex justify-center"
      onMouseEnter={() => onHoverApp(app)}
    >
      <Link
        href={app.route}
        aria-label={app.name}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/rail relative flex size-11 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-white/[0.06] text-sidebar-nav-active-text"
            : "text-sidebar-nav-inactive-text hover:bg-white/[0.04] hover:text-sidebar-nav-active-text",
        )}
      >
        {/* Active app: violet left-edge accent bar */}
        <span
          aria-hidden
          className={cn(
            "absolute -left-2 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-ai-accent transition-opacity",
            active ? "opacity-100" : "opacity-0",
          )}
        />
        <HugeiconsIcon
          icon={app.icon}
          size={22}
          strokeWidth={1.5}
          className={cn(
            "text-current",
            // Partna AI keeps a violet identity even at rest
            app.isAI && !active && "text-ai-accent",
          )}
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
  const expanded = useNavUiStore((s) => s.sidebarExpanded);
  const toggleSidebar = useNavUiStore((s) => s.toggleSidebar);
  const [hoverApp, setHoverApp] = useState<NavApp | null>(null);

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

  // When collapsed, the flyout shows the hovered app (fallback: active app).
  const flyoutApp = hoverApp ?? activeApp;

  return (
    <div
      className="relative hidden h-screen shrink-0 lg:flex"
      onMouseLeave={() => setHoverApp(null)}
    >
      {/* TIER 1 — icon rail */}
      <div className="flex h-full w-16 shrink-0 flex-col items-center bg-sidebar-chrome-bg">
        {/* Logo spans the top of the nav zone */}
        <div className="flex h-header w-full shrink-0 items-center justify-center border-b border-sidebar-divider">
          <Link href="/journal" aria-label="TradePartna home">
            <Image
              src="/syncgram/logo-mark.svg"
              alt=""
              width={28}
              height={35}
              priority
            />
          </Link>
        </div>

        <div className="scrollbar-thin flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto py-5">
          {apps.map((app) => (
            <RailIcon
              key={app.id}
              app={app}
              active={app.id === activeApp.id}
              onHoverApp={setHoverApp}
            />
          ))}
        </div>

        {/* Pinned: Settings + Help */}
        <div className="flex shrink-0 flex-col items-center gap-1.5 pb-4 pt-2">
          <RailPinned icon={Settings} label="Settings" href="/settings" />
          <RailPinned icon={HelpCircle} label="Help" href="/help" />
        </div>
      </div>

      {/* TIER 2 — contextual sidebar (expanded) */}
      {expanded ? (
        <aside className="relative flex h-full w-[200px] shrink-0 flex-col border-l border-sidebar-divider bg-sidebar-chrome-bg font-sans">
          <ContextualNav app={activeApp} pathname={pathname} />
          <CollapseToggle expanded onToggle={toggleSidebar} />
        </aside>
      ) : (
        <>
          {/* Collapsed: expand affordance lives on the rail's edge */}
          <CollapseToggle expanded={false} onToggle={toggleSidebar} />
          {/* Hover flyout — the active/hovered app's grouped nav, one hover away */}
          {hoverApp ? (
            <div className="absolute left-16 top-0 z-drawer h-full w-[200px]">
              <aside className="flex h-full w-full flex-col border-l border-sidebar-divider bg-sidebar-chrome-bg font-sans shadow-2xl">
                <ContextualNav
                  app={flyoutApp}
                  pathname={pathname}
                  onNavigate={() => setHoverApp(null)}
                />
              </aside>
            </div>
          ) : null}
        </>
      )}
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

/** Collapse/expand chevron straddling the tier-1/tier-2 boundary. */
function CollapseToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(
        "absolute top-1/2 z-overlay flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-divider bg-card-bg text-sidebar-nav-inactive-text shadow-md transition-colors hover:text-sidebar-nav-active-text cursor-pointer",
        expanded ? "-right-3" : "left-[52px]",
      )}
    >
      {expanded ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeftOpen className="h-4 w-4" />
      )}
    </button>
  );
}
