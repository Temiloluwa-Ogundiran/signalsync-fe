"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AiChatCore } from "./ai-chat-core";
import { useAiDockStore } from "../store/ai-dock-store";
import { useAiSession, useCreateAiSession } from "../hooks/use-ai-sessions";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";

/**
 * AI chat surface. The session/history sidebar now lives in the global tier-2
 * nav (see AiNavSidebar); this page renders the chat area only and reflects the
 * session selected there via the shared store.
 */
export function AiChatPage() {
  const { activeSessionId, setActiveSessionId, close } = useAiDockStore();

  // Mutual exclusion: the slide-over dock and this full-page surface share the
  // same store. If the dock is open when we land here, close it so only one
  // surface renders (and they don't race on activeSessionId).
  useEffect(() => {
    close();
  }, [close]);

  const searchParams = useSearchParams();
  // The header's account selector puts ?accountId=X in the URL when on non-journal routes.
  const accountId = searchParams.get("accountId") || null;

  const { data: accounts = [] } = useJournalAccounts();
  const activeAccount = accounts.find((a) => a.id === accountId) ?? null;

  const { data: activeSessionData } = useAiSession(activeSessionId);
  const { mutateAsync: createSession } = useCreateAiSession();

  const handleNewChat = async (scopeAccountId?: string | null) => {
    try {
      const s = await createSession({
        title: "New chat",
        ...(scopeAccountId ? { account_id: scopeAccountId } : {}),
      });
      setActiveSessionId(s.id);
    } catch (err) {
      // Don't swallow: a failed session create leaves the composer permanently
      // disabled with no cursor. Reset the guard so the effect can retry, and
      // log so the failure is visible in the console / error reporting.
      lastSessionAccountId.current = undefined;
      console.error("Failed to create AI session", err);
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
    <div className="flex h-full flex-col min-w-0">
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
          sessionId={activeSessionId}
          initialMessages={activeSessionData?.messages}
          context={null}
        />
      </div>
    </div>
  );
}
