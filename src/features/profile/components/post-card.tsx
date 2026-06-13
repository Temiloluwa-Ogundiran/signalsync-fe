"use client";

import Link from "next/link";
import { ChevronUp, MessageCircle } from "lucide-react";
import { useToggleUpvote } from "@/features/post/hooks/use-posts";
import type { PostItem } from "@/features/post/api/post.api";
import { timeAgo } from "../lib/time-ago";

export function PostCard({ post }: { post: PostItem }) {
  const toggleUpvote = useToggleUpvote();

  return (
    <div className="bg-card-bg border border-border-primary rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-accent">
              {post.author.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {post.author.username}
          </p>
          <p className="text-xs text-text-tertiary">
            {timeAgo(post.created_at)}
          </p>
        </div>
        <Link
          href={`/post/${post.id}`}
          className="text-xs text-accent font-medium hover:underline"
        >
          View
        </Link>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm text-text-primary leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.media && post.media.media_type === "image" && (
        <img
          src={post.media.url}
          alt=""
          className="w-full max-h-72 object-cover rounded-lg mb-3"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-text-tertiary text-xs">
        <button
          onClick={() =>
            toggleUpvote.mutate({
              postId: post.id,
              hasUpvoted: post.has_upvoted,
            })
          }
          className={`flex items-center gap-1 hover:text-accent transition-colors ${
            post.has_upvoted ? "text-accent" : ""
          }`}
        >
          <ChevronUp className="h-4 w-4" />
          {post.upvote_count}
        </button>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          {post.reply_count}
        </span>
      </div>
    </div>
  );
}
