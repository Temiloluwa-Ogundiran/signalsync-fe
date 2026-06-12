"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  DollarSign,
  Copy,
  Loader2,
  AlertCircle,
  UserPlus,
  UserMinus,
  ChevronUp,
  MessageCircle,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  useStreamById,
  useFollowStream,
  useUnfollowStream,
} from "@/features/stream/hooks/use-streams";
import { useStreamStore } from "@/features/stream/store";
import {
  useStreamPosts,
  useCreatePost,
  useToggleUpvote,
  useReplies,
  useCreateReply,
} from "@/features/post/hooks/use-posts";
import type { StreamDetail } from "@/features/stream/api/stream.api";
import type { PostItem } from "@/features/post/api/post.api";

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: string }).message;
    if (msg) return msg;
  }
  return "Something went wrong.";
}

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Single post card
// ---------------------------------------------------------------------------

function StreamPostCard({ post }: { post: PostItem }) {
  const upvoteMutation = useToggleUpvote();
  const createReply = useCreateReply();
  const [upvoted, setUpvoted] = useState(post.has_upvoted);
  const [upvoteCount, setUpvoteCount] = useState(post.upvote_count);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const {
    data: repliesData,
    isLoading: repliesLoading,
    hasNextPage: hasMoreReplies,
    fetchNextPage: fetchMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
  } = useReplies(post.id, showReplies);

  const replies = repliesData?.pages.flatMap((p) => p.items) ?? [];

  function handleUpvote() {
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);
    setUpvoteCount((c) => (wasUpvoted ? c - 1 : c + 1));
    upvoteMutation.mutate(
      { postId: post.id, hasUpvoted: wasUpvoted },
      {
        onError: () => {
          setUpvoted(wasUpvoted);
          setUpvoteCount((c) => (wasUpvoted ? c + 1 : c - 1));
        },
      },
    );
  }

  async function handleReplySubmit() {
    if (!replyContent.trim()) return;
    try {
      await createReply.mutateAsync({
        postId: post.id,
        type: "text",
        content: replyContent.trim(),
      });
      setReplyContent("");
      setShowReplies(true);
    } catch (err: unknown) {
      toast.error("Failed to post reply", {
        description: getErrorMessage(err),
      });
    }
  }

  if (post.is_deleted) {
    return (
      <div className="px-4 py-3 text-sm text-text-tertiary italic border-b border-border-primary">
        This post has been deleted.
      </div>
    );
  }

  return (
    <article className="px-4 py-4 border-b border-border-primary hover:bg-bg-tertiary/30 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shrink-0">
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-accent">
              {post.author.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-text-primary truncate">
              {post.author.username}
            </span>
            <span className="text-xs text-text-tertiary shrink-0">
              {timeAgo(post.created_at)}
            </span>
          </div>

          {post.content && (
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap wrap-break-word">
              {post.content}
            </p>
          )}

          {/* Media */}
          {post.media && post.media.media_type === "image" && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border-primary">
              <img
                src={post.media.url}
                alt="Post media"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={() => setShowReplies((prev) => !prev)}
              className={`flex items-center gap-1.5 transition-colors text-xs ${
                showReplies
                  ? "text-accent"
                  : "text-text-tertiary hover:text-accent"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.reply_count}</span>
            </button>
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                upvoted ? "text-accent" : "text-text-tertiary hover:text-accent"
              }`}
            >
              <ChevronUp
                className={`h-4 w-4 ${upvoted ? "fill-accent stroke-accent" : ""}`}
              />
              <span>{upvoteCount}</span>
            </button>
          </div>

          {showReplies && (
            <div className="mt-3 rounded-xl border border-border-primary bg-bg-secondary/40 p-3">
              <div className="mb-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full bg-transparent text-xs text-text-primary placeholder-text-tertiary resize-none focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleReplySubmit}
                    disabled={createReply.isPending || !replyContent.trim()}
                    className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {createReply.isPending ? "Replying..." : "Reply"}
                  </button>
                </div>
              </div>

              {repliesLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                </div>
              ) : replies.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-2">
                  No replies yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-lg border border-border-primary/70 bg-bg-primary/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-text-primary">
                          {reply.author.username}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      {reply.content && (
                        <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                          {reply.content}
                        </p>
                      )}
                    </div>
                  ))}

                  {hasMoreReplies && (
                    <div className="flex justify-center pt-1">
                      <button
                        onClick={() => fetchMoreReplies()}
                        disabled={isFetchingMoreReplies}
                        className="text-xs font-semibold text-accent hover:underline disabled:opacity-50"
                      >
                        {isFetchingMoreReplies
                          ? "Loading..."
                          : "Load more replies"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Inline compose box (Twitter-style)
// ---------------------------------------------------------------------------

function ComposeBox({ streamId }: { streamId: string }) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  function handleMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function removeMedia() {
    setMediaFile(null);
    setMediaPreview(null);
  }

  async function handleSubmit() {
    if (!content.trim() && !mediaFile) return;
    try {
      await createPost.mutateAsync({
        streamId,
        type: "text",
        content: content.trim(),
        media: mediaFile ?? undefined,
      });
      setContent("");
      removeMedia();
      toast.success("Post published");
    } catch (err: unknown) {
      toast.error("Failed to create post", {
        description: getErrorMessage(err),
      });
    }
  }

  return (
    <div className="px-4 py-3 border-b border-border-primary">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening in this stream?"
        rows={3}
        className="w-full bg-transparent text-sm text-text-primary placeholder-text-tertiary resize-none focus:outline-none"
      />
      {mediaPreview && (
        <div className="relative mt-2 inline-block">
          <img
            src={mediaPreview}
            alt="Attachment"
            className="max-h-40 rounded-lg border border-border-primary"
          />
          <button
            onClick={removeMedia}
            className="absolute -top-2 -right-2 bg-danger text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-text-tertiary hover:text-accent transition-colors"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleMedia}
        />
        <button
          onClick={handleSubmit}
          disabled={createPost.isPending || (!content.trim() && !mediaFile)}
          className="bg-accent text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {createPost.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stream detail page
// ---------------------------------------------------------------------------

export default function StreamDetailPage() {
  const { streamId } = useParams<{ streamId: string }>();
  const router = useRouter();
  const { setActiveStreamId } = useStreamStore();

  const { data: stream, isLoading: streamsLoading } = useStreamById(streamId);

  // Posts
  const {
    data: postsData,
    isLoading: postsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useStreamPosts(streamId);

  const posts = postsData?.pages.flatMap((p) => p.items) ?? [];

  // Follow state
  const [following, setFollowing] = useState(false);
  const [prevStreamId, setPrevStreamId] = useState<string | null>(null);
  const [prevStreamFollowing, setPrevStreamFollowing] = useState<boolean | null>(null);

  const followMutation = useFollowStream();
  const unfollowMutation = useUnfollowStream();

  if (stream && (stream.id !== prevStreamId || stream.is_following !== prevStreamFollowing)) {
    setPrevStreamId(stream.id);
    setPrevStreamFollowing(stream.is_following);
    setFollowing(stream.is_following);
  }

  // Set as active stream when viewing
  useEffect(() => {
    if (stream) {
      setActiveStreamId(stream.id);
    }
  }, [stream, setActiveStreamId]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  async function handleFollowToggle() {
    if (!stream) return;
    try {
      if (following) {
        await unfollowMutation.mutateAsync(stream.id);
        setFollowing(false);
        toast.success(`Unfollowed "${stream.name}"`);
      } else {
        const result = await followMutation.mutateAsync(stream.id);
        if (result.status === "pending") {
          toast.info("Join request sent");
        } else {
          setFollowing(true);
          toast.success(`Following "${stream.name}"`);
        }
      }
    } catch {
      toast.error("Action failed");
    }
  }

  // Loading state
  if (streamsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  // Not found
  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <AlertCircle className="h-12 w-12 text-danger mb-4 opacity-60" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Stream not found
        </h3>
        <p className="text-text-tertiary text-sm mb-4">
          This stream may have been deleted or you don&apos;t have access.
        </p>
        <button
          onClick={() => router.push("/discover")}
          className="text-accent text-sm font-bold hover:underline"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const isPrivate = stream.privacy === "private";
  const isPaid = stream.privacy === "paid";
  const followPending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back nav */}
      <div className="px-4 py-3 border-b border-border-primary sticky top-0 bg-bg-primary/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full hover:bg-bg-tertiary flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-text-primary" />
          </button>
          <div>
            <h1 className="text-base font-bold text-text-primary leading-tight">
              {stream.name}
            </h1>
            <p className="text-xs text-text-tertiary">{posts.length} posts</p>
          </div>
        </div>
      </div>

      {/* Banner + Header */}
      <div className="relative">
        <div className="h-36 bg-linear-to-br from-bg-tertiary to-bg-secondary overflow-hidden">
          {stream.banner_url && (
            <img
              src={stream.banner_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-20 h-20 rounded-xl border-4 border-bg-primary bg-accent/20 flex items-center justify-center overflow-hidden shadow-md">
            {stream.avatar_url ? (
              <img
                src={stream.avatar_url}
                alt={stream.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-accent">
                {stream.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isPaid ? (
            <span className="bg-yellow-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
              <DollarSign className="h-2.5 w-2.5" /> Paid
            </span>
          ) : isPrivate ? (
            <span className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Private
            </span>
          ) : (
            <span className="bg-black/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
              <Globe className="h-2.5 w-2.5" /> Public
            </span>
          )}
        </div>
      </div>

      {/* Stream info */}
      <div className="px-4 pt-12 pb-4 border-b border-border-primary">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {stream.name}
            </h2>
            {stream.owner_display_name && (
              <p className="text-sm text-text-tertiary">
                by {stream.owner_display_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFollowToggle}
              disabled={followPending}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                following
                  ? "bg-transparent border border-border-primary text-text-secondary hover:border-danger hover:text-danger"
                  : "bg-accent text-white hover:bg-accent-hover"
              } disabled:opacity-60`}
            >
              {followPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : following ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </button>
            <button className="px-4 py-2 rounded-full text-sm font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors flex items-center gap-1.5">
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        {stream.description && (
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {stream.description}
          </p>
        )}

        {/* Tags */}
        {stream.tags && stream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {stream.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-accent-light text-accent text-xs font-bold rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-tertiary">
            <strong className="text-text-primary font-bold">
              {stream.follower_count.toLocaleString()}
            </strong>{" "}
            Followers
          </span>
        </div>
      </div>

      {/* Compose */}
      <ComposeBox streamId={streamId!} />

      {/* Posts feed */}
      <div>
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 text-accent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <MessageCircle className="h-10 w-10 text-text-tertiary mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              No posts yet
            </h3>
            <p className="text-xs text-text-tertiary">
              Be the first to post in this stream.
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <StreamPostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 text-accent animate-spin" />
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <div className="text-center py-6 text-xs text-text-tertiary">
                You&apos;ve reached the end
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
