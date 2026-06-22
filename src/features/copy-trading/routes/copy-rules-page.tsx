"use client";

import {
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Route as RouteIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import type {
  CopyActivity,
  CopyRoute,
  CopyTargetAccount,
  TelegramSource,
} from "../types";
import { summarizeCopyRule } from "../copy-trading-view-model";
import { useCopyTradingActions } from "../hooks";
import { accountLabel, apiError, relativeTime } from "../utils";
import { EmptyState } from "../shared/empty-state";
import { StatusLabel } from "../shared/status-label";
import { CopyRuleForm } from "./copy-rule-form";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";

export function CopyRulesPage({
  routes,
  sources,
  accounts,
  activity,
}: {
  routes: CopyRoute[];
  sources: TelegramSource[];
  accounts: CopyTargetAccount[];
  activity: CopyActivity[];
}) {
  const actions = useCopyTradingActions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CopyRoute | undefined>();
  const [deleting, setDeleting] = useState<CopyRoute | null>(null);

  const act = async (
    route: CopyRoute,
    action: "activate" | "pause" | "resume",
  ) => {
    try {
      await actions.routeAction.mutateAsync({ id: route.id, action });
      toast.success(
        action === "pause"
          ? "Copying paused for this rule"
          : action === "resume"
            ? "Copying resumed for this rule"
            : "Copying started",
      );
    } catch (error) {
      toast.error("Copy rule could not be updated", {
        description: apiError(error),
      });
    }
  };

  const remove = async (route: CopyRoute) => {
    if (route.state === "active") {
      toast.error("Pause this copy rule before deleting it");
      return;
    }
    try {
      await actions.deleteRoute.mutateAsync(route.id);
      toast.success("Copy rule deleted");
    } catch (error) {
      toast.error("Copy rule could not be deleted", {
        description: apiError(error),
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Copy Rules</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Control how each signal channel copies into each trading account.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New copy rule
        </Button>
      </div>

      {routes.length ? (
        <div className="divide-y divide-border-primary overflow-hidden rounded-lg border border-border-primary bg-card-bg">
          {routes.map((route) => {
            const source = sources.find((item) => item.id === route.source_id);
            const account = accounts.find(
              (item) => item.id === route.target_account_id,
            );
            const latest = activity.find(
              (item) => item.route_id === route.id,
            );
            const active = route.state === "active";
            return (
              <div
                key={route.id}
                className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">
                      {source?.title ?? "Signal channel"} to{" "}
                      {accountLabel(account, route.target_account_id)}
                    </p>
                    <StatusLabel state={route.state} />
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {summarizeCopyRule(route)}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {latest
                      ? `Latest action ${relativeTime(latest.created_at)}`
                      : "No signal activity yet"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      act(route, active ? "pause" : route.state === "paused" ? "resume" : "activate")
                    }
                  >
                    {active ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    {active ? "Pause" : "Start"}
                  </Button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Copy rule actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={6}
                        className="z-popover min-w-44 rounded-md border border-border-primary bg-card-bg p-1 shadow-lg"
                      >
                        <DropdownMenu.Item
                          className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm text-text-primary outline-none data-highlighted:bg-bg-tertiary"
                          onSelect={() => {
                            setEditing(route);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit copy rule
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={active}
                          className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-danger/5"
                          onSelect={() => setDeleting(route)}
                        >
                          <Trash2 className="size-4" />
                          Delete copy rule
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={RouteIcon}
          title="No copy rules yet"
          body="Create a rule to connect one signal channel to one trading account."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              New copy rule
            </Button>
          }
        />
      )}

      <CopyRuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        route={editing}
        sources={sources}
        accounts={accounts}
      />
      <ConfirmActionDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this copy rule?"
        description="New signals from this channel will no longer be sent to this trading account. Existing broker trades are not changed."
        confirmLabel="Delete copy rule"
        onConfirm={async () => {
          if (deleting) await remove(deleting);
        }}
      />
    </div>
  );
}
