import apiClient, { withAuth } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types — mirrors backend PostResponse / PostListResponse
// ---------------------------------------------------------------------------

export interface PostAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface PostMedia {
  id: string;
  url: string;
  url_expires_at: string;
  media_type: "image" | "video" | "document";
  mime_type: string;
  original_filename: string | null;
}

export interface PostItem {
  id: string;
  stream_id: string;
  author_id: string;
  type: "signal" | "text" | "education";
  content: string | null;
  trade_data: Record<string, unknown> | null;
  parent_post_id: string | null;
  is_deleted: boolean;
  is_parent_deleted: boolean;
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  media: PostMedia | null;
  reply_count: number;
  upvote_count: number;
  has_upvoted: boolean;
}

export interface PostListResponse {
  items: PostItem[];
  next_cursor: string | null;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

export interface MediaUploadResult {
  storage_path: string;
  media_type: string;
  mime_type: string;
}

export const postApi = {
  /**
   * Pre-upload media for a post. Returns a storage path to attach when creating the post.
   */
  uploadPostMedia: async (
    file: File,
    token?: string,
  ): Promise<MediaUploadResult> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<MediaUploadResult>(
      "/uploads/media",
      form,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": undefined,
        },
      },
    );
    return data;
  },

  /**
   * List top-level posts in a stream (newest first, cursor-paginated).
   */
  listStreamPosts: async (
    streamId: string,
    token?: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PostListResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const { data } = await apiClient.get<PostListResponse>(
      `/streams/${streamId}/posts?${params}`,
      withAuth(token),
    );
    return data;
  },

  /**
   * List current user's posts across streams (newest first, cursor-paginated).
   */
  listMyPosts: async (
    token?: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PostListResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const { data } = await apiClient.get<PostListResponse>(
      `/posts/mine?${params}`,
      withAuth(token),
    );
    return data;
  },

  /**
   * Create a text post in a stream.
   * Supports either inline file upload (media) or pre-uploaded path (mediaStoragePath).
   */
  createPost: async (
    streamId: string,
    payload: {
      type: string;
      content: string;
      media?: File;
      mediaStoragePath?: string;
      mediaType?: string;
      mediaMimeType?: string;
      mediaFilename?: string;
    },
    token?: string,
  ): Promise<PostItem> => {
    const form = new FormData();
    form.append("type", payload.type);
    if (payload.content) form.append("content", payload.content);
    if (payload.mediaStoragePath) {
      form.append("media_storage_path", payload.mediaStoragePath);
      if (payload.mediaType) form.append("media_type", payload.mediaType);
      if (payload.mediaMimeType)
        form.append("media_mime_type", payload.mediaMimeType);
      if (payload.mediaFilename)
        form.append("media_filename", payload.mediaFilename);
    } else if (payload.media) {
      form.append("media", payload.media);
    }

    const { data } = await apiClient.post<PostItem>(
      `/streams/${streamId}/posts`,
      form,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": undefined,
        },
      },
    );
    return data;
  },

  /**
   * List replies to a post (oldest first, cursor-paginated).
   */
  listReplies: async (
    postId: string,
    token?: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PostListResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const { data } = await apiClient.get<PostListResponse>(
      `/posts/${postId}/replies?${params}`,
      withAuth(token),
    );
    return data;
  },

  /**
   * Create a reply to a post.
   * Supports either inline file upload (media) or pre-uploaded path (mediaStoragePath).
   */
  createReply: async (
    postId: string,
    payload: {
      type: string;
      content: string;
      media?: File;
      mediaStoragePath?: string;
      mediaType?: string;
      mediaMimeType?: string;
      mediaFilename?: string;
    },
    token?: string,
  ): Promise<PostItem> => {
    const form = new FormData();
    form.append("type", payload.type);
    if (payload.content) form.append("content", payload.content);
    if (payload.mediaStoragePath) {
      form.append("media_storage_path", payload.mediaStoragePath);
      if (payload.mediaType) form.append("media_type", payload.mediaType);
      if (payload.mediaMimeType)
        form.append("media_mime_type", payload.mediaMimeType);
      if (payload.mediaFilename)
        form.append("media_filename", payload.mediaFilename);
    } else if (payload.media) {
      form.append("media", payload.media);
    }

    const { data } = await apiClient.post<PostItem>(
      `/posts/${postId}/replies`,
      form,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": undefined,
        },
      },
    );
    return data;
  },

  /**
   * Get a single post by ID.
   */
  getPost: async (postId: string, token?: string): Promise<PostItem> => {
    const { data } = await apiClient.get<PostItem>(
      `/posts/${postId}`,
      withAuth(token),
    );
    return data;
  },

  /**
   * Toggle upvote on a post.
   */
  upvotePost: async (postId: string, token?: string): Promise<PostItem> => {
    const { data } = await apiClient.put<PostItem>(
      `/posts/${postId}/upvote`,
      {},
      withAuth(token),
    );
    return data;
  },

  unupvotePost: async (postId: string, token?: string): Promise<PostItem> => {
    const { data } = await apiClient.delete<PostItem>(
      `/posts/${postId}/upvote`,
      withAuth(token),
    );
    return data;
  },

  toggleUpvote: async (
    postId: string,
    hasUpvoted: boolean,
    token?: string,
  ): Promise<PostItem> => {
    if (hasUpvoted) {
      return postApi.unupvotePost(postId, token);
    }
    return postApi.upvotePost(postId, token);
  },

  /**
   * Delete (soft-delete) a post.
   */
  deletePost: async (postId: string, token?: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`, withAuth(token));
  },
};
