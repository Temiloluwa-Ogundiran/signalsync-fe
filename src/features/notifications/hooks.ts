import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { notificationsApi } from "./api";

const NOTIFICATION_KEYS = {
  list: () => ["notifications", "list"] as const,
  unread: () => ["notifications", "unread"] as const,
};

/** Notifications list (also carries unread_count). */
export function useNotifications(enabled = true) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(),
    queryFn: () => notificationsApi.list(session?.accessToken),
    enabled: enabled && status === "authenticated" && !!session?.accessToken,
    staleTime: 30_000,
  });
}

/** Lightweight unread badge count — polled so the bell stays current. */
export function useUnreadCount() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread(),
    queryFn: () => notificationsApi.unreadCount(session?.accessToken),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      notificationsApi.markRead(id, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
    },
  });
}
