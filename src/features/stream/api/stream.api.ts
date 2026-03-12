import apiClient, { withAuth } from "@/lib/api/client";

export interface StreamDiscoverItem {
  id: string;
  name: string;
  description: string | null;
  privacy: "public" | "private";
  tags: string[] | null;
  avatar_url: string | null;
  banner_url: string | null;
  owner_display_name: string | null;
  follower_count: number;
  created_at: string;
}

export interface Stream {
  id: string;
  name: string;
  description: string | null;
  privacy: "public" | "private";
  is_default: boolean;
  avatar_url: string | null;
  banner_url: string | null;
  price: number | null;
}

export const streamApi = {
  getMyStreams: async (token?: string): Promise<Stream[]> => {
    const { data } = await apiClient.get<Stream[]>("/streams/mine", withAuth(token));
    return data;
  },
  discoverStreams: async (token?: string, skip = 0, limit = 20): Promise<StreamDiscoverItem[]> => {
    const { data } = await apiClient.get<StreamDiscoverItem[]>(
      `/streams/discover?skip=${skip}&limit=${limit}`,
      withAuth(token)
    );
    return data;
  },
};
