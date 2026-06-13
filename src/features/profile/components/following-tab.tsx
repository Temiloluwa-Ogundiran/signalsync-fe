"use client";

import Link from "next/link";
import { Radio, Users, UserMinus, Globe, Lock, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDiscoverStreams, useUnfollowStream } from "@/features/stream/hooks/use-streams";
import type { Stream, StreamDiscoverItem } from "@/features/stream/api/stream.api";

export function FollowingTab() {
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
