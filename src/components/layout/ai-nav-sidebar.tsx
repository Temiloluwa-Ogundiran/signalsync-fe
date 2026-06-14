"use client";

import { useAiDockStore } from "@/features/ai/store/ai-dock-store";
import {
  useAiSessions,
  useCreateAiSession,
  useDeleteAiSession,
} from "@/features/ai/hooks/use-ai-sessions";
import { AiSessionSidebar } from "@/features/ai/components/ai-session-sidebar";
import { AppSwitcher } from "./nav-shared";
import type { NavApp } from "./nav-registry";

/**
 * Tier-2 contents for the Partna AI app: the app switcher header followed by the
 * chat session history. This replaces the AI page's own inline sidebar so the
 * rail + this panel form one unified nav (no duplicate "Partna AI" header).
 */
export function AiNavSidebar({
  app,
  apps,
}: {
  app: NavApp;
  apps: NavApp[];
}) {
  const { activeSessionId, setActiveSessionId } = useAiDockStore();
  const { data: sessions = [] } = useAiSessions();
  const { mutateAsync: createSession } = useCreateAiSession();
  const { mutate: deleteSession } = useDeleteAiSession();

  const handleNew = async () => {
    try {
      const s = await createSession({ title: "New chat" });
      setActiveSessionId(s.id);
    } catch {
      /* ignore */
    }
  };

  const handleSelect = (id: string) => setActiveSessionId(id);

  const handleDelete = (id: string) => {
    deleteSession(id);
    if (id === activeSessionId) setActiveSessionId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 pb-1">
        <AppSwitcher app={app} apps={apps} />
      </div>
      <div className="min-h-0 flex-1">
        <AiSessionSidebar
          sessions={sessions.filter((s) => !s.is_deleted)}
          activeSessionId={activeSessionId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
