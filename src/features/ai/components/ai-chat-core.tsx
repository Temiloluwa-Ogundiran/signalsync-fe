"use client";

import { useCallback, useEffect } from "react";
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
}

export function AiChatCore({
  sessionId,
  initialMessages,
  context,
  onEnsureSession,
}: AiChatCoreProps) {
  const { data: session } = useSession();
  const firstName =
    session?.user?.displayName?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "Trader";

  const { messages, isStreaming, streamingTool, error, sendMessage, stop, initMessages, clearError } =
    useAiChat(sessionId);

  // Reset to the fetched messages whenever the active session changes.
  // Intentionally omitting initMessages/initialMessages from deps — firing on
  // every incremental server message would wipe the live streaming state.
  useEffect(() => {
    initMessages(initialMessages ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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
        {isEmpty ? (
          <AiGreeting
            firstName={firstName}
            context={context ?? null}
            onPromptClick={handleSend}
          />
        ) : (
          <AiMessageList messages={messages} streamingTool={streamingTool} />
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
