"use client";

import {
  ArrowDown,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Send,
  Settings2,
  Trash2,
  WalletCards,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import type {
  CopyActivity,
  CopyRoute,
  CopyTradingConnection,
  TelegramSource,
} from "../types";
import { summarizeCopyRule } from "../copy-trading-view-model";
import { accountLabel, relativeTime } from "../utils";
import { StatusLabel } from "../shared/status-label";

export function CopyRouteMap({
  routes,
  sources,
  accounts,
  activity,
  onStateChange,
  onEdit,
  onDelete,
  busy,
}: {
  routes: CopyRoute[];
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
  activity: CopyActivity[];
  onStateChange: (route: CopyRoute) => void;
  onEdit: (route: CopyRoute) => void;
  onDelete: (route: CopyRoute) => void;
  busy: boolean;
}) {
  return (
    <ol
      className="space-y-4"
      aria-label="Copy routes from Telegram to trading accounts"
    >
      {routes.map((route) => {
        const source = sources.find((item) => item.id === route.source_id);
        const account = accounts.find(
          (item) => item.id === route.target_connection_id,
        );
        const latest = activity.find((item) => item.route_id === route.id);
        const active = route.state === "active";
        const routeName = `${source?.title ?? "Signal channel"} to ${accountLabel(
          account,
          route.target_connection_id ?? route.id,
        )}`;

        return (
          <li
            key={route.id}
            className="overflow-hidden rounded-lg border border-border-primary bg-card-bg"
          >
            <div className="flex flex-col gap-3 border-b border-border-primary px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-semibold text-text-primary">
                    {routeName}
                  </h2>
                  <StatusLabel state={route.state} />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {latest
                    ? `${latest.title} ${relativeTime(latest.created_at)}`
                    : "Waiting for the first signal"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => onStateChange(route)}
                >
                  {active ? (
                    <Pause aria-hidden="true" className="size-4" />
                  ) : (
                    <Play aria-hidden="true" className="size-4" />
                  )}
                  {active ? "Pause" : "Start"}
                </Button>
                <RouteActions
                  active={active}
                  routeName={routeName}
                  onEdit={() => onEdit(route)}
                  onDelete={() => onDelete(route)}
                />
              </div>
            </div>

            <div className="grid gap-0 p-4 lg:grid-cols-[minmax(13rem,0.9fr)_7rem_minmax(16rem,1.1fr)] lg:items-stretch lg:p-5">
              <div className="min-w-0 rounded-md border border-border-primary bg-bg-secondary px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Send aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-text-tertiary">
                      Signal source
                    </p>
                    <p className="mt-1 truncate font-semibold text-text-primary">
                      {source?.title ?? "Telegram channel"}
                    </p>
                    <p className="mt-1 text-xs capitalize text-text-secondary">
                      Telegram {source?.source_type ?? "channel"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="relative flex min-h-20 items-center justify-center py-2 lg:min-h-0 lg:py-0"
                aria-hidden="true"
              >
                <span className="absolute bottom-2 top-2 border-l border-dashed border-accent/60 lg:bottom-auto lg:left-0 lg:right-0 lg:top-1/2 lg:border-l-0 lg:border-t" />
                <span className="relative flex size-9 items-center justify-center rounded-full border border-accent/50 bg-bg-primary text-accent shadow-sm">
                  <Settings2 className="size-4" />
                </span>
                <ArrowDown className="absolute bottom-1 size-4 text-accent lg:hidden" />
              </div>

              <div className="min-w-0 rounded-md border border-border-primary bg-bg-secondary px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <WalletCards aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase text-text-tertiary">
                          Trading account
                        </p>
                        <p className="mt-1 truncate font-semibold text-text-primary">
                          {accountLabel(
                            account,
                            route.target_connection_id ?? route.id,
                          )}
                        </p>
                      </div>
                      <StatusLabel state={account?.state ?? "connecting"} />
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                      {account
                        ? `${account.platform.toUpperCase()} | ${account.broker_server}`
                        : "Account connection unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border-primary px-4 py-3 text-xs text-text-secondary lg:px-5">
              <span className="font-medium text-text-primary">
                How it copies:
              </span>{" "}
              {summarizeCopyRule(route)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function RouteActions({
  active,
  routeName,
  onEdit,
  onDelete,
}: {
  active: boolean;
  routeName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`More actions for ${routeName}`}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-popover min-w-44 rounded-md border border-border-primary bg-card-bg p-1 shadow-lg"
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm text-text-primary outline-none data-highlighted:bg-bg-tertiary data-[highlighted]:ring-2 data-[highlighted]:ring-ring/40"
            onSelect={onEdit}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit copy route
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={active}
            className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-danger/5 data-[highlighted]:ring-2 data-[highlighted]:ring-danger/30"
            onSelect={onDelete}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete copy route
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
