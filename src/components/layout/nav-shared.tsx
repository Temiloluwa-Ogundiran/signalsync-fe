"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, ChevronLeft } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { isItemActive, type NavApp, type NavGroup, type NavItem } from "./nav-registry";
import { useNavUiStore } from "./nav-ui-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * One contextual-sidebar item. Active items get the violet left-accent + lifted
 * bg + white text — the same active language as the rail. `comingSoon` items
 * render muted with a "Soon" tag and do not navigate.
 */
function NavItemRow({
  item,
  siblings,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  siblings: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isItemActive(item, pathname, siblings);

  const inner = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <HugeiconsIcon
          icon={item.icon}
          size={20}
          strokeWidth={1.5}
          className={cn("text-current", active && "text-ai-accent")}
        />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.comingSoon ? (
        <span className="shrink-0 rounded-full bg-surface-subtle px-1.5 py-0.5 text-[9px] font-semibold uppercase text-text-tertiary">
          Soon
        </span>
      ) : typeof item.count === "number" ? (
        <span className="shrink-0 text-[13px] font-medium tabular-nums text-text-tertiary">
          {item.count}
        </span>
      ) : null}
    </>
  );

  const baseClass = cn(
    "group/navitem relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium leading-snug transition-colors",
  );

  if (item.comingSoon) {
    return (
      <div
        className={cn(
          baseClass,
          // Recessed: clearly not-yet-available, doesn't compete with live items.
          "cursor-default text-text-tertiary [&_svg]:opacity-70",
        )}
        aria-disabled
        title="Coming soon"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={item.route}
      onClick={() => onNavigate?.()}
      aria-current={active ? "page" : undefined}
      className={cn(
        baseClass,
        active
          ? // Neutral grey pill (no purple — purple is reserved for AI).
            "bg-surface-subtle text-text-primary"
          : // Hover stays lighter than the switcher's resting fill so a hovered
            // item never reads as the switcher.
            "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
      )}
    >
      {inner}
    </Link>
  );
}

/**
 * A group: optional uppercase header with an optional inline "+" action and an
 * optional collapse chevron, then its items. Collapse state is persisted.
 */
function NavGroupBlock({
  app,
  group,
  groupIndex,
  pathname,
  onNavigate,
}: {
  app: NavApp;
  group: NavGroup;
  groupIndex: number;
  pathname: string;
  onNavigate?: () => void;
}) {
  const groupKey = `${app.id}:${group.header ?? `g${groupIndex}`}`;
  const collapsed = useNavUiStore((s) => s.groupCollapsed[groupKey] ?? false);
  const toggleGroup = useNavUiStore((s) => s.toggleGroup);
  const showItems = !group.collapsible || !collapsed;

  return (
    <div className="flex flex-col gap-1">
      {group.header ? (
        <div className="flex items-center justify-between gap-2 px-3 pb-1.5 pt-4">
          {group.collapsible ? (
            <button
              type="button"
              onClick={() => toggleGroup(groupKey)}
              aria-expanded={!collapsed}
              className="group/hdr flex flex-1 items-center gap-1.5 text-xs font-semibold uppercaser text-text-tertiary transition-colors hover:text-text-secondary cursor-pointer"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
              <span className="truncate">{group.header}</span>
            </button>
          ) : (
            <span className="flex flex-1 items-center gap-1.5 truncate text-xs font-semibold uppercaser text-text-tertiary">
              {group.headerIcon ? (
                <HugeiconsIcon
                  icon={group.headerIcon}
                  size={14}
                  strokeWidth={1.8}
                  className="shrink-0"
                />
              ) : null}
              {group.header}
            </span>
          )}
          {group.action ? (
            <button
              type="button"
              onClick={group.action.onClick}
              aria-label={group.action.label}
              title={group.action.label}
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
            >
              <HugeiconsIcon icon={group.action.icon} size={14} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      ) : null}

      {showItems ? (
        <div className="flex flex-col gap-1">
          {group.items.map((item) => (
            <NavItemRow
              key={item.label + item.route}
              item={item}
              siblings={group.items}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The active app's grouped nav. Shared by the expanded contextual sidebar and
 * the collapsed-state hover flyout, so they never drift apart.
 */
export function ContextualNav({
  app,
  apps,
  pathname,
  onNavigate,
  footer,
}: {
  app: NavApp;
  /** All apps, for the switcher dropdown. */
  apps: NavApp[];
  pathname: string;
  onNavigate?: () => void;
  /** Pinned bottom area (e.g. Journal's balance card + Add Trade). */
  footer?: React.ReactNode;
}) {
  return (
    <>
      <nav className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3">
        {/* Standalone apps (Settings) are a context you enter/exit → back header.
            Main apps get the switcher to hop between them. */}
        {app.standalone ? (
          <BackHeader app={app} onNavigate={onNavigate} />
        ) : (
          <AppSwitcher app={app} apps={apps} onNavigate={onNavigate} />
        )}
        {app.groups.map((group, i) => (
          <NavGroupBlock
            key={group.header ?? `group-${i}`}
            app={app}
            group={group}
            groupIndex={i}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {footer ? <div className="shrink-0">{footer}</div> : null}
    </>
  );
}

/**
 * Context header that names the current app (with its rail glyph) and doubles as
 * an app switcher. Sits on the same grid as the nav items below, so it reads as
 * "you are in <app>" rather than a competing page title.
 */
/**
 * Header for a standalone context (e.g. Settings): a back button + title. Reads
 * as "you entered Settings, tap back to leave" — not an app switcher.
 */
function BackHeader({
  app,
  onNavigate,
}: {
  app: NavApp;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="mb-2 flex items-center gap-2 px-1 py-1">
      <button
        type="button"
        aria-label="Back"
        onClick={() => {
          router.push("/dashboard");
          onNavigate?.();
        }}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary transition-colors hover:bg-surface-subtle-hover hover:text-text-primary cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="truncate text-base font-semibold text-text-primary">
        {app.name}
      </span>
    </div>
  );
}

export function AppSwitcher({
  app,
  apps,
  onNavigate,
}: {
  app: NavApp;
  apps: NavApp[];
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Current app: ${app.name}. Switch app`}
          className="group/switch mb-2 flex items-center gap-3 rounded-lg bg-surface-subtle px-3 py-3 text-left transition-colors hover:bg-surface-subtle-hover"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-text-secondary">
            <HugeiconsIcon icon={app.icon} size={20} strokeWidth={1.5} />
          </span>
          <span className="flex-1 truncate text-sm font-semibold text-text-primary">
            {app.name}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-data-[state=open]/switch:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[200px] border-chrome-control-border bg-card-bg p-1"
      >
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercaser text-text-tertiary">
          Switch app
        </p>
        {apps.map((entry) => {
          const isCurrent = entry.id === app.id;
          return (
            <Link
              key={entry.id}
              href={entry.route}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isCurrent
                  ? "text-text-primary"
                  : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <HugeiconsIcon
                  icon={entry.icon}
                  size={18}
                  strokeWidth={1.5}
                  className={cn(entry.isAI && "text-ai-accent")}
                />
              </span>
              <span className="flex-1 truncate">{entry.name}</span>
              {isCurrent ? (
                <Check className="h-4 w-4 shrink-0 text-ai-accent" />
              ) : null}
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
