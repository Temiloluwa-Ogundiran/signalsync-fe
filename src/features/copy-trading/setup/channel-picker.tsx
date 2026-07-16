"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCopyTradingActions,
  useRefreshTelegramDialogs,
  useTelegramDialogs,
} from "../hooks";
import type {
  TelegramConnection,
  TelegramSource,
} from "../types";
import { apiError, connectionName } from "../utils";
import { Field, Select } from "../shared/form-controls";

export function ChannelPicker({
  open,
  onOpenChange,
  connections,
  sources,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connections: TelegramConnection[];
  sources: TelegramSource[];
  onAdded?: (source: TelegramSource) => void;
}) {
  const ready = connections.filter(
    (connection) => connection.state === "ready" && !connection.is_paused,
  );
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const connectionId = selectedId || ready[0]?.id || "";
  const dialogs = useTelegramDialogs(connectionId, open);
  const refreshDialogs = useRefreshTelegramDialogs(connectionId);
  const actions = useCopyTradingActions();
  const existing = useMemo(
    () =>
      new Set(
        sources.map(
          (source) => `${source.connection_id}:${source.telegram_chat_id}`,
        ),
      ),
    [sources],
  );
  const term = search.trim().toLowerCase();
  const filtered = (dialogs.data ?? []).filter(
    (dialog) =>
      !term ||
      dialog.title.toLowerCase().includes(term) ||
      (dialog.username ?? "").toLowerCase().includes(term),
  );

  const add = async (chatId: number) => {
    const dialog = dialogs.data?.find((item) => item.chat_id === chatId);
    if (!dialog) return;
    try {
      const source = await actions.createSource.mutateAsync({
        connection_id: connectionId,
        telegram_chat_id: dialog.chat_id,
        title: dialog.title,
        username: dialog.username,
        source_type: dialog.source_type,
      });
      toast.success("Signal channel added", {
        description: "New messages from this channel can now be processed.",
      });
      onAdded?.(source);
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not add this signal channel", {
        description: apiError(error),
      });
    }
  };

  const refresh = async () => {
    try {
      await refreshDialogs.mutateAsync();
      toast.success("Telegram channels refreshed");
    } catch (error) {
      toast.error("Could not refresh Telegram", {
        description: apiError(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border-primary px-6 py-5">
          <DialogTitle>Choose a signal channel</DialogTitle>
          <DialogDescription>
            Search channels and groups joined by the connected Telegram account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto px-6 pb-6">
          {ready.length > 1 ? (
            <Field label="Telegram account">
              <Select value={connectionId} onChange={setSelectedId}>
                {ready.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {connectionName(connection)}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
              <Input
                placeholder="Search channels and groups"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={dialogs.isFetching || refreshDialogs.isPending}
              aria-label="Refresh channels and groups"
              title="Refresh channels and groups"
            >
              <RefreshCw
                className={`size-4 ${dialogs.isFetching || refreshDialogs.isPending ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="max-h-[52vh] divide-y divide-border-primary overflow-y-auto rounded-md border border-border-primary">
            {dialogs.isLoading || (dialogs.isFetching && !dialogs.data) ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-text-secondary" />
              </div>
            ) : dialogs.isError ? (
              <div className="space-y-3 px-6 py-10 text-center">
                <p className="text-sm text-danger">{apiError(dialogs.error)}</p>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Try again
                </Button>
              </div>
            ) : filtered.length ? (
              filtered.map((dialog) => {
                const added = existing.has(
                  `${connectionId}:${dialog.chat_id}`,
                );
                return (
                  <button
                    key={dialog.chat_id}
                    type="button"
                    onClick={() => add(dialog.chat_id)}
                    disabled={added || actions.createSource.isPending}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-bg-tertiary disabled:cursor-default disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-text-primary">
                        {dialog.title}
                      </span>
                      <span className="text-xs capitalize text-text-secondary">
                        {dialog.source_type}
                        {dialog.is_admin ? " · administrator" : ""}
                        {dialog.username ? ` · @${dialog.username}` : ""}
                      </span>
                    </span>
                    {added ? (
                      <Badge variant="neutral">Added</Badge>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
                        <Plus className="size-4" />
                        Choose
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="py-10 text-center text-sm text-text-secondary">
                No channels match your search.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
