"use client";

import { useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AiGreeting } from "./ai-greeting";
import { AiMessageList } from "./ai-message-list";
import { AiComposer } from "./ai-composer";
import { useAiChat } from "../hooks/use-ai-chat";
import type { AiContext, AiMessage } from "../types";

interface AiChatCoreProps {
  /** The active session ID. When null the composer is disabled. */
  sessionId: string | null;
  /** Pre-loaded messages for this session (from the sessions query). */
  initialMessages?: AiMessage[];
  context?: AiContext | null;
}

export function AiChatCore({
  sessionId,
  initialMessages,
  context,
}: AiChatCoreProps) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const firstName =
    session?.user?.displayName?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "Trader";

  const { messages, isStreaming, streamingTool, error, sendMessage, initMessages, clearError } =
    useAiChat(sessionId, token);

  // Reset to the fetched messages whenever the active session changes.
  // Intentionally omitting initMessages/initialMessages from deps — firing on
  // every incremental server message would wipe the live streaming state.
  useEffect(() => {
    initMessages(initialMessages ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage],
  );

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="mx-3 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-500 flex items-center justify-between">
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

      <div className="flex-1 overflow-y-auto scrollbar-thin">
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
        disabled={isStreaming || !sessionId}
      />
    </div>
  );
}
