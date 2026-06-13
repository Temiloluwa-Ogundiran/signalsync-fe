import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { aiApi } from "../api/ai.api";

export const AI_SESSION_KEYS = {
  all: ["ai-sessions"] as const,
  list: () => ["ai-sessions", "list"] as const,
  detail: (id: string) => ["ai-sessions", "detail", id] as const,
};

export function useAiSessions() {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: AI_SESSION_KEYS.list(),
    queryFn: () => aiApi.listSessions(session?.accessToken),
    enabled: status === "authenticated",
    select: (data) => data.items,
  });
}

export function useAiSession(sessionId: string | null) {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: AI_SESSION_KEYS.detail(sessionId!),
    queryFn: () => aiApi.getSession(sessionId!, session?.accessToken),
    enabled: status === "authenticated" && !!sessionId,
  });
}

export function useCreateAiSession() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title?: string; context_type?: string; account_id?: string }) =>
      aiApi.createSession(payload, session?.accessToken),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: AI_SESSION_KEYS.all }),
  });
}

export function useDeleteAiSession() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      aiApi.deleteSession(sessionId, session?.accessToken),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: AI_SESSION_KEYS.all }),
  });
}
