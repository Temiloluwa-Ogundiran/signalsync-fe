"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronUp,
  MessageCircle,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { useState } from "react";
import {
  usePost,
  useToggleUpvote,
  useReplies,
  useCreateReply,
} from "@/features/post/hooks/use-posts";
import type { PostItem } from "@/features/post/api/post.api";

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: string }).message;
    if (msg) return msg;
  }
  return "Something went wrong.";
}

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

export default function SinglePostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(params.postId);
  const toggleUpvote = useToggleUpvote();
  const createReply = useCreateReply();
  const [replyContent, setReplyContent] = useState("");

  const {
    data: repliesData,
    isLoading: repliesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useReplies(post?.id);

  const replies = repliesData?.pages.flatMap((p) => p.items) ?? [];

  async function handleReplySubmit() {
    if (!post || !replyContent.trim()) return;
    try {
      await createReply.mutateAsync({
        postId: post.id,
        type: "text",
        content: replyContent.trim(),
      });
      setReplyContent("");
    } catch (err: unknown) {
      const { toast } = await import("sonner");
      toast.error("Failed to post reply", {
        description: getErrorMessage(err),
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-danger" />
        </div>
        <p className="text-text-secondary text-sm">Post not found</p>
        <button
          onClick={() => router.back()}
          className="text-accent text-sm font-semibold hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-full bg-bg-tertiary hover:bg-bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Post</h1>
      </div>

      {/* Post card */}
      <div className="bg-card-bg border border-border-primary rounded-2xl overflow-hidden">
        {/* Author */}
        <div className="flex items-center gap-3 px-5 pt-5">
          <Link
            href={`/stream/${post.stream_id}`}
            className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shrink-0"
          >
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-accent">
                {post.author.username.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <div>
            <p className="text-sm font-bold text-text-primary">
              {post.author.username}
            </p>
            <p className="text-xs text-text-tertiary">
              {timeAgo(post.created_at)}
            </p>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="px-5 pt-4 text-text-primary leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Media */}
        {post.media && post.media.media_type === "image" && (
          <div className="mt-4 px-5">
            <img
              src={post.media.url}
              alt=""
              className="w-full rounded-xl border border-border-primary"
            />
          </div>
        )}

        {/* Trade data */}
        {post.trade_data && (
          <div className="mx-5 mt-4 p-3 bg-bg-tertiary rounded-xl border border-border-primary">
            <pre className="text-xs text-text-secondary overflow-x-auto">
              {JSON.stringify(post.trade_data, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 px-5 py-4 mt-2 border-t border-border-primary text-text-tertiary text-sm">
          <button
            onClick={() =>
              toggleUpvote.mutate({
                postId: post.id,
                hasUpvoted: post.has_upvoted,
              })
            }
            className={`flex items-center gap-1.5 hover:text-accent transition-colors ${
              post.has_upvoted ? "text-accent" : ""
            }`}
          >
            <ChevronUp className="h-5 w-5" />
            <span className="font-semibold">{post.upvote_count}</span>
            <span className="text-xs">upvotes</span>
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">{post.reply_count}</span>
            <span className="text-xs">replies</span>
          </span>
        </div>
      </div>

      {/* Replies */}
      <div className="mt-4 bg-card-bg border border-border-primary rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-primary flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">Replies</h2>
          <span className="text-xs text-text-tertiary">{post.reply_count}</span>
        </div>

        <div className="px-5 py-4 border-b border-border-primary">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-tertiary resize-none focus:outline-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleReplySubmit}
              disabled={createReply.isPending || !replyContent.trim()}
              className="bg-accent text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {createReply.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Reply
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          {repliesLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            </div>
          ) : replies.length === 0 ? (
            <p className="text-center text-xs text-text-tertiary py-8">
              No replies yet.
            </p>
          ) : (
            <div>
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="px-5 py-4 border-b border-border-primary/70 last:border-b-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary">
                      {reply.author.username}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {timeAgo(reply.created_at)}
                    </span>
                  </div>
                  {reply.content && (
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {reply.content}
                    </p>
                  )}
                </div>
              ))}

              {hasNextPage && (
                <div className="flex justify-center py-4 border-t border-border-primary/70">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-xs font-semibold text-accent hover:underline disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more replies"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stream link */}
      <div className="mt-4 text-center">
        <Link
          href={`/stream/${post.stream_id}`}
          className="text-xs text-accent font-semibold hover:underline"
        >
          View full stream &rarr;
        </Link>
      </div>
    </div>
  );
}
