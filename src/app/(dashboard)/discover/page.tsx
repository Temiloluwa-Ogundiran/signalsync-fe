"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Users,
  Copy,
  Plus,
  BarChart3,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useDiscoverStreams } from "@/features/stream/hooks/use-streams";
import type { StreamDiscoverItem } from "@/features/stream/api/stream.api";

function StreamCard({ stream }: { stream: StreamDiscoverItem }) {
  const isPrivate = stream.privacy === "private";

  return (
    <Link
      href={`/stream/${stream.id}`}
      className="relative overflow-hidden rounded-2xl bg-card-bg border border-border-primary shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full"
    >
      {/* Visual Header */}
      <div className="h-28 bg-gradient-to-br from-bg-tertiary to-bg-secondary relative overflow-hidden">
        {stream.banner_url && (
          <img
            src={stream.banner_url}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isPrivate ? (
            <span className="bg-black/30 backdrop-blur-sm text-white border border-white/10 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Private
            </span>
          ) : (
            <span className="bg-black/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
              <Globe className="h-2.5 w-2.5" /> Public
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-bg-tertiary/80 backdrop-blur-sm border border-border-primary px-2 py-1 rounded-lg flex items-center">
            <Users className="h-3 w-3 text-text-tertiary mr-1.5" />
            <span className="text-xs font-bold text-text-primary">
              {stream.follower_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="flex items-end -mt-8 mb-3 relative z-10">
          <div className="w-14 h-14 rounded-xl border-4 border-card-bg shadow-md bg-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {stream.avatar_url ? (
              <img
                src={stream.avatar_url}
                alt={stream.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-accent">
                {stream.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-base font-bold text-text-primary leading-tight group-hover:text-accent transition-colors">
            {stream.name}
          </h3>
          {stream.owner_display_name && (
            <p className="text-xs text-text-tertiary font-medium mt-0.5">
              by {stream.owner_display_name}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
            {stream.description || "No description provided."}
          </p>
        </div>

        {/* Tags */}
        {stream.tags && stream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {stream.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-accent-light text-accent text-[10px] font-bold rounded-full uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
            {stream.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-bg-tertiary text-text-tertiary text-[10px] font-bold rounded-full">
                +{stream.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <button className="flex-1 bg-card-bg border border-border-primary text-text-secondary py-2 rounded-lg text-xs font-bold hover:bg-bg-tertiary hover:text-text-primary transition-colors">
            Follow
          </button>
          <button className="flex-1 bg-text-primary text-bg-primary py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity flex items-center justify-center">
            <Copy className="h-3 w-3 mr-1.5" /> Copy
          </button>
        </div>
      </div>
    </Link>
  );
}

function StreamCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card-bg border border-border-primary overflow-hidden animate-pulse">
      <div className="h-28 bg-bg-tertiary" />
      <div className="px-5 pb-5 pt-4">
        <div className="w-14 h-14 rounded-xl bg-bg-tertiary mb-3 -mt-8" />
        <div className="h-4 bg-bg-tertiary rounded w-3/4 mb-2" />
        <div className="h-3 bg-bg-tertiary rounded w-1/2 mb-3" />
        <div className="h-8 bg-bg-tertiary rounded w-full mb-4" />
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-bg-tertiary rounded-lg" />
          <div className="flex-1 h-8 bg-bg-tertiary rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const discoverFilters = ["All", "Public", "Private"];

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: streams, isLoading, error } = useDiscoverStreams();

  const filteredStreams = (streams ?? []).filter((stream) => {
    const matchesFilter =
      activeFilter === "All" || stream.privacy === activeFilter.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === "" ||
      stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.owner_display_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      stream.tags?.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Discover Streams
          </h1>
          <p className="text-text-secondary mt-1">
            Explore trading streams. Follow or copy the best traders.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search streams or traders..."
              className="w-full bg-card-bg border border-border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-sm"
            />
          </div>
          <button className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors shadow-lg flex items-center whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" /> Create Stream
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {discoverFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              activeFilter === filter
                ? "bg-text-primary text-bg-primary border-text-primary shadow-md"
                : "bg-card-bg text-text-secondary border-border-primary hover:border-accent/30 hover:text-accent"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="h-12 w-12 text-danger mb-4 opacity-60" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Failed to load streams
          </h3>
          <p className="text-text-tertiary text-sm">
            Something went wrong. Please try again later.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <StreamCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <TrendingUp className="h-12 w-12 text-text-tertiary mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No streams found
          </h3>
          <p className="text-text-tertiary text-sm">
            {searchQuery
              ? `No results for "${searchQuery}".`
              : "No streams available right now."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}

          {/* Promo Card */}
          {/* <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-primary shadow-xl flex flex-col items-center justify-center p-8 text-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-14 w-14 bg-bg-tertiary rounded-full flex items-center justify-center mb-4 text-text-tertiary group-hover:text-text-primary group-hover:scale-110 transition-all">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h3 className="text-text-primary font-bold text-lg mb-2">
              Start Streaming
            </h3>
            <p className="text-text-secondary text-sm mb-6 max-w-[200px]">
              Share your trades, build a following, and earn from copiers.
            </p>
            <button className="bg-text-primary text-bg-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity">
              Apply Now
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
