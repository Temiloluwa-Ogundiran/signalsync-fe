import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamChat } from "../lib/sse";
import { AI_SESSION_KEYS } from "./use-ai-sessions";
import type { AiMessage, StreamingMessage } from "../types";

export function useAiChat(sessionId: string | null) {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingTool, setStreamingTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Lets the user stop an in-flight response (the composer's stop button).
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const initMessages = useCallback((initial: AiMessage[]) => {
    setMessages(initial.map((m) => ({ ...m, isStreaming: false })));
  }, []);

  const sendMessage = useCallback(
    async (content: string, explicitSessionId?: string) => {
      // explicitSessionId lets the caller stream into a session it just created
      // (lazy creation) without waiting for the sessionId prop to update.
      const targetSessionId = explicitSessionId ?? sessionId;
      if (!targetSessionId || isStreaming) return;
      setError(null);

      const userMsg: StreamingMessage = {
        id: `optimistic-user-${Date.now()}`,
        session_id: targetSessionId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        isStreaming: false,
      };
      const assistantPlaceholderId = `streaming-${Date.now()}`;
      const assistantMsg: StreamingMessage = {
        id: assistantPlaceholderId,
        session_id: targetSessionId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        for await (const event of streamChat(targetSessionId, content, {
          signal: controller.signal,
        })) {
          if (event.type === "token") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: (m.content ?? "") + event.v }
                  : m,
              ),
            );
          } else if (event.type === "tool") {
            setStreamingTool(event.name.replace(/_/g, " "));
          } else if (event.type === "done") {
            setStreamingTool(null);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, id: event.message_id, isStreaming: false }
                  : m,
              ),
            );
          } else if (event.type === "error") {
            setStreamingTool(null);
            setError(event.detail);
            setMessages((prev) =>
              prev.filter(
                (m) =>
                  m.id !== assistantPlaceholderId &&
                  m.id !== userMsg.id,
              ),
            );
          }
        }
      } catch (err) {
        setStreamingTool(null);
        // User-initiated stop: keep whatever streamed so far, no error banner.
        if (err instanceof DOMException && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, isStreaming: false }
                : m,
            ),
          );
        } else {
          setError("Connection error. Please try again.");
          setMessages((prev) =>
            prev.filter(
              (m) =>
                m.id !== assistantPlaceholderId && m.id !== userMsg.id,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        // Refresh the sessions list so the backend's auto-generated title (set
        // from the first message) shows up in the History sidebar.
        queryClient.invalidateQueries({ queryKey: AI_SESSION_KEYS.list() });
      }
    },
    [sessionId, isStreaming, queryClient],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    isStreaming,
    streamingTool,
    error,
    sendMessage,
    stop,
    initMessages,
    clearError,
  };
}
