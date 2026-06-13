"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AiChatCore } from "./ai-chat-core";
import { AiSessionSidebar } from "./ai-session-sidebar";
import { useAiDockStore } from "../store/ai-dock-store";
import {
  useAiSession,
  useAiSessions,
  useCreateAiSession,
  useDeleteAiSession,
} from "../hooks/use-ai-sessions";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";

export function AiChatPage() {
  const { activeSessionId, setActiveSessionId } = useAiDockStore();
  const [localSessionId, setLocalSessionId] = useState<string | null>(
    activeSessionId,
  );

  const searchParams = useSearchParams();
  // The header's account selector puts ?accountId=X in the URL when on non-journal routes.
  const accountId = searchParams.get("accountId") || null;

  const { data: accounts = [] } = useJournalAccounts();
  const activeAccount = accounts.find((a) => a.id === accountId) ?? null;

  const { data: sessions = [] } = useAiSessions();
  const { data: activeSessionData } = useAiSession(localSessionId);
  const { mutateAsync: createSession } = useCreateAiSession();
  const { mutate: deleteSession } = useDeleteAiSession();

  const handleNewChat = async (scopeAccountId?: string | null) => {
    try {
      const s = await createSession({
        title: "New chat",
        ...(scopeAccountId ? { account_id: scopeAccountId } : {}),
      });
      setLocalSessionId(s.id);
      setActiveSessionId(s.id);
    } catch {/* ignore */}
  };

  const handleSelect = (id: string) => {
    setLocalSessionId(id);
    setActiveSessionId(id);
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    if (id === localSessionId) {
      setLocalSessionId(null);
      setActiveSessionId(null);
    }
  };

  // Track the last account we started a session for so we don't create duplicates.
  const lastSessionAccountId = useRef<string | null | undefined>(undefined);

  // Auto-create a new scoped session whenever the selected account changes.
  // undefined means "not yet initialised", null means "no account selected".
  useEffect(() => {
    if (lastSessionAccountId.current === accountId) return;
    lastSessionAccountId.current = accountId;
    handleNewChat(accountId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const accountLabel =
    activeAccount?.display_name ||
    (activeAccount?.broker_login ? `Account ${activeAccount.broker_login}` : null);

  return (
    <div className="flex h-full">
      {/* Session sidebar */}
      <div className="hidden w-[260px] shrink-0 border-r border-border-secondary/40 md:flex md:flex-col">
        <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border-secondary/40 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
          </div>
          <span className="font-heading text-sm font-bold text-text-primary">
            Partna AI
          </span>
          <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
            Beta
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <AiSessionSidebar
            sessions={sessions.filter((s) => !s.is_deleted)}
            activeSessionId={localSessionId}
            onSelect={handleSelect}
            onNew={() => handleNewChat(accountId)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Account scope chip — only shows when an account is selected */}
        {accountLabel && (
          <div className="flex items-center gap-1.5 border-b border-border-secondary/40 px-4 py-2">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
              Scoped to
            </span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
              {accountLabel}
            </span>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <AiChatCore
            sessionId={localSessionId}
            initialMessages={activeSessionData?.messages}
            context={null}
          />
        </div>
      </div>
    </div>
  );
}
