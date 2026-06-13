"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Maximize2, MoreHorizontal, Plus, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AiChatCore } from "./ai-chat-core";
import { AiSessionSidebar } from "./ai-session-sidebar";
import { useAiDockStore } from "../store/ai-dock-store";
import { useAiSession, useAiSessions, useCreateAiSession, useDeleteAiSession } from "../hooks/use-ai-sessions";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";

export function AiDock() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, context, activeSessionId, close, setActiveSessionId } =
    useAiDockStore();

  // Read the account the user has selected in the journal/dashboard header.
  // This is persisted in localStorage by useJournalUiStore.
  const accountId = useJournalUiStore((s) => s.activeAccountId) || null;
  const { data: accounts = [] } = useJournalAccounts();
  const activeAccount = accounts.find((a) => a.id === accountId) ?? null;
  const accountLabel =
    activeAccount?.display_name ||
    (activeAccount?.broker_login ? `Account ${activeAccount.broker_login}` : null);

  const [showHistory, setShowHistory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const { data: sessions = [] } = useAiSessions();
  const { data: activeSessionData } = useAiSession(activeSessionId);
  const { mutateAsync: createSession, isPending: isCreating } = useCreateAiSession();
  const { mutate: deleteSession } = useDeleteAiSession();

  // Track which account the current dock session was scoped to.
  // When the account changes while the dock is open, start a fresh scoped session.
  const sessionScopedTo = useRef<string | null | undefined>(undefined);

  const startNewSession = async (scopeAccountId?: string | null) => {
    const s = await createSession({
      title: "New chat",
      ...(scopeAccountId ? { account_id: scopeAccountId } : {}),
    });
    setActiveSessionId(s.id);
    sessionScopedTo.current = scopeAccountId ?? null;
    return s;
  };

  useEffect(() => {
    if (!isOpen || isCreating || !session?.accessToken) return;
    // Create a session if there's none, OR if the account has changed since we last created one.
    const accountChanged = sessionScopedTo.current !== undefined && sessionScopedTo.current !== accountId;
    if (!activeSessionId || accountChanged) {
      startNewSession(accountId).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accountId, session?.accessToken]);

  const handleNewChat = async () => {
    try {
      await startNewSession(accountId);
      setShowHistory(false);
    } catch {/* ignore */}
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setShowHistory(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (id === activeSessionId) {
      setActiveSessionId(null);
    }
  };

  const handleExpand = () => {
    close();
    router.push("/ai");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (subtle) */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
        onClick={close}
      />

      {/* Dock panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-sidebar-chrome-bg shadow-2xl border-l border-border-secondary/40 transition-transform duration-200",
          "sm:w-[420px]",
        )}
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border-secondary/40 px-4">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="History"
              onClick={() => setShowHistory((v) => !v)}
              className={cn(
                "rounded-lg p-2 text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg",
                showHistory && "bg-sidebar-nav-active-bg text-text-primary",
              )}
            >
              <History className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Open full page"
              onClick={handleExpand}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Options menu */}
            <div className="relative">
              <button
                type="button"
                title="Options"
                onClick={() => setShowOptions((v) => !v)}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showOptions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOptions(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-border-secondary/60 bg-card-bg py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => { handleNewChat(); setShowOptions(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-sidebar-nav-active-bg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New chat
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              title="Close"
              onClick={close}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Account scope chip */}
        {!showHistory && accountLabel && (
          <div className="flex items-center gap-1.5 border-b border-border-secondary/40 px-4 py-2">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
              Scoped to
            </span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
              {accountLabel}
            </span>
          </div>
        )}

        {/* Body */}
        {showHistory ? (
          <AiSessionSidebar
            sessions={sessions.filter((s) => !s.is_deleted)}
            activeSessionId={activeSessionId}
            onSelect={handleSelectSession}
            onNew={handleNewChat}
            onDelete={handleDeleteSession}
          />
        ) : (
          <div className="flex-1 min-h-0">
            {isCreating && !activeSessionId ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              </div>
            ) : (
              <AiChatCore
                sessionId={activeSessionId}
                initialMessages={activeSessionData?.messages}
                context={context}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
