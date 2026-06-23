"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Maximize2, MoreHorizontal, Plus, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AiChatCore } from "./ai-chat-core";
import { AiSessionSidebar } from "./ai-session-sidebar";
import { useAiDockStore } from "../store/ai-dock-store";
import { useAiSession, useAiSessions, useCreateAiSession, useDeleteAiSession } from "../hooks/use-ai-sessions";
import { aiApi } from "../api/ai.api";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";
import { buildAccountLabel } from "@/features/journal/lib/account-label";

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
  const accountLabel = activeAccount ? buildAccountLabel(activeAccount) : null;

  const [showHistory, setShowHistory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Close the dock when the user clicks/taps anywhere outside the panel.
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [isOpen, close]);

  const { data: sessions = [] } = useAiSessions();
  const { data: activeSessionData } = useAiSession(activeSessionId);
  const { mutateAsync: createSession } = useCreateAiSession();
  const { mutate: deleteSession } = useDeleteAiSession();

  // Track which account the current dock session was scoped to.
  // When the account changes while the dock is open, start a fresh scoped session.
  const sessionScopedTo = useRef<string | null | undefined>(undefined);

  const startNewSession = async (scopeAccountId?: string | null) => {
    // No title on create — the backend auto-titles the session from the first
    // message. The sidebar shows "New chat" as a fallback until then. (Passing
    // a title here blocks backend auto-titling, leaving every chat "New chat".)
    const s = await createSession({
      ...(scopeAccountId ? { account_id: scopeAccountId } : {}),
    });
    setActiveSessionId(s.id);
    sessionScopedTo.current = scopeAccountId ?? null;
    return s;
  };

  // Lazy session creation: we no longer create a session when the dock opens
  // (that spawned empty "New chat" rows on every open). Instead the composer
  // calls ensureSession() on first send. We still start a FRESH session when the
  // scoped account changes mid-conversation.
  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (!session?.accessToken) return null;
    const accountChanged =
      sessionScopedTo.current !== undefined &&
      sessionScopedTo.current !== accountId;
    if (activeSessionId && !accountChanged) return activeSessionId;
    try {
      const s = await startNewSession(accountId);
      return s.id;
    } catch (err) {
      sessionScopedTo.current = undefined;
      console.error("Failed to create AI session", err);
      return null;
    }
    // startNewSession/accountId/activeSessionId are stable enough; deps kept minimal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, accountId, activeSessionId]);

  // Context-scoped open (e.g. "Continue with coach"): resolve the reuse-or-create
  // session pinned to this (contextType, contextRef) and activate it, so the
  // day/trade always maps to one persistent chat. The seedMessage (if any) is
  // handed to AiChatCore, which auto-sends it once the session is empty.
  const resolvedContextRef = useRef<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!isOpen || !session?.accessToken) return;
    const ctxType = context?.contextType;
    const ctxRef = context?.contextRef;
    if (!ctxType || !ctxRef) {
      resolvedContextRef.current = null;
      return;
    }
    const key = `${ctxType}:${ctxRef}`;
    if (resolvedContextRef.current === key) return;
    resolvedContextRef.current = key;
    setSeedMessage(context?.seedMessage ?? null);
    aiApi
      .getContextSession(ctxType, ctxRef, session.accessToken)
      .then((s) => {
        setActiveSessionId(s.id);
        sessionScopedTo.current = s.account_id ?? null;
      })
      .catch((err) => {
        resolvedContextRef.current = null;
        console.error("Failed to resolve context session", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, context?.contextType, context?.contextRef, session?.accessToken]);

  const handleNewChat = async () => {
    setSeedMessage(null);
    resolvedContextRef.current = null;
    try {
      await startNewSession(accountId);
      setShowHistory(false);
    } catch (err) {
      sessionScopedTo.current = undefined;
      console.error("Failed to create AI session", err);
    }
  };

  const handleSelectSession = (id: string) => {
    setSeedMessage(null);
    resolvedContextRef.current = null;
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
      {/* Dock panel */}
      <div
        ref={panelRef}
        className={cn(
          // h-[100dvh] (not h-full/100vh) so the panel doesn't run behind mobile
          // Safari's bottom toolbar, which was cutting off the composer input.
          "fixed right-0 top-0 z-modal flex h-[100dvh] w-full flex-col bg-sidebar-chrome-bg shadow-2xl border-l border-border-secondary/40 transition-transform duration-200",
          "sm:h-full sm:w-[420px]",
        )}
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border-secondary/40 px-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-ai-accent-bright), var(--color-ai-accent-deep))",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-heading text-sm font-bold text-ai-accent">
              Partna AI
            </span>
            <span className="rounded-full bg-ai-soft-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ai-accent">
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
          <div className="relative flex-1 min-h-0">
            {/* Header moment: a single soft violet glow bleeding from the top,
                behind the greeting. The one expressive accent in the panel. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 0%, var(--color-ai-glow), transparent 70%)",
              }}
            />
            <div className="relative z-10 h-full">
              <AiChatCore
                sessionId={activeSessionId}
                initialMessages={activeSessionData?.messages}
                context={context}
                seedMessage={seedMessage}
                onSeedConsumed={() => setSeedMessage(null)}
                onEnsureSession={ensureSession}
                onExpand={handleExpand}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
