"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { AiGreeting } from "./ai-greeting";
import { AiMessageList } from "./ai-message-list";
import { AiComposer } from "./ai-composer";
import { useAiChat } from "../hooks/use-ai-chat";
import type { AiContext, AiMessage } from "../types";

interface AiChatCoreProps {
  /** The active session ID, or null when no session exists yet. */
  sessionId: string | null;
  /** Pre-loaded messages for this session (from the sessions query). */
  initialMessages?: AiMessage[];
  context?: AiContext | null;
  /**
   * Lazily create (and activate) a session on first send, returning its id.
   * Lets us avoid spawning empty sessions just from opening the panel.
   */
  onEnsureSession?: () => Promise<string | null>;
  /**
   * When set (the constrained dock), assistant messages flagged ::expand:: show
   * an "open full view" button. Omitted on the full /ai page.
   */
  onExpand?: () => void;
}

export function AiChatCore({
  sessionId,
  initialMessages,
  context,
  onEnsureSession,
  onExpand,
}: AiChatCoreProps) {
  const { data: session } = useSession();
  const firstName =
    session?.user?.displayName?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "Trader";

  const { messages, isStreaming, streamingTool, error, sendMessage, stop, initMessages, clearError } =
    useAiChat(sessionId);

  // Load a session's messages into the view. The catch: when you select a
  // session from History, `sessionId` changes immediately but `initialMessages`
  // (fetched async via useAiSession) lands a tick LATER — so keying only on
  // sessionId would init to [] and show the empty greeting, never re-syncing
  // when the data arrives. Track the session we've populated and (re)init once
  // its messages are available. Never re-init while streaming, so a live
  // response isn't wiped by a background refetch.
  const loadedForSession = useRef<string | null>(null);
  useEffect(() => {
    // While a response is streaming, leave messages alone. This is the
    // lazy-create case: clicking a greeting suggestion creates a session AND
    // starts streaming into it, so `sessionId` flips null→newId mid-stream.
    // Clearing here would wipe the optimistic user+assistant messages, leaving
    // the greeting up with the stop button stuck on. Adopt the new id as
    // already-loaded so the post-stream refetch doesn't re-wipe it either.
    if (isStreaming) {
      if (sessionId) loadedForSession.current = sessionId;
      return;
    }

    if (sessionId !== loadedForSession.current) {
      // A different session was selected (e.g. from History): clear now, then
      // fill once its messages arrive (initialMessages lands a tick later).
      initMessages([]);
      loadedForSession.current = null;
    }
    if (sessionId && initialMessages && loadedForSession.current !== sessionId) {
      initMessages(initialMessages);
      loadedForSession.current = sessionId;
    }
    if (!sessionId) loadedForSession.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, initialMessages, isStreaming]);

  const handleSend = useCallback(
    async (content: string) => {
      // Lazy session creation: if there's no session yet, create one now and
      // stream into it directly (passing the new id so we don't wait for the
      // sessionId prop to propagate). This is what keeps empty sessions from
      // being created just by opening the panel.
      if (!sessionId) {
        const newId = onEnsureSession ? await onEnsureSession() : null;
        if (!newId) return;
        sendMessage(content, newId);
        return;
      }
      sendMessage(content);
    },
    [sessionId, onEnsureSession, sendMessage],
  );

  const isEmpty = messages.length === 0;
  // A session is selected but its messages haven't loaded yet — show a loader,
  // not the empty greeting (which made selecting a chat look like a new chat).
  const isLoadingSession =
    !!sessionId && isEmpty && !isStreaming && !initialMessages;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-hidden">
      {error && (
        <div className="mx-3 mt-2 rounded-lg bg-danger-light border border-danger/20 px-3 py-2 text-xs text-danger flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-2 text-red-400 hover:text-red-300 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {isLoadingSession ? (
          <div className="flex h-full items-center justify-center">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-ai-accent/30 border-t-ai-accent" />
          </div>
        ) : isEmpty ? (
          <AiGreeting
            firstName={firstName}
            context={context ?? null}
            onPromptClick={handleSend}
          />
        ) : (
          <AiMessageList
            messages={messages}
            streamingTool={streamingTool}
            onAction={handleSend}
            isStreaming={isStreaming}
            onExpand={onExpand}
          />
        )}
      </div>

      <AiComposer
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={stop}
        // Allow typing/sending even with no session yet — handleSend creates one
        // on demand. Only hard-disable if we have neither a session nor a way to
        // make one.
        disabled={!sessionId && !onEnsureSession}
      />
    </div>
  );
}
