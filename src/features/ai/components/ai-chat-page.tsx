"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { History } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { buildAccountLabel } from "@/features/journal/lib/account-label";

/**
 * Full-screen Partna AI surface. History lives IN this page now (not the global
 * nav): a persistent left pane on desktop, and a slide-in drawer (toggled by a
 * History button) on mobile, where the persistent pane is hidden.
 */
export function AiChatPage() {
  const { activeSessionId, setActiveSessionId, close } = useAiDockStore();

  // Mutual exclusion with the slide-over dock (shared store): if the dock is
  // open when we land here, close it so only one surface renders.
  useEffect(() => {
    close();
  }, [close]);

  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId") || null;

  const { data: accounts = [] } = useJournalAccounts();
  const activeAccount = accounts.find((a) => a.id === accountId) ?? null;

  const { data: sessions = [] } = useAiSessions();
  const { data: activeSessionData } = useAiSession(activeSessionId);
  const { mutateAsync: createSession } = useCreateAiSession();
  const { mutate: deleteSession } = useDeleteAiSession();

  // Mobile-only history drawer.
  const [historyOpen, setHistoryOpen] = useState(false);

  const lastSessionAccountId = useRef<string | null | undefined>(undefined);

  // Lazy session creation — create on first send (or explicit New chat), never
  // on mount, so opening the page doesn't spawn empty sessions.
  const ensureSession = useCallback(async (): Promise<string | null> => {
    const accountChanged =
      lastSessionAccountId.current !== undefined &&
      lastSessionAccountId.current !== accountId;
    if (activeSessionId && !accountChanged) return activeSessionId;
    try {
      const s = await createSession({
        ...(accountId ? { account_id: accountId } : {}),
      });
      setActiveSessionId(s.id);
      lastSessionAccountId.current = accountId;
      return s.id;
    } catch (err) {
      console.error("Failed to create AI session", err);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, activeSessionId]);

  const handleNewChat = () => {
    // Start a blank chat: clear the active session so the greeting shows; the
    // session itself is created lazily on first send.
    setActiveSessionId(null);
    lastSessionAccountId.current = undefined;
    setHistoryOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveSessionId(id);
    setHistoryOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    if (id === activeSessionId) setActiveSessionId(null);
  };

  const accountLabel = activeAccount ? buildAccountLabel(activeAccount) : null;

  const visibleSessions = sessions.filter((s) => !s.is_deleted);

  const historyPane = (
    <AiSessionSidebar
      sessions={visibleSessions}
      activeSessionId={activeSessionId}
      onSelect={handleSelect}
      onNew={handleNewChat}
      onDelete={handleDelete}
    />
  );

  return (
    <div className="flex h-full min-w-0">
      <h1 className="sr-only">Partna AI</h1>
      {/* Desktop history pane — persistent left column, hidden on mobile. */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border-secondary/40 bg-bg-secondary lg:flex">
        {historyPane}
      </aside>

      {/* Chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — only rendered when it has content: the mobile History
            toggle (hidden at lg+) and/or the account scope chip. Otherwise it
            would be an empty bordered strip (a stray line) on desktop. */}
        {accountLabel ? (
          <div className="flex items-center justify-between gap-2 border-b border-border-secondary/40 px-4 py-2">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary lg:hidden"
            >
              <History className="h-4 w-4" />
              History
            </button>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <span className="text-[10px] font-medium uppercase text-text-secondary">
                Scoped to
              </span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                {accountLabel}
              </span>
            </span>
          </div>
        ) : (
          // No scope chip → only the mobile History toggle needs a bar.
          <div className="flex items-center border-b border-border-secondary/40 px-4 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary"
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1">
          <AiChatCore
            sessionId={activeSessionId}
            initialMessages={activeSessionData?.messages}
            context={null}
            onEnsureSession={ensureSession}
          />
        </div>
      </div>

      {/* Mobile history drawer + backdrop (lg:hidden). Always mounted and
          animated via transitions (slide + fade) so it opens/closes smoothly
          instead of popping in. */}
      <button
        type="button"
        aria-label="Close history"
        onClick={() => setHistoryOpen(false)}
        tabIndex={historyOpen ? 0 : -1}
        className={cn(
          "fixed inset-0 z-nav-backdrop touch-none bg-overlay transition-opacity duration-200 lg:hidden",
          historyOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* AiSessionSidebar provides the "History" + "New chat" header; tap the
          backdrop (or pick/start a chat) to close. */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-nav-drawer flex w-[80%] max-w-[300px] flex-col overscroll-contain bg-bg-secondary shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          historyOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {historyPane}
      </aside>
    </div>
  );
}
