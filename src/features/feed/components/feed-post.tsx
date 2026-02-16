"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";

export interface PostData {
  id: string;
  type: "signal" | "educational" | "text" | "tweet";
  streamName: string;
  streamAvatar: string;
  timestamp: string;
  content: string;
  tags?: string[];
  signalData?: {
    pair: string;
    action: "BUY" | "SELL";
    entry: string;
    sl: string;
    tp: string;
    result?: string;
  };
  tweetData?: {
    originalAuthor: string;
    handle: string;
  };
  likes: number;
  comments: number;
}

interface FeedPostProps {
  post: PostData;
}

export function FeedPost({ post }: FeedPostProps) {
  return (
    <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-4 md:p-5 mb-4 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Link href={`/stream/${post.id}`}>
            <img
              src={post.streamAvatar}
              alt={post.streamName}
              className="h-10 w-10 rounded-full object-cover border border-border-primary cursor-pointer"
            />
          </Link>
          <div className="ml-3">
            <Link
              href={`/stream/${post.id}`}
              className="text-sm font-bold text-text-primary leading-none hover:text-accent cursor-pointer"
            >
              {post.streamName}
            </Link>
            <div className="flex items-center mt-1 space-x-2 text-xs text-text-secondary">
              <span>{post.timestamp}</span>
              {post.tags && (
                <>
                  <span>•</span>
                  <div className="flex space-x-1">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-accent font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="text-text-tertiary hover:text-text-secondary p-1 rounded-full hover:bg-bg-tertiary">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {post.type === "text" && (
          <p className="text-text-primary text-sm md:text-base leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        )}

        {post.type === "educational" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wide border border-indigo-500/20">
                Education
              </span>
            </div>
            <p className="text-text-primary text-sm md:text-base font-medium leading-relaxed">
              {post.content}
            </p>
          </div>
        )}

        {post.type === "signal" && post.signalData && (
          <div className="border border-border-primary rounded-xl overflow-hidden bg-bg-primary/50">
            <div className="p-3 border-b border-border-primary bg-card-bg flex justify-between items-center">
              <p className="text-sm text-text-secondary">{post.content}</p>
              {post.signalData.action === "BUY" ? (
                <span className="flex items-center text-success font-bold text-xs bg-success-light px-2 py-1 rounded-lg border border-success/20">
                  <TrendingUp className="h-3 w-3 mr-1" /> BUY{" "}
                  {post.signalData.pair}
                </span>
              ) : (
                <span className="flex items-center text-danger font-bold text-xs bg-danger-light px-2 py-1 rounded-lg border border-danger/20">
                  <TrendingDown className="h-3 w-3 mr-1" /> SELL{" "}
                  {post.signalData.pair}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 divide-x divide-border-primary bg-card-bg">
              <div className="p-3 text-center">
                <span className="block text-[10px] uppercase text-text-tertiary font-semibold tracking-wider">
                  Entry
                </span>
                <span className="block text-sm font-bold text-text-primary">
                  {post.signalData.entry}
                </span>
              </div>
              <div className="p-3 text-center bg-danger-light/30">
                <span className="block text-[10px] uppercase text-danger font-semibold tracking-wider">
                  Stop Loss
                </span>
                <span className="block text-sm font-bold text-danger">
                  {post.signalData.sl}
                </span>
              </div>
              <div className="p-3 text-center bg-success-light/30">
                <span className="block text-[10px] uppercase text-success font-semibold tracking-wider">
                  Take Profit
                </span>
                <span className="block text-sm font-bold text-success">
                  {post.signalData.tp}
                </span>
              </div>
            </div>
          </div>
        )}

        {post.type === "tweet" && post.tweetData && (
          <div className="mt-2 p-3 md:p-4 rounded-xl border border-border-secondary bg-card-bg hover:bg-card-bg-hover transition-colors cursor-pointer group">
            <div className="flex items-center mb-2">
              <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center mr-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 text-black fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-text-primary mr-1">
                {post.tweetData.originalAuthor}
              </span>
              <span className="text-xs text-text-secondary">
                {post.tweetData.handle}
              </span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed">
              {post.content}
            </p>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border-primary">
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-1.5 text-text-tertiary hover:text-danger transition-colors group">
            <Heart className="h-5 w-5 group-hover:fill-current" />
            <span className="text-xs font-medium group-hover:text-danger">
              {post.likes}
            </span>
          </button>
          <button className="flex items-center space-x-1.5 text-text-tertiary hover:text-info transition-colors group">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-medium group-hover:text-info">
              {post.comments}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/stream/${post.id}`}
            className="text-xs font-semibold text-accent hover:text-accent-hover px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors"
          >
            Open Stream
          </Link>
          {post.type === "tweet" && (
            <button className="text-text-tertiary hover:text-text-secondary">
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
