import apiClient, { withAuth } from "@/lib/api/client";
import type { TagCategory, TagOption } from "../types";

export const journalTagsApi = {
  getConfig: async (token?: string): Promise<TagCategory[]> => {
    const { data } = await apiClient.get<TagCategory[]>(
      "/journal/tags/config",
      withAuth(token)
    );
    return data;
  },

  createCategory: async (title: string, token?: string): Promise<TagCategory> => {
    const { data } = await apiClient.post<TagCategory>(
      "/journal/tags/categories",
      { title },
      withAuth(token)
    );
    return data;
  },

  deleteCategory: async (categoryId: string, token?: string): Promise<void> => {
    await apiClient.delete(
      `/journal/tags/categories/${categoryId}`,
      withAuth(token)
    );
  },

  createOption: async (
    categoryId: string,
    value: string,
    color?: string,
    token?: string
  ): Promise<TagOption> => {
    const { data } = await apiClient.post<TagOption>(
      `/journal/tags/categories/${categoryId}/options`,
      { value, color: color || undefined },
      withAuth(token)
    );
    return data;
  },

  deleteOption: async (optionId: string, token?: string): Promise<void> => {
    await apiClient.delete(
      `/journal/tags/options/${optionId}`,
      withAuth(token)
    );
  },

  getTradeTags: async (tradeId: string, token?: string): Promise<TagOption[]> => {
    const { data } = await apiClient.get<TagOption[]>(
      `/journal/trades/${tradeId}/tags`,
      withAuth(token)
    );
    return data;
  },

  updateTradeTags: async (
    tradeId: string,
    optionIds: string[],
    token?: string
  ): Promise<TagOption[]> => {
    const { data } = await apiClient.put<TagOption[]>(
      `/journal/trades/${tradeId}/tags`,
      { option_ids: optionIds },
      withAuth(token)
    );
    return data;
  },

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
    }>(
      `/journal/trades/${tradeId}/assessment`,
      payload,
      withAuth(token)
    );
    return data;
  },
};
