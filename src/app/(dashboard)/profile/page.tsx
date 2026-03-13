"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Radio,
  Users,
  Globe,
  Lock,
  DollarSign,
  Loader2,
  ChevronUp,
  MessageCircle,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMyStreams,
  useDiscoverStreams,
  useUnfollowStream,
} from "@/features/stream/hooks/use-streams";
import {
  useStreamPosts,
  useToggleUpvote,
  useMyPosts,
} from "@/features/post/hooks/use-posts";
import type {
  Stream,
  StreamDiscoverItem,
} from "@/features/stream/api/stream.api";
import type { PostItem } from "@/features/post/api/post.api";

// ---------------------------------------------------------------------------
// Helpers
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

type Tab = "streams" | "posts" | "following";

// ---------------------------------------------------------------------------
// Post card (reusable mini component)
// ---------------------------------------------------------------------------

function PostCard({ post }: { post: PostItem }) {
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

// ---------------------------------------------------------------------------
// My Streams tab
// ---------------------------------------------------------------------------

function MyStreamsTab() {
  const { data: streams, isLoading } = useMyStreams();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!streams || streams.length === 0) {
    return (
      <p className="text-center text-text-tertiary py-16 text-sm">
        You haven&apos;t created any streams yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {streams.map((stream) => (
        <Link
          key={stream.id}
          href={`/stream/${stream.id}`}
          className="bg-card-bg border border-border-primary rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
        >
          <div className="h-20 bg-linear-to-br from-bg-tertiary to-bg-secondary relative overflow-hidden">
            {stream.banner_url && (
              <img
                src={stream.banner_url}
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
            )}
          </div>
          <div className="p-4 -mt-6 relative">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center overflow-hidden border-2 border-card-bg shadow-sm mb-2">
              {stream.avatar_url ? (
                <img
                  src={stream.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Radio className="w-4 h-4 text-white" />
              )}
            </div>
            <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">
              {stream.name}
            </h3>
            {stream.description && (
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                {stream.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
              {stream.privacy === "public" ? (
                <Globe className="h-3 w-3" />
              ) : stream.privacy === "private" ? (
                <Lock className="h-3 w-3" />
              ) : (
                <DollarSign className="h-3 w-3" />
              )}
              <span className="capitalize">{stream.privacy}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// My Posts tab — with stream filter
// ---------------------------------------------------------------------------

function MyPostsTab() {
  const { data: streams } = useMyStreams();
  const [filterStreamId, setFilterStreamId] = useState<string | "all">("all");

  // Specific stream query (cursor-paginated)
  const targetStreamId = filterStreamId !== "all" ? filterStreamId : undefined;

  const {
    data: postsData,
    isLoading: isSingleLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useStreamPosts(targetStreamId);

  const {
    data: myPostsData,
    isLoading: isAllLoading,
    hasNextPage: hasMyPostsNext,
    fetchNextPage: fetchMyPostsNext,
    isFetchingNextPage: isFetchingMyPostsNext,
  } = useMyPosts();

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries[0]?.isIntersecting) return;
      if (filterStreamId === "all") {
        if (hasMyPostsNext && !isFetchingMyPostsNext) {
          fetchMyPostsNext();
        }
      } else if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [
      filterStreamId,
      hasMyPostsNext,
      isFetchingMyPostsNext,
      fetchMyPostsNext,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(handleScroll, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleScroll]);

  const allPosts =
    filterStreamId === "all"
      ? (myPostsData?.pages.flatMap((p) => p.items) ?? [])
      : (postsData?.pages.flatMap((p) => p.items) ?? []);

  const isLoading = filterStreamId === "all" ? isAllLoading : isSingleLoading;

  return (
    <div>
      {/* Stream filter bar */}
      {streams && streams.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterStreamId("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filterStreamId === "all"
                ? "bg-accent text-white"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            All
          </button>
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStreamId(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filterStreamId === s.id
                  ? "bg-accent text-white"
                  : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : allPosts.length === 0 ? (
        <p className="text-center text-text-tertiary py-16 text-sm">
          No posts yet.
        </p>
      ) : (
        <div className="space-y-3">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <div ref={sentinelRef} className="h-4" />
          {filterStreamId === "all" && isFetchingMyPostsNext && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            </div>
          )}
          {filterStreamId !== "all" && isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Following tab
// ---------------------------------------------------------------------------

function FollowingTab() {
  const { data: discoverStreams, isLoading } = useDiscoverStreams();
  const unfollow = useUnfollowStream();

  const following = discoverStreams?.filter((s) => s.is_following) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <p className="text-center text-text-tertiary py-16 text-sm">
        You&apos;re not following any streams yet. Discover streams to follow!
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {following.map((stream) => (
        <Link
          key={stream.id}
          href={`/stream/${stream.id}`}
          className="bg-card-bg border border-border-primary rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="h-20 bg-linear-to-br from-bg-tertiary to-bg-secondary relative overflow-hidden">
            {stream.banner_url && (
              <img
                src={stream.banner_url}
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
            )}
          </div>
          <div className="p-4 -mt-6 relative">
            <div className="flex items-end justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center overflow-hidden border-2 border-card-bg shadow-sm">
                {stream.avatar_url ? (
                  <img
                    src={stream.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Radio className="w-4 h-4 text-white" />
                )}
              </div>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    await unfollow.mutateAsync(stream.id);
                    toast.success(`Unfollowed "${stream.name}"`);
                  } catch {
                    toast.error("Failed to unfollow");
                  }
                }}
                disabled={unfollow.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 rounded-full transition-colors"
              >
                <UserMinus className="h-3 w-3" />
                Unfollow
              </button>
            </div>
            <h3 className="text-sm font-bold text-text-primary truncate mt-2 hover:text-accent transition-colors">
              {stream.name}
            </h3>
            {stream.description && (
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                {stream.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stream.follower_count} followers
              </span>
              {stream.owner_display_name && (
                <span>by {stream.owner_display_name}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("streams");

  const user = session?.user;
  const displayName = user?.displayName || user?.username || "User";

  const tabs: { key: Tab; label: string }[] = [
    { key: "streams", label: "My Streams" },
    { key: "posts", label: "My Posts" },
    { key: "following", label: "Following" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-accent to-blue-400 p-0.5 shrink-0">
          <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-accent">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
          <p className="text-sm text-text-tertiary">@{user?.username}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-primary mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${
              tab === t.key
                ? "text-accent"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "streams" && <MyStreamsTab />}
      {tab === "posts" && <MyPostsTab />}
      {tab === "following" && <FollowingTab />}
    </div>
  );
}
