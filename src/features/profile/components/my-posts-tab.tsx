"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useMyStreams } from "@/features/stream/hooks/use-streams";
import { useStreamPosts, useMyPosts } from "@/features/post/hooks/use-posts";
import { PostCard } from "./post-card";

export function MyPostsTab() {
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
