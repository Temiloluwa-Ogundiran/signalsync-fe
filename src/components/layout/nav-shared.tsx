"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { isItemActive, type NavApp, type NavGroup, type NavItem } from "./nav-registry";
import { useNavUiStore } from "./nav-ui-store";

/**
 * One contextual-sidebar item. Active items get the violet left-accent + lifted
 * bg + white text — the same active language as the rail. `comingSoon` items
 * render muted with a "Soon" tag and do not navigate.
 */
function NavItemRow({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isItemActive(item, pathname);

  const inner = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <HugeiconsIcon
          icon={item.icon}
          size={20}
          strokeWidth={1.5}
          className="text-current"
        />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.comingSoon ? (
        <span className="shrink-0 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-text-tertiary">
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
        className={cn(baseClass, "cursor-default text-text-tertiary")}
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
          ? "bg-sidebar-nav-active-bg text-sidebar-nav-active-text"
          : "text-sidebar-nav-inactive-text hover:bg-white/[0.04] hover:text-sidebar-nav-active-text",
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
              className="group/hdr flex flex-1 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary transition-colors hover:text-text-secondary cursor-pointer"
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
            <span className="flex-1 truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {group.header}
            </span>
          )}
          {group.action ? (
            <button
              type="button"
              onClick={group.action.onClick}
              aria-label={group.action.label}
              title={group.action.label}
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-white/[0.04] hover:text-text-primary cursor-pointer"
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
  pathname,
  onNavigate,
}: {
  app: NavApp;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-header shrink-0 items-center border-b border-sidebar-divider px-5">
        <span className="truncate text-xl font-bold tracking-tight text-text-primary">
          {app.name}
        </span>
      </div>
      <nav className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
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
    </>
  );
}
