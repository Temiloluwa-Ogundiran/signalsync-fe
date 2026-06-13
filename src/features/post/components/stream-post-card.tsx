"use client";

import { useState } from "react";
import { ChevronUp, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useToggleUpvote,
  useReplies,
  useCreateReply,
} from "@/features/post/hooks/use-posts";
import type { PostItem } from "@/features/post/api/post.api";

export function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: string }).message;
    if (msg) return msg;
  }
  return "Something went wrong.";
}

export function timeAgo(dateStr: string): string {
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

export function StreamPostCard({ post }: { post: PostItem }) {
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
