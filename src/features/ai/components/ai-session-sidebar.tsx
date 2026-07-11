"use client";

import { formatDistanceToNow } from "date-fns";
import { History, MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiSession } from "../types";

interface AiSessionSidebarProps {
  sessions: AiSession[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  onDelete: (sessionId: string) => void;
}

export function AiSessionSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
}: AiSessionSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 px-3 pt-3 pb-2 border-b border-border-secondary/40">
        <div className="flex items-center gap-2 px-1">
          <History className="h-4 w-4 text-text-tertiary" />
          <span className="text-sm font-semibold text-text-primary">History</span>
        </div>
        {/* Prominent primary action — a filled brand pill, not a bare text link. */}
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-[background-color,box-shadow,transform] hover:bg-brand-hover hover:shadow active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain py-2">
        {sessions.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-tertiary">
            No conversations yet
          </p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "group flex items-start justify-between gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors",
                s.id === activeSessionId
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-sidebar-nav-active-bg text-text-primary",
              )}
              onClick={() => onSelect(s.id)}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {s.title || "New chat"}
                  </p>
                  {s.last_message_at && (
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {formatDistanceToNow(new Date(s.last_message_at), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                className="shrink-0 p-1 rounded text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-red-500 transition-[color,opacity]"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
