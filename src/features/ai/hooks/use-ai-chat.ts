import { useCallback, useState } from "react";
import { streamChat } from "../lib/sse";
import type { AiMessage, StreamingMessage } from "../types";

export function useAiChat(sessionId: string | null) {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingTool, setStreamingTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initMessages = useCallback((initial: AiMessage[]) => {
    setMessages(initial.map((m) => ({ ...m, isStreaming: false })));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isStreaming) return;
      setError(null);

      const userMsg: StreamingMessage = {
        id: `optimistic-user-${Date.now()}`,
        session_id: sessionId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        isStreaming: false,
      };
      const assistantPlaceholderId = `streaming-${Date.now()}`;
      const assistantMsg: StreamingMessage = {
        id: assistantPlaceholderId,
        session_id: sessionId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        for await (const event of streamChat(sessionId, content)) {
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
      } catch {
        setStreamingTool(null);
        setError("Connection error. Please try again.");
        setMessages((prev) =>
          prev.filter(
            (m) =>
              m.id !== assistantPlaceholderId && m.id !== userMsg.id,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    isStreaming,
    streamingTool,
    error,
    sendMessage,
    initMessages,
    clearError,
  };
}
