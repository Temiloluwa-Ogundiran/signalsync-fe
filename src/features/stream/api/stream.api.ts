import apiClient, { withAuth } from "@/lib/api/client";

export interface StreamDiscoverItem {
  id: string;
  name: string;
  description: string | null;
  privacy: "public" | "private" | "paid";
  tags: string[] | null;
  avatar_url: string | null;
  banner_url: string | null;
  owner_display_name: string | null;
  follower_count: number;
  is_following: boolean;
  membership_status: "active" | "pending" | "banned" | null;
  created_at: string;
}

export interface StreamDetail {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  privacy: "public" | "private" | "paid";
  forum_enabled: boolean;
  tags: string[] | null;
  price: number | null;
  avatar_url: string | null;
  banner_url: string | null;
  require_join_approval: boolean;
  is_default: boolean;
  created_at: string;
  owner_display_name: string | null;
  follower_count: number;
  is_following: boolean;
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

export interface StreamMemberResponse {
  user_id: string;
  stream_id: string;
  status: "active" | "pending" | "banned";
  joined_at: string;
}

export interface CreateStreamPayload {
  name: string;
  description?: string;
  privacy?: "public" | "private" | "paid";
  forum_enabled?: boolean;
  tags?: string[] | null;
  price?: number | null;
  require_join_approval?: boolean;
  avatar_url?: string | null;
  banner_url?: string | null;
}

export const streamApi = {
  getStream: async (streamId: string, token?: string): Promise<StreamDetail> => {
    const { data } = await apiClient.get<StreamDetail>(
      `/streams/${streamId}`,
      withAuth(token),
    );
    return data;
  },
  getMyStreams: async (token?: string): Promise<Stream[]> => {
    const { data } = await apiClient.get<Stream[]>(
      "/streams/mine",
      withAuth(token),
    );
    return data;
  },

  discoverStreams: async (
    token?: string,
    skip = 0,
    limit = 20,
  ): Promise<StreamDiscoverItem[]> => {
    const { data } = await apiClient.get<StreamDiscoverItem[]>(
      `/streams/discover?skip=${skip}&limit=${limit}`,
      withAuth(token),
    );
    return data;
  },

  followStream: async (
    streamId: string,
    token?: string,
  ): Promise<StreamMemberResponse> => {
    const { data } = await apiClient.post<StreamMemberResponse>(
      `/streams/${streamId}/follow`,
      {},
      withAuth(token),
    );
    return data;
  },

  unfollowStream: async (streamId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/streams/${streamId}/follow`, withAuth(token));
  },

  uploadImage: async (
    file: File,
    bucketType: "avatar" | "banner",
    token?: string,
  ): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    form.append("bucket_type", bucketType);
    const { data } = await apiClient.post<{ url: string }>(
      "/uploads/image",
      form,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": undefined, // let Axios set multipart/form-data boundary
        },
      },
    );
    return data;
  },

  createStream: async (
    payload: CreateStreamPayload,
    token?: string,
  ): Promise<Stream> => {
    const { data } = await apiClient.post<Stream>(
      "/streams",
      payload,
      withAuth(token),
    );
    return data;
  },
};
