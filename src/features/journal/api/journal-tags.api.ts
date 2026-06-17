import apiClient, { withAuth } from "@/lib/api/client";
import type { Tag, TagGroup } from "../types";

export const journalTagsApi = {
  // --- Config ---
  getConfig: async (token?: string): Promise<TagGroup[]> => {
    const { data } = await apiClient.get<TagGroup[]>(
      "/journal/tags/config",
      withAuth(token)
    );
    return data;
  },

  // --- Groups ---
  createGroup: async (name: string, token?: string): Promise<TagGroup> => {
    const { data } = await apiClient.post<TagGroup>(
      "/journal/tags/groups",
      { name },
      withAuth(token)
    );
    return data;
  },

  updateGroup: async (
    groupId: string,
    name: string,
    token?: string
  ): Promise<TagGroup> => {
    const { data } = await apiClient.put<TagGroup>(
      `/journal/tags/groups/${groupId}`,
      { name },
      withAuth(token)
    );
    return data;
  },

  deleteGroup: async (groupId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/journal/tags/groups/${groupId}`, withAuth(token));
  },

  reorderGroups: async (ids: string[], token?: string): Promise<void> => {
    await apiClient.put(
      "/journal/tags/groups/reorder",
      { ids },
      withAuth(token)
    );
  },

  // --- Tags ---
  createTag: async (
    groupId: string,
    name: string,
    color?: string,
    token?: string
  ): Promise<Tag> => {
    const { data } = await apiClient.post<Tag>(
      `/journal/tags/groups/${groupId}/tags`,
      { name, color: color || undefined },
      withAuth(token)
    );
    return data;
  },

  updateTag: async (
    tagId: string,
    payload: { name?: string; color?: string },
    token?: string
  ): Promise<Tag> => {
    const { data } = await apiClient.put<Tag>(
      `/journal/tags/${tagId}`,
      payload,
      withAuth(token)
    );
    return data;
  },

  deleteTag: async (tagId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/journal/tags/${tagId}`, withAuth(token));
  },

  reorderTags: async (ids: string[], token?: string): Promise<void> => {
    await apiClient.put("/journal/tags/reorder", { ids }, withAuth(token));
  },

  // --- Trade tags ---
  getTradeTags: async (tradeId: string, token?: string): Promise<Tag[]> => {
    const { data } = await apiClient.get<Tag[]>(
      `/journal/trades/${tradeId}/tags`,
      withAuth(token)
    );
    return data;
  },

  updateTradeTags: async (
    tradeId: string,
    tagIds: string[],
    token?: string
  ): Promise<Tag[]> => {
    const { data } = await apiClient.put<Tag[]>(
      `/journal/trades/${tradeId}/tags`,
      { tag_ids: tagIds },
      withAuth(token)
    );
    return data;
  },

  // --- Rating & assessment (separate feature, co-located on the same router) ---
  updateTradeRating: async (
    tradeId: string,
    rating: number,
    token?: string
  ): Promise<{ rating: number }> => {
    const { data } = await apiClient.put<{ rating: number }>(
      `/journal/trades/${tradeId}/rating`,
      { rating },
      withAuth(token)
    );
    return data;
  },

  updateTradeAssessment: async (
    tradeId: string,
    payload: {
      execution_quality?: number;
      setup_quality?: number;
      discipline_score?: number;
    },
    token?: string
  ): Promise<{
    execution_quality?: number;
    setup_quality?: number;
    discipline_score?: number;
  }> => {
    const { data } = await apiClient.put<{
      execution_quality?: number;
      setup_quality?: number;
      discipline_score?: number;
    }>(`/journal/trades/${tradeId}/assessment`, payload, withAuth(token));
    return data;
  },
};
