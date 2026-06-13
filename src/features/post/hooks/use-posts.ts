import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { postApi, PostItem, PostListResponse } from "../api/post.api";
import { queryKeys } from "@/lib/api/query-keys";

// ---------------------------------------------------------------------------
// Get a single post
// ---------------------------------------------------------------------------

export const usePost = (postId: string | undefined) => {
  const { data: session, status } = useSession();

  return useQuery<PostItem>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postApi.getPost(postId!, session?.accessToken as string),
    enabled: status === "authenticated" && !!postId,
  });
};

// ---------------------------------------------------------------------------
// List posts in a stream — infinite scroll with cursor pagination
// ---------------------------------------------------------------------------

export const useStreamPosts = (streamId: string | undefined) => {
  const { data: session, status } = useSession();

  return useInfiniteQuery<PostListResponse>({
    queryKey: queryKeys.posts.streamPosts(streamId),
    queryFn: ({ pageParam }) =>
      postApi.listStreamPosts(
        streamId!,
        session?.accessToken as string,
        pageParam as string | null,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: status === "authenticated" && !!streamId,
    staleTime: 30_000, // 30s — posts stay fresh for quick back-nav
  });
};

// ---------------------------------------------------------------------------
// List current user's posts across all streams
// ---------------------------------------------------------------------------

export const useMyPosts = () => {
  const { data: session, status } = useSession();

  return useInfiniteQuery<PostListResponse>({
    queryKey: queryKeys.posts.mine(),
    queryFn: ({ pageParam }) =>
      postApi.listMyPosts(
        session?.accessToken as string,
        pageParam as string | null,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: status === "authenticated",
    staleTime: 30_000,
  });
};

// ---------------------------------------------------------------------------
// List replies for a post — infinite scroll with cursor pagination
// ---------------------------------------------------------------------------

export const useReplies = (postId: string | undefined, enabled = true) => {
  const { data: session, status } = useSession();

  return useInfiniteQuery<PostListResponse>({
    queryKey: queryKeys.posts.replies(postId),
    queryFn: ({ pageParam }) =>
      postApi.listReplies(
        postId!,
        session?.accessToken as string,
        pageParam as string | null,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled:
      enabled &&
      status === "authenticated" &&
      !!session?.accessToken &&
      !!postId,
    staleTime: 30_000,
  });
};

// ---------------------------------------------------------------------------
// Create a post
// ---------------------------------------------------------------------------

export const useCreatePost = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      streamId,
      type,
      content,
      media,
      mediaStoragePath,
      mediaType,
      mediaMimeType,
      mediaFilename,
    }: {
      streamId: string;
      type: string;
      content: string;
      media?: File;
      mediaStoragePath?: string;
      mediaType?: string;
      mediaMimeType?: string;
      mediaFilename?: string;
    }) =>
      postApi.createPost(
        streamId,
        {
          type,
          content,
          media,
          mediaStoragePath,
          mediaType,
          mediaMimeType,
          mediaFilename,
        },
        session?.accessToken as string,
      ),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.streamPosts(variables.streamId),
      });

      const previousStreamPosts = queryClient.getQueryData<
        InfiniteData<PostListResponse>
      >(queryKeys.posts.streamPosts(variables.streamId));

      const previousMyPosts = queryClient.getQueryData<
        InfiniteData<PostListResponse>
      >(queryKeys.posts.mine());

      const optimisticPost: PostItem = {
        id: `temp-${Date.now()}`,
        stream_id: variables.streamId,
        author_id: session?.user.id ?? "",
        type: variables.type as PostItem["type"],
        content: variables.content || null,
        trade_data: null,
        parent_post_id: null,
        is_deleted: false,
        is_parent_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          id: session?.user.id ?? "",
          username: session?.user.username ?? "you",
          avatar_url: session?.user.avatarUrl ?? null,
        },
        media: null,
        reply_count: 0,
        upvote_count: 0,
        has_upvoted: false,
      };

      if (previousStreamPosts) {
        queryClient.setQueryData<InfiniteData<PostListResponse>>(
          queryKeys.posts.streamPosts(variables.streamId),
          {
            pageParams: previousStreamPosts.pageParams,
            pages: previousStreamPosts.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    items: [optimisticPost, ...page.items],
                  }
                : page,
            ),
          },
        );
      }

      if (previousMyPosts) {
        queryClient.setQueryData<InfiniteData<PostListResponse>>(
          queryKeys.posts.mine(),
          {
          pageParams: previousMyPosts.pageParams,
          pages: previousMyPosts.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  items: [optimisticPost, ...page.items],
                }
              : page,
          ),
          },
        );
      }

      return { previousStreamPosts, previousMyPosts };
    },
    onError: (_err, variables, context) => {
      if (context?.previousStreamPosts) {
        queryClient.setQueryData(
          queryKeys.posts.streamPosts(variables.streamId),
          context.previousStreamPosts,
        );
      }
      if (context?.previousMyPosts) {
        queryClient.setQueryData(
          queryKeys.posts.mine(),
          context.previousMyPosts,
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.streamPosts(variables.streamId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.mine() });
    },
  });
};

// ---------------------------------------------------------------------------
// Toggle upvote
// ---------------------------------------------------------------------------

export const useToggleUpvote = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      hasUpvoted,
    }: {
      postId: string;
      hasUpvoted: boolean;
    }) =>
      postApi.toggleUpvote(postId, hasUpvoted, session?.accessToken as string),
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.streamPostsRoot(),
      });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.mine() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(postId),
      });

      // The real cache keys are ["stream-posts", streamId] — getQueryData needs an
      // exact match and would always return undefined here, so snapshot with
      // getQueriesData (prefix match → [key, data] pairs) and restore per-key (P1-9).
      const previousStreamPosts = queryClient.getQueriesData<
        InfiniteData<PostListResponse>
      >({ queryKey: queryKeys.posts.streamPostsRoot() });

      const previousMyPosts = queryClient.getQueryData<
        InfiniteData<PostListResponse>
      >(queryKeys.posts.mine());

      const previousPost = queryClient.getQueryData<PostItem>(
        queryKeys.posts.detail(postId),
      );

      const togglePost = (post: PostItem) => {
        const wasUpvoted = post.has_upvoted;
        const nextCount = Math.max(
          0,
          post.upvote_count + (wasUpvoted ? -1 : 1),
        );
        return {
          ...post,
          has_upvoted: !wasUpvoted,
          upvote_count: nextCount,
        };
      };

      queryClient.setQueriesData<InfiniteData<PostListResponse>>(
        { queryKey: queryKeys.posts.streamPostsRoot() },
        (data) => {
          if (!data) return data;
          return {
            pageParams: data.pageParams,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === postId ? togglePost(item) : item,
              ),
            })),
          };
        },
      );

      queryClient.setQueriesData<InfiniteData<PostListResponse>>(
        { queryKey: queryKeys.posts.mine() },
        (data) => {
          if (!data) return data;
          return {
            pageParams: data.pageParams,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === postId ? togglePost(item) : item,
              ),
            })),
          };
        },
      );

      if (previousPost) {
        queryClient.setQueryData<PostItem>(
          queryKeys.posts.detail(postId),
          togglePost(previousPost),
        );
      }

      return { previousStreamPosts, previousMyPosts, previousPost };
    },
    onError: (_err, { postId }, context) => {
      for (const [key, data] of context?.previousStreamPosts ?? []) {
        queryClient.setQueryData(key, data);
      }
      if (context?.previousMyPosts) {
        queryClient.setQueryData(
          queryKeys.posts.mine(),
          context.previousMyPosts,
        );
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          queryKeys.posts.detail(postId),
          context.previousPost,
        );
      }
    },
    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.streamPostsRoot(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.mine() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
    },
  });
};

// ---------------------------------------------------------------------------
// Delete post
// ---------------------------------------------------------------------------

export const useDeletePost = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      postApi.deletePost(postId, session?.accessToken as string),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.streamPostsRoot(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.mine() });
      // Drop the now-deleted post's detail + replies so those pages don't keep
      // rendering it (P2-13).
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.removeQueries({ queryKey: queryKeys.posts.replies(postId) });
    },
  });
};

// ---------------------------------------------------------------------------
// Upload post media (pre-upload before creating post)
// ---------------------------------------------------------------------------

export const useUploadPostMedia = () => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (file: File) =>
      postApi.uploadPostMedia(file, session?.accessToken as string),
  });
};

// ---------------------------------------------------------------------------
// Create a reply to a post
// ---------------------------------------------------------------------------

export const useCreateReply = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      type,
      content,
      media,
      mediaStoragePath,
      mediaType,
      mediaMimeType,
      mediaFilename,
    }: {
      postId: string;
      type: string;
      content: string;
      media?: File;
      mediaStoragePath?: string;
      mediaType?: string;
      mediaMimeType?: string;
      mediaFilename?: string;
    }) =>
      postApi.createReply(
        postId,
        {
          type,
          content,
          media,
          mediaStoragePath,
          mediaType,
          mediaMimeType,
          mediaFilename,
        },
        session?.accessToken as string,
      ),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.replies(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.streamPostsRoot(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.mine() });
    },
  });
};
