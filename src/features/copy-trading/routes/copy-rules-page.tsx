"use client";

import { Plus, Route as RouteIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  CopyActivity,
  CopyRoute,
  CopyTradingConnection,
  TelegramConnection,
  TelegramSource,
} from "../types";
import { useCopyTradingActions } from "../hooks";
import { apiError } from "../utils";
import { EmptyState } from "../shared/empty-state";
import { CopyRuleForm } from "./copy-rule-form";
import { ConfirmActionDialog } from "../shared/confirm-action-dialog";
import { CopyRouteMap } from "./copy-route-map";

export function CopyRulesPage({
  routes,
  sources,
  accounts,
  connections,
  activity,
  loading,
}: {
  routes: CopyRoute[];
  sources: TelegramSource[];
  accounts: CopyTradingConnection[];
  connections: TelegramConnection[];
  activity: CopyActivity[];
  loading: boolean;
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
          <h1 className="text-pretty text-2xl font-bold text-text-primary">
            Copy Routes
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            See where every Telegram signal goes and how each account will copy
            it.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New Copy Route
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <p className="sr-only">Loading copy routes...</p>
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-lg border border-border-primary bg-card-bg motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : routes.length ? (
        <CopyRouteMap
          routes={routes}
          sources={sources}
          accounts={accounts}
          activity={activity}
          busy={actions.routeAction.isPending}
          onStateChange={(route) =>
            act(
              route,
              route.state === "active"
                ? "pause"
                : route.state === "paused"
                  ? "resume"
                  : "activate",
            )
          }
          onEdit={(route) => {
            setEditing(route);
            setFormOpen(true);
          }}
          onDelete={setDeleting}
        />
      ) : (
        <EmptyState
          icon={RouteIcon}
          title="No Copy Routes Yet"
          body="Connect a Telegram signal channel to a trading account to start copying."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              New Copy Route
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
        connections={connections}
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
