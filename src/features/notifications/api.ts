import apiClient, { withAuth } from "@/lib/api/client";
import type { NotificationListResponse } from "./types";

export const notificationsApi = {
  list: async (token?: string): Promise<NotificationListResponse> => {
    const { data } = await apiClient.get<NotificationListResponse>(
      "/notifications",
      withAuth(token)
    );
    return data;
  },

  unreadCount: async (token?: string): Promise<number> => {
    const { data } = await apiClient.get<{ unread_count: number }>(
      "/notifications/unread-count",
      withAuth(token)
    );
    return data.unread_count;
  },

  markRead: async (id: string, token?: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`, undefined, withAuth(token));
  },

  markAllRead: async (token?: string): Promise<void> => {
    await apiClient.put("/notifications/read-all", undefined, withAuth(token));
  },
};
