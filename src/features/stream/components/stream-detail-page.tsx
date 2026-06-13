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
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useStreamById,
  useFollowStream,
  useUnfollowStream,
} from "@/features/stream/hooks/use-streams";
import { useStreamStore } from "@/features/stream/store";
import { useStreamPosts } from "@/features/post/hooks/use-posts";
import type { StreamDetail } from "@/features/stream/api/stream.api";
import { StreamPostCard } from "@/features/post/components/stream-post-card";
import { ComposeBox } from "@/features/post/components/compose-box";

export function StreamDetailPage() {
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
