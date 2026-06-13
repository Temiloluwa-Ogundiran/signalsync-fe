"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AiChatCore } from "./ai-chat-core";
import { AiSessionSidebar } from "./ai-session-sidebar";
import { useAiDockStore } from "../store/ai-dock-store";
import {
  useAiSession,
  useAiSessions,
  useCreateAiSession,
  useDeleteAiSession,
} from "../hooks/use-ai-sessions";

export function AiChatPage() {
  const { activeSessionId, setActiveSessionId } = useAiDockStore();
  const [localSessionId, setLocalSessionId] = useState<string | null>(
    activeSessionId,
  );

  const { data: sessions = [] } = useAiSessions();
  const { data: activeSessionData } = useAiSession(localSessionId);
  const { mutateAsync: createSession } = useCreateAiSession();
  const { mutate: deleteSession } = useDeleteAiSession();

  const handleNewChat = async () => {
    try {
      const s = await createSession({ title: "New chat" });
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

  // Auto-create session on first load if none
  useState(() => {
    if (!localSessionId) {
      createSession({ title: "New chat" }).then((s) => {
        setLocalSessionId(s.id);
        setActiveSessionId(s.id);
      }).catch(() => {});
    }
  });

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
            onNew={handleNewChat}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-w-0">
        <AiChatCore
          sessionId={localSessionId}
          initialMessages={activeSessionData?.messages}
          context={null}
        />
      </div>
    </div>
  );
}
